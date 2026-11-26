export const CLUSTER_COLORS = [
  '#4F46E5', // Indigo
  '#0D9488', // Teal
  '#D97706', // Amber
  '#E11D48', // Rose
  '#7C3AED', // Violet
  '#0284C7'  // Sky
];

const round = (val, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(val * factor) / factor;
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildKMeansDataset(seedPoints = [], pointCount = 40) {
  if (!Array.isArray(seedPoints) || seedPoints.length === 0) return [];
  const targetCount = Math.max(seedPoints.length, Math.round(pointCount));
  const points = seedPoints.map((pt, idx) => ({
    id: pt.id ?? idx + 1,
    x: pt.x,
    y: pt.y,
    z: pt.z
  }));

  const rand = mulberry32(1337 + targetCount);
  const gaussian = () => {
    const u1 = Math.max(1e-6, rand());
    const u2 = rand();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };

  while (points.length < targetCount) {
    const anchor = seedPoints[points.length % seedPoints.length];
    points.push({
      id: points.length + 1,
      x: round(anchor.x + gaussian() * 0.45, 3),
      y: round(anchor.y + gaussian() * 0.45, 3),
      z: round(anchor.z + gaussian() * 0.45, 3)
    });
  }
  return points;
}

const dist3D = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

function runSingleKMeans(points, k, maxIterations) {
  const step = Math.max(1, Math.floor(points.length / k));
  let centroids = Array.from({ length: k }, (_, i) => {
    const pt = points[(i * step) % points.length];
    return {
      clusterId: i,
      x: round(pt.x + (i % 2 === 0 ? 0.65 : -0.65), 3),
      y: round(pt.y + (i % 3 === 0 ? -0.55 : 0.55), 3),
      z: round(pt.z + (i % 2 === 0 ? -0.5 : 0.5), 3)
    };
  });

  let finalInertia = 0;
  for (let it = 0; it < maxIterations; it++) {
    let inertia = 0;
    const counts = Array(k).fill(0);
    const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, z: 0 }));
    for (const pt of points) {
      let bestC = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist3D(pt, centroids[c]);
        if (d < bestD) {
          bestD = d;
          bestC = c;
        }
      }
      inertia += bestD * bestD;
      counts[bestC]++;
      sums[bestC].x += pt.x;
      sums[bestC].y += pt.y;
      sums[bestC].z += pt.z;
    }
    finalInertia = inertia;
    centroids = centroids.map((c, idx) =>
      counts[idx]
        ? { clusterId: idx, x: sums[idx].x / counts[idx], y: sums[idx].y / counts[idx], z: sums[idx].z / counts[idx] }
        : c
    );
  }
  return round(finalInertia, 2);
}

export function runKMeansHistory(seedPoints, params = {}) {
  const k = Math.min(6, Math.max(2, Math.round(Number(params.k ?? 3))));
  const pointCount = Math.round(Number(params.pointCount ?? 40));
  const maxIterations = Math.max(1, Math.round(Number(params.maxIterations ?? 8)));

  const points = buildKMeansDataset(seedPoints, pointCount);
  if (!points.length) return [];

  const elbowCurve = [1, 2, 3, 4, 5, 6].map((kv) => ({
    x: kv,
    y: runSingleKMeans(points, kv, 8)
  }));

  // Spread initial centroids offset from clusters so gliding animation is clearly visible
  let centroids = Array.from({ length: k }, (_, i) => ({
    clusterId: i,
    x: round(Math.cos((i * 2 * Math.PI) / k) * 2.2, 3),
    y: round(Math.sin((i * 2 * Math.PI) / k) * 2.2, 3),
    z: round((i % 2 === 0 ? 1 : -1) * 0.9, 3)
  }));

  const steps = [];
  for (let iter = 0; iter <= maxIterations; iter++) {
    let inertia = 0;
    const counts = Array(k).fill(0);
    const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, z: 0 }));
    const assignments = new Int16Array(points.length);
    const pointDistances = new Float32Array(points.length);
    const sampleRows = [];

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      let bestC = 0;
      let bestD = Infinity;
      const dists = [];
      for (let c = 0; c < k; c++) {
        const d = dist3D(pt, centroids[c]);
        dists.push(round(d, 2));
        if (d < bestD) {
          bestD = d;
          bestC = c;
        }
      }
      assignments[i] = bestC;
      pointDistances[i] = round(bestD, 3);
      inertia += bestD * bestD;
      counts[bestC]++;
      sums[bestC].x += pt.x;
      sums[bestC].y += pt.y;
      sums[bestC].z += pt.z;

      if (i < 8) {
        sampleRows.push([
          `#${pt.id}`,
          `(${round(pt.x, 1)}, ${round(pt.y, 1)}, ${round(pt.z, 1)})`,
          `[${dists.join(', ')}]`,
          `C${bestC + 1}`
        ]);
      }
    }

    const snapCentroids = centroids.map((c, idx) => ({
      ...c,
      count: counts[idx],
      color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
    }));

    const nextCentroids = centroids.map((c, idx) =>
      counts[idx] === 0
        ? { ...c }
        : {
            clusterId: idx,
            x: round(sums[idx].x / counts[idx], 3),
            y: round(sums[idx].y / counts[idx], 3),
            z: round(sums[idx].z / counts[idx], 3)
          }
    );

    const maxShift = Math.max(...centroids.map((c, idx) => dist3D(c, nextCentroids[idx])));
    const converged = iter > 0 && maxShift < 1e-4;

    steps.push({
      step: iter,
      phase: iter === 0 ? 'Initial Centroids' : converged ? 'Converged' : 'Assign & Glide',
      substitutionLatex: `J = \\sum_{k=1}^{${k}}\\sum_{\\mathbf{x}_i\\in C_k}\\|\\mathbf{x}_i-\\boldsymbol{\\mu}_k\\|^2 = ${round(
        inertia,
        2
      )}, \\quad \\Delta\\mu_{\\max} = ${round(maxShift, 3)}`,
      kpis: [
        { label: 'Clusters (K)', value: k, tone: 'indigo' },
        { label: 'Inertia (WCSS)', value: round(inertia, 2), tone: 'amber' },
        { label: 'Max Shift', value: round(maxShift, 3), tone: 'teal' },
        { label: 'Points', value: points.length, tone: 'slate' }
      ],
      table: {
        title: 'Sample 3D Point Distances to Centroids',
        headers: ['Pt', '(x, y, z)', 'd(x, μₖ)', 'Cluster'],
        rows: sampleRows
      },
      chartData: elbowCurve,
      viz: {
        kind: 'kmeans-3d',
        points,
        assignments: Array.from(assignments),
        pointDistances: Array.from(pointDistances),
        centroids: snapCentroids
      }
    });

    if (converged) break;
    centroids = nextCentroids;
  }

  return steps;
}
