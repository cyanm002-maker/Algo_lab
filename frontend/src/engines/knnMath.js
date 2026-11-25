const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function runKnnHistory(points = [], params = {}, viewMode = '2d') {
  const k = Math.min(points.length, Math.max(1, Math.round(Number(params.k ?? 5))));
  const query = params.queryPoint || { x: 4.4, y: 4.6, z: 0.1 };
  if (!points.length) return [];

  const is3D = viewMode === '3d';
  const distFn = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = is3D ? (a.z ?? 0) - (b.z ?? 0) : 0;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // LOOCV Accuracy vs K curve
  const kCurve = [];
  for (let kv = 1; kv <= Math.min(13, points.length - 1); kv += 2) {
    let hits = 0;
    for (let i = 0; i < points.length; i++) {
      const nbrs = points
        .filter((_, j) => j !== i)
        .map((p) => ({ d: distFn(points[i], p), label: p.label }))
        .sort((a, b) => a.d - b.d)
        .slice(0, kv);
      const votes1 = nbrs.filter((n) => n.label === 1).length;
      const pred = votes1 > kv / 2 ? 1 : 0;
      if (pred === points[i].label) hits++;
    }
    kCurve.push({ x: kv, y: round((hits / points.length) * 100, 1) });
  }

  const ranked = points
    .map((p, idx) => ({
      ...p,
      id: p.id ?? idx + 1,
      dist: distFn(query, p)
    }))
    .sort((a, b) => a.dist - b.dist);

  const steps = [];
  for (let stepK = 1; stepK <= k; stepK++) {
    const neighbors = ranked.slice(0, stepK);
    const radius = neighbors[neighbors.length - 1].dist;
    const c1 = neighbors.filter((n) => n.label === 1).length;
    const c0 = stepK - c1;
    const predicted = c1 > c0 ? 1 : 0;

    steps.push({
      step: stepK - 1,
      phase: `Evaluate K = ${stepK}`,
      substitutionLatex: `\\hat{y}(\\mathbf{q}) = \\text{Class } ${predicted} \\quad (C_0=${c0},\\; C_1=${c1},\\; r=${round(
        radius,
        2
      )})`,
      kpis: [
        { label: 'Active K', value: stepK, tone: 'indigo' },
        { label: 'Predicted Class', value: `Class ${predicted}`, tone: 'teal' },
        { label: 'Neighborhood r', value: round(radius, 3), tone: 'amber' },
        { label: 'Vote Split', value: `${c0} vs ${c1}`, tone: 'slate' }
      ],
      table: {
        title: `Nearest ${stepK} Neighbor(s) to (${round(query.x, 1)}, ${round(query.y, 1)})`,
        headers: ['Rank', 'Pt', 'Class', 'Distance'],
        rows: neighbors.map((n, idx) => [idx + 1, `#${n.id}`, `C${n.label}`, round(n.dist, 3)])
      },
      chartData: kCurve,
      viz: {
        kind: is3D ? 'knn-3d' : 'knn-2d',
        points,
        query,
        neighbors,
        radius,
        predicted
      }
    });
  }

  return steps;
}
