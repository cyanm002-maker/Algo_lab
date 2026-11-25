const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

function gini(pts) {
  if (!pts.length) return 0;
  const p1 = pts.filter((p) => p.label === 1).length / pts.length;
  const p0 = 1 - p1;
  return 1 - p0 * p0 - p1 * p1;
}

function findBestSplit(pts) {
  const parentGini = gini(pts);
  let best = { gain: 0, feature: 'x', threshold: 5, left: pts, right: [] };

  for (const feature of ['x', 'y']) {
    const vals = [...new Set(pts.map((p) => p[feature]))].sort((a, b) => a - b);
    for (let i = 0; i < vals.length - 1; i++) {
      const thresh = (vals[i] + vals[i + 1]) / 2;
      const left = pts.filter((p) => p[feature] <= thresh);
      const right = pts.filter((p) => p[feature] > thresh);
      const weighted =
        (left.length / pts.length) * gini(left) + (right.length / pts.length) * gini(right);
      const gain = parentGini - weighted;
      if (gain > best.gain) {
        best = { gain, feature, threshold: round(thresh, 2), left, right };
      }
    }
  }
  return best;
}

export function runDecisionTreeHistory(points = [], params = {}) {
  const maxDepth = Math.min(4, Math.max(1, Math.round(Number(params.maxDepth ?? 2))));
  if (!points.length) return [];

  const splits = [];
  const regions = [];
  const featGain = { x: 0, y: 0 };

  function build(pts, depth, bounds) {
    const g = gini(pts);
    const c1 = pts.filter((p) => p.label === 1).length;
    const pred = c1 >= pts.length - c1 ? 1 : 0;

    if (depth >= maxDepth || g < 1e-6 || pts.length < 2) {
      regions.push({ ...bounds, pred, count: pts.length, gini: round(g, 3) });
      return;
    }

    const best = findBestSplit(pts);
    if (best.gain <= 1e-6) {
      regions.push({ ...bounds, pred, count: pts.length, gini: round(g, 3) });
      return;
    }

    featGain[best.feature] += best.gain * pts.length;
    splits.push({
      depth,
      feature: best.feature,
      threshold: best.threshold,
      gain: round(best.gain, 3),
      bounds: { ...bounds }
    });

    if (best.feature === 'x') {
      build(best.left, depth + 1, { ...bounds, xMax: best.threshold });
      build(best.right, depth + 1, { ...bounds, xMin: best.threshold });
    } else {
      build(best.left, depth + 1, { ...bounds, yMax: best.threshold });
      build(best.right, depth + 1, { ...bounds, yMin: best.threshold });
    }
  }

  build(points, 0, { xMin: 0, xMax: 10, yMin: 0, yMax: 10 });

  const totalGain = Math.max(1e-6, featGain.x + featGain.y);
  const importanceChart = [
    { name: 'Feature x₁', value: round((featGain.x / totalGain) * 100, 1) },
    { name: 'Feature x₂', value: round((featGain.y / totalGain) * 100, 1) }
  ];

  const steps = [];
  for (let s = 0; s <= splits.length; s++) {
    const activeSplits = splits.slice(0, s);
    const latest = activeSplits[activeSplits.length - 1];
    steps.push({
      step: s,
      phase: s === 0 ? 'Root Node' : `Split #${s} (${latest.feature} ≤ ${latest.threshold})`,
      substitutionLatex: latest
        ? `\\Delta G = ${latest.gain} \\quad \\text{at } ${latest.feature} \\le ${latest.threshold}`
        : `G(\\text{Root}) = ${round(gini(points), 3)}`,
      kpis: [
        { label: 'Max Depth', value: maxDepth, tone: 'indigo' },
        { label: 'Active Splits', value: s, tone: 'teal' },
        { label: 'Leaf Regions', value: s === splits.length ? regions.length : s + 1, tone: 'amber' },
        { label: 'Root Gini', value: round(gini(points), 3), tone: 'rose' }
      ],
      table: {
        title: 'CART Split Hierarchy',
        headers: ['Split', 'Rule', 'Gini Gain'],
        rows: activeSplits.map((sp, i) => [i + 1, `${sp.feature} ≤ ${sp.threshold}`, sp.gain])
      },
      chartData: importanceChart,
      viz: {
        kind: 'decision-tree',
        points,
        splits: activeSplits,
        regions: s === splits.length ? regions : []
      }
    });
  }

  return steps;
}
