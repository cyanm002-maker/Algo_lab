const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

function matVec(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]
  ];
}

function norm(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
}

function powerIteration(M, init = [1, 0.5, 0.2]) {
  let v = [...init];
  for (let i = 0; i < 40; i++) {
    const mv = matVec(M, v);
    const n = norm(mv);
    v = [mv[0] / n, mv[1] / n, mv[2] / n];
  }
  const mv = matVec(M, v);
  const eigval = v[0] * mv[0] + v[1] * mv[1] + v[2] * mv[2];
  return { eigval: Math.max(0, eigval), eigvec: v };
}

export function runPcaHistory(points = [], params = {}) {
  const targetAlpha = Number(params.projectionAlpha ?? 0);
  if (!points.length) return [];

  const n = points.length;
  const mean = {
    x: points.reduce((a, p) => a + p.x, 0) / n,
    y: points.reduce((a, p) => a + p.y, 0) / n,
    z: points.reduce((a, p) => a + p.z, 0) / n
  };

  const centered = points.map((p) => [p.x - mean.x, p.y - mean.y, p.z - mean.z]);
  const cov = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (const c of centered) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        cov[i][j] += (c[i] * c[j]) / Math.max(1, n - 1);
      }
    }
  }

  const pc1 = powerIteration(cov, [1, 0.6, 0.4]);
  const covDeflated = cov.map((row, i) =>
    row.map((val, j) => val - pc1.eigval * pc1.eigvec[i] * pc1.eigvec[j])
  );
  const pc2 = powerIteration(covDeflated, [-0.4, 1, 0.2]);
  const trace = cov[0][0] + cov[1][1] + cov[2][2];
  const l3 = Math.max(0, trace - pc1.eigval - pc2.eigval);
  const totalVar = Math.max(1e-6, pc1.eigval + pc2.eigval + l3);

  const screeChart = [
    { name: 'PC1', value: round((pc1.eigval / totalVar) * 100, 1) },
    { name: 'PC2', value: round((pc2.eigval / totalVar) * 100, 1) },
    { name: 'PC3', value: round((l3 / totalVar) * 100, 1) }
  ];

  // PC3 normal vector = cross(pc1, pc2)
  const v1 = pc1.eigvec;
  const v2 = pc2.eigvec;
  const v3 = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0]
  ];

  const steps = [];
  for (let s = 0; s <= 10; s++) {
    const alpha = s === 0 && targetAlpha > 0 ? targetAlpha : s / 10;
    const projectedPts = centered.map((c, idx) => {
      const dot3 = c[0] * v3[0] + c[1] * v3[1] + c[2] * v3[2];
      return {
        id: points[idx].id ?? idx + 1,
        x: round(c[0] - alpha * dot3 * v3[0], 3),
        y: round(c[1] - alpha * dot3 * v3[1], 3),
        z: round(c[2] - alpha * dot3 * v3[2], 3),
        pc1Score: round(c[0] * v1[0] + c[1] * v1[1] + c[2] * v1[2], 2),
        pc2Score: round(c[0] * v2[0] + c[1] * v2[1] + c[2] * v2[2], 2)
      };
    });

    steps.push({
      step: s,
      phase: alpha === 0 ? '3D Original Cloud' : alpha >= 1 ? '2D Subspace (PC1–PC2)' : 'Projecting...',
      substitutionLatex: `\\text{EVR}_{1+2} = ${round(
        ((pc1.eigval + pc2.eigval) / totalVar) * 100,
        1
      )}\\%, \\quad \\alpha_{\\text{proj}} = ${round(alpha, 2)}`,
      kpis: [
        { label: 'PC1 Var', value: `${screeChart[0].value}%`, tone: 'indigo' },
        { label: 'PC2 Var', value: `${screeChart[1].value}%`, tone: 'teal' },
        { label: 'Retained (2D)', value: `${round(screeChart[0].value + screeChart[1].value, 1)}%`, tone: 'amber' },
        { label: 'Projection', value: `${Math.round(alpha * 100)}%`, tone: 'slate' }
      ],
      table: {
        title: 'Principal Component Coordinates',
        headers: ['Pt', 'PC1 Score', 'PC2 Score'],
        rows: projectedPts.slice(0, 8).map((p) => [`#${p.id}`, p.pc1Score, p.pc2Score])
      },
      chartData: screeChart,
      viz: {
        kind: 'pca-3d',
        points: projectedPts,
        pc1: v1,
        pc2: v2,
        pc3: v3,
        alpha
      }
    });
  }

  return steps;
}
