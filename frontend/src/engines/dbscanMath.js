const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
const dist2D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function runDbscanHistory(points = [], params = {}) {
  const eps = Number(params.epsilon ?? 1.1);
  const minPts = Math.max(2, Math.round(Number(params.minPts ?? 3)));
  if (!points.length) return [];

  // K-distance plot (sorted distance to minPts-th nearest neighbor)
  const kDistances = points
    .map((p, i) => {
      const ds = points
        .filter((_, j) => j !== i)
        .map((q) => dist2D(p, q))
        .sort((a, b) => a - b);
      return ds[Math.min(minPts - 1, ds.length - 1)] || 0;
    })
    .sort((a, b) => a - b)
    .map((d, idx) => ({ x: idx + 1, y: round(d, 3) }));

  const labels = Array(points.length).fill(-1); // -1 = noise
  const roles = Array(points.length).fill('noise');
  const visited = Array(points.length).fill(false);

  const regionQuery = (idx) =>
    points.reduce((acc, q, j) => {
      if (dist2D(points[idx], q) <= eps) acc.push(j);
      return acc;
    }, []);

  let clusterId = 0;
  for (let i = 0; i < points.length; i++) {
    if (visited[i]) continue;
    visited[i] = true;
    const neighbors = regionQuery(i);
    if (neighbors.length < minPts) continue;

    roles[i] = 'core';
    labels[i] = clusterId;
    const queue = [...neighbors];
    while (queue.length > 0) {
      const qIdx = queue.shift();
      if (!visited[qIdx]) {
        visited[qIdx] = true;
        const qNbrs = regionQuery(qIdx);
        if (qNbrs.length >= minPts) {
          roles[qIdx] = 'core';
          for (const n of qNbrs) {
            if (!queue.includes(n)) queue.push(n);
          }
        } else if (roles[qIdx] !== 'core') {
          roles[qIdx] = 'border';
        }
      }
      if (labels[qIdx] === -1) {
        labels[qIdx] = clusterId;
        if (roles[qIdx] === 'noise') roles[qIdx] = 'border';
      }
    }
    clusterId++;
  }

  const coreCount = roles.filter((r) => r === 'core').length;
  const noiseCount = roles.filter((r) => r === 'noise').length;

  return [
    {
      step: 0,
      phase: `Discovered ${clusterId} Cluster(s)`,
      substitutionLatex: `|N_{${eps}}(p)| \\ge ${minPts} \\implies \\text{Core}: ${coreCount},\\; \\text{Noise}: ${noiseCount}`,
      kpis: [
        { label: 'Clusters', value: clusterId, tone: 'teal' },
        { label: 'Core Points', value: coreCount, tone: 'indigo' },
        { label: 'Noise Outliers', value: noiseCount, tone: 'rose' },
        { label: 'Radius ε', value: eps, tone: 'amber' }
      ],
      table: {
        title: `Density Classification (ε = ${eps}, minPts = ${minPts})`,
        headers: ['Pt', '(x, y)', 'Neighbors', 'Role', 'Cluster'],
        rows: points.map((p, i) => [
          `#${p.id}`,
          `(${p.x}, ${p.y})`,
          regionQuery(i).length,
          roles[i],
          labels[i] === -1 ? 'Noise' : `C${labels[i] + 1}`
        ])
      },
      chartData: kDistances,
      viz: {
        kind: 'dbscan',
        points,
        labels,
        roles,
        eps
      }
    }
  ];
}
