/**
 * Pure client-side K-Means 3D Clustering math engine.
 * Computes Euclidean distances, E-step cluster assignments, M-step centroid updates,
 * and Within-Cluster Sum of Squares (Inertia) with 0ms network latency.
 */

export const CLUSTER_COLORS = [
  '#38bdf8', // sky-400
  '#f472b6', // pink-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#a78bfa', // violet-400
  '#fb7185'  // rose-400
];

const round = (val, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(val * factor) / factor;
};

/**
 * Deterministic PRNG (Mulberry32) so 3D point clouds stay reproducible across renders.
 */
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Expands the concrete seed dataset to `pointCount` 3D points deterministically.
 */
export function buildKMeansDataset(seedPoints = [], pointCount = 120) {
  if (!Array.isArray(seedPoints) || seedPoints.length === 0) {
    return [];
  }

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

export function euclideanDistance3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Initializes K centroids spread deterministically across the dataset.
 */
function initializeCentroids(points, k) {
  const centroids = [];
  const step = Math.max(1, Math.floor(points.length / k));
  for (let i = 0; i < k; i++) {
    const pt = points[(i * step) % points.length];
    centroids.push({
      clusterId: i,
      x: round(pt.x + (i % 2 === 0 ? 0.35 : -0.35), 3),
      y: round(pt.y + (i % 3 === 0 ? -0.3 : 0.3), 3),
      z: round(pt.z + (i % 2 === 0 ? -0.25 : 0.25), 3)
    });
  }
  return centroids;
}

/**
 * Precomputes Lloyd's K-Means steps (0..maxIterations) for instant playback.
 */
export function runKMeansHistory(seedPoints, params = {}) {
  const k = Math.min(6, Math.max(2, Math.round(Number(params.k ?? 3))));
  const pointCount = Math.round(Number(params.pointCount ?? 120));
  const maxIterations = Math.max(1, Math.round(Number(params.maxIterations ?? 10)));

  const points = buildKMeansDataset(seedPoints, pointCount);
  if (points.length === 0) return [];

  let centroids = initializeCentroids(points, k);
  const steps = [];

  for (let iter = 0; iter <= maxIterations; iter++) {
    let inertia = 0;
    const clusterCounts = Array(k).fill(0);
    const clusterSums = Array.from({ length: k }, () => ({ x: 0, y: 0, z: 0 }));

    const assignments = new Int16Array(points.length);
    const sampleDistances = [];

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      let bestCluster = 0;
      let bestDist = Infinity;
      const dists = [];

      for (let c = 0; c < k; c++) {
        const d = euclideanDistance3D(pt, centroids[c]);
        dists.push(round(d, 3));
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }

      assignments[i] = bestCluster;
      inertia += bestDist * bestDist;
      clusterCounts[bestCluster] += 1;
      clusterSums[bestCluster].x += pt.x;
      clusterSums[bestCluster].y += pt.y;
      clusterSums[bestCluster].z += pt.z;

      if (i < 8) {
        sampleDistances.push({
          id: pt.id,
          x: round(pt.x, 2),
          y: round(pt.y, 2),
          z: round(pt.z, 2),
          distances: dists,
          assignedCluster: bestCluster,
          minDist: round(bestDist, 3)
        });
      }
    }

    const snapshotCentroids = centroids.map((c, idx) => ({
      ...c,
      count: clusterCounts[idx],
      color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
    }));

    const nextCentroids = centroids.map((c, idx) => {
      const count = clusterCounts[idx];
      if (count === 0) return { ...c };
      return {
        clusterId: idx,
        x: round(clusterSums[idx].x / count, 3),
        y: round(clusterSums[idx].y / count, 3),
        z: round(clusterSums[idx].z / count, 3)
      };
    });

    const maxShift = Math.max(
      ...centroids.map((c, idx) => euclideanDistance3D(c, nextCentroids[idx]))
    );
    const converged = iter > 0 && maxShift < 1e-4;

    steps.push({
      step: iter,
      phase:
        iter === 0
          ? 'Initial Centroids'
          : converged
          ? 'Converged'
          : 'Assign & Update',
      k,
      points,
      assignments: Array.from(assignments),
      centroids: snapshotCentroids,
      inertia: round(inertia, 3),
      maxShift: round(maxShift, 4),
      converged,
      sampleDistances,
      substitutionLatex: `J = \\sum_{k=1}^{${k}} \\sum_{\\mathbf{x}_i \\in C_k} \\|\\mathbf{x}_i - \\boldsymbol{\\mu}_k\\|^2 = ${round(
        inertia,
        2
      )}, \\quad \\Delta\\mu_{\\max} = ${round(maxShift, 4)}`
    });

    if (converged) break;
    centroids = nextCentroids;
  }

  return steps;
}
