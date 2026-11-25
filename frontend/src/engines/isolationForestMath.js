const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const cFactor = (n) => {
  if (n <= 1) return 0;
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n;
};

function buildIsoTree(pts, depth, maxDepth, rand, splitsOut, bounds) {
  if (depth >= maxDepth || pts.length <= 1) {
    return pts.map((p) => ({ id: p.id, depth: depth + cFactor(pts.length) }));
  }
  const feat = rand() > 0.5 ? 'x' : 'y';
  const vals = pts.map((p) => p[feat]);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  if (maxV - minV < 1e-6) {
    return pts.map((p) => ({ id: p.id, depth: depth + cFactor(pts.length) }));
  }

  const splitVal = minV + rand() * (maxV - minV);
  if (splitsOut && depth < 3) {
    splitsOut.push({ feat, val: round(splitVal, 2), bounds: { ...bounds } });
  }

  const left = pts.filter((p) => p[feat] < splitVal);
  const right = pts.filter((p) => p[feat] >= splitVal);
  const bLeft = feat === 'x' ? { ...bounds, xMax: splitVal } : { ...bounds, yMax: splitVal };
  const bRight = feat === 'x' ? { ...bounds, xMin: splitVal } : { ...bounds, yMin: splitVal };

  return [
    ...buildIsoTree(left, depth + 1, maxDepth, rand, splitsOut, bLeft),
    ...buildIsoTree(right, depth + 1, maxDepth, rand, splitsOut, bRight)
  ];
}

export function runIsolationForestHistory(points = [], params = {}) {
  const nTrees = Math.min(40, Math.max(5, Math.round(Number(params.nTrees ?? 15))));
  const threshold = Number(params.contamination ?? 0.58);
  if (!points.length) return [];

  const depthSums = new Map(points.map((p) => [p.id, 0]));
  const sampleSplits = [];

  for (let t = 0; t < nTrees; t++) {
    const rand = mulberry32(42 + t * 97);
    const leaves = buildIsoTree(
      points,
      0,
      Math.ceil(Math.log2(points.length)) + 1,
      rand,
      t === 0 ? sampleSplits : null,
      { xMin: 0, xMax: 10, yMin: 0, yMax: 10 }
    );
    for (const leaf of leaves) {
      depthSums.set(leaf.id, (depthSums.get(leaf.id) || 0) + leaf.depth);
    }
  }

  const cn = Math.max(1, cFactor(points.length));
  const scored = points.map((p) => {
    const avgDepth = (depthSums.get(p.id) || 1) / nTrees;
    const score = 2 ** (-avgDepth / cn);
    return {
      ...p,
      avgDepth: round(avgDepth, 2),
      score: round(score, 3),
      isAnomaly: score >= threshold
    };
  });

  // Histogram buckets
  const buckets = [
    { name: '0.3–0.4', min: 0.0, max: 0.4, count: 0 },
    { name: '0.4–0.5', min: 0.4, max: 0.5, count: 0 },
    { name: '0.5–0.6', min: 0.5, max: 0.6, count: 0 },
    { name: '0.6–0.7', min: 0.6, max: 0.7, count: 0 },
    { name: '0.7+', min: 0.7, max: 1.1, count: 0 }
  ];
  for (const s of scored) {
    const b = buckets.find((bk) => s.score >= bk.min && s.score < bk.max);
    if (b) b.count++;
  }

  const anomalyCount = scored.filter((s) => s.isAnomaly).length;

  return [
    {
      step: 0,
      phase: `Isolated ${anomalyCount} Outlier(s)`,
      substitutionLatex: `s(x, n) = 2^{-\\frac{E(h(x))}{c(${points.length})}} \\ge ${threshold} \\implies \\text{Anomaly}`,
      kpis: [
        { label: 'Trees (t)', value: nTrees, tone: 'indigo' },
        { label: 'Outliers', value: anomalyCount, tone: 'rose' },
        { label: 'Inliers', value: points.length - anomalyCount, tone: 'teal' },
        { label: 'Cutoff', value: threshold, tone: 'amber' }
      ],
      table: {
        title: 'Path Depth & Anomaly Scores',
        headers: ['Pt', '(x, y)', 'Avg Depth', 'Score s', 'Status'],
        rows: scored
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((s) => [
            `#${s.id}`,
            `(${s.x}, ${s.y})`,
            s.avgDepth,
            s.score,
            s.isAnomaly ? 'Outlier' : 'Normal'
          ])
      },
      chartData: buckets.map((b) => ({ name: b.name, value: b.count })),
      viz: {
        kind: 'isolation-forest',
        points: scored,
        splits: sampleSplits
      }
    }
  ];
}
