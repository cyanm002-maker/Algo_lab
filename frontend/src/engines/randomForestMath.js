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

function trainStumpEnsemble(points, nTrees) {
  const trees = [];
  for (let t = 0; t < nTrees; t++) {
    const rand = mulberry32(101 + t * 37);
    const sample = Array.from({ length: points.length }, () => points[Math.floor(rand() * points.length)]);
    const feature = rand() > 0.45 ? 'x' : 'y';
    const sorted = [...sample].sort((a, b) => a[feature] - b[feature]);
    let bestAcc = -1;
    let bestThresh = 5;
    let leftLabel = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
      const thresh = (sorted[i][feature] + sorted[i + 1][feature]) / 2;
      for (const lLab of [0, 1]) {
        const hits = sample.filter((p) => (p[feature] <= thresh ? lLab : 1 - lLab) === p.label).length;
        if (hits > bestAcc) {
          bestAcc = hits;
          bestThresh = thresh;
          leftLabel = lLab;
        }
      }
    }
    trees.push({ feature, threshold: round(bestThresh, 2), leftLabel });
  }
  return trees;
}

export function runRandomForestHistory(points = [], params = {}) {
  const nEstimators = Math.min(25, Math.max(1, Math.round(Number(params.nEstimators ?? 9))));
  if (!points.length) return [];

  const allTrees = trainStumpEnsemble(points, nEstimators);
  const oobCurve = [];
  const steps = [];

  for (let b = 1; b <= nEstimators; b += b === nEstimators || b % 2 === 1 ? 1 : 1) {
    const subset = allTrees.slice(0, b);
    let errors = 0;
    const rows = points.slice(0, 8).map((pt) => {
      const votes1 = subset.reduce(
        (acc, tr) => acc + (pt[tr.feature] <= tr.threshold ? tr.leftLabel : 1 - tr.leftLabel),
        0
      );
      const prob = votes1 / b;
      const pred = prob >= 0.5 ? 1 : 0;
      if (pred !== pt.label) errors++;
      return [`#${pt.id}`, pt.label, round(prob, 2), pred];
    });

    const fullErr =
      points.filter((pt) => {
        const v1 = subset.reduce(
          (acc, tr) => acc + (pt[tr.feature] <= tr.threshold ? tr.leftLabel : 1 - tr.leftLabel),
          0
        );
        return (v1 / b >= 0.5 ? 1 : 0) !== pt.label;
      }).length / points.length;

    const oobErr = round(fullErr * 100, 1);
    oobCurve.push({ x: b, y: oobErr });

    // 10x10 heatmap probability grid
    const grid = [];
    for (let gx = 0.5; gx <= 9.5; gx += 1.0) {
      for (let gy = 0.5; gy <= 9.5; gy += 1.0) {
        const v1 = subset.reduce(
          (acc, tr) => acc + ((tr.feature === 'x' ? gx : gy) <= tr.threshold ? tr.leftLabel : 1 - tr.leftLabel),
          0
        );
        grid.push({ x: gx, y: gy, prob: v1 / b });
      }
    }

    steps.push({
      step: steps.length,
      phase: `Ensemble (${b} Tree${b > 1 ? 's' : ''})`,
      substitutionLatex: `\\hat{y}(\\mathbf{x}) = \\text{round}\\left(\\frac{1}{${b}}\\sum_{t=1}^{${b}} T_t(\\mathbf{x})\\right)`,
      kpis: [
        { label: 'Trees (B)', value: b, tone: 'indigo' },
        { label: 'OOB Error', value: `${oobErr}%`, tone: 'rose' },
        { label: 'Accuracy', value: `${round(100 - oobErr, 1)}%`, tone: 'teal' },
        { label: 'Ensemble Var', value: round(0.25 / Math.sqrt(b), 3), tone: 'amber' }
      ],
      table: {
        title: `Majority Vote Breakdown (B = ${b})`,
        headers: ['Pt', 'True y', 'P(y=1)', 'Pred'],
        rows
      },
      chartData: oobCurve.map((c) => ({ ...c })),
      viz: {
        kind: 'random-forest',
        points,
        grid
      }
    });
  }

  return steps;
}
