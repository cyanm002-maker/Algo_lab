const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;
const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-25, Math.min(25, z))));

function computeRocCurve(points, w1, w2, b) {
  const scored = points.map((p) => ({
    prob: sigmoid(w1 * p.x + w2 * p.y + b),
    label: p.label ?? 0
  }));
  const P = Math.max(1, scored.filter((s) => s.label === 1).length);
  const N = Math.max(1, scored.filter((s) => s.label === 0).length);

  const roc = [];
  for (let t = 1.0; t >= 0.0; t -= 0.05) {
    let tp = 0;
    let fp = 0;
    for (const s of scored) {
      if (s.prob >= t) {
        if (s.label === 1) tp++;
        else fp++;
      }
    }
    roc.push({ x: round(fp / N, 3), y: round(tp / P, 3) });
  }
  roc.sort((a, b) => a.x - b.x || a.y - b.y);

  let auc = 0;
  for (let i = 1; i < roc.length; i++) {
    auc += ((roc[i].x - roc[i - 1].x) * (roc[i].y + roc[i - 1].y)) / 2;
  }
  return { roc, auc: round(auc, 3) };
}

export function runLogisticRegressionHistory(points = [], params = {}) {
  const lr = Number(params.learningRate ?? 0.25);
  const threshold = Number(params.threshold ?? 0.5);
  const maxIter = Math.max(5, Math.round(Number(params.maxIterations ?? 30)));
  if (!points.length) return [];

  let w1 = 0.05;
  let w2 = 0.05;
  let b = -0.2;
  const steps = [];

  for (let iter = 0; iter <= maxIter; iter++) {
    let loss = 0;
    let dw1 = 0;
    let dw2 = 0;
    let db = 0;
    let correct = 0;

    const rows = points.map((pt, idx) => {
      const z = w1 * pt.x + w2 * pt.y + b;
      const p = sigmoid(z);
      const y = pt.label ?? 0;
      const pred = p >= threshold ? 1 : 0;
      if (pred === y) correct++;

      loss += -(y * Math.log(Math.max(1e-7, p)) + (1 - y) * Math.log(Math.max(1e-7, 1 - p)));
      const err = p - y;
      dw1 += err * pt.x;
      dw2 += err * pt.y;
      db += err;

      return [pt.id ?? idx + 1, y, round(z, 2), round(p, 3), pred];
    });

    const n = points.length;
    loss /= n;
    const acc = round((correct / n) * 100, 1);
    const { roc, auc } = computeRocCurve(points, w1, w2, b);

    steps.push({
      step: iter,
      phase: iter === 0 ? 'Initial Boundary' : 'Cross-Entropy Step',
      substitutionLatex: `\\sigma(${round(w1, 2)}x_1 + ${round(w2, 2)}x_2 + ${round(b, 2)}) \\ge ${threshold}, \\quad \\text{AUC} = ${auc}`,
      kpis: [
        { label: 'BCE Loss', value: round(loss, 4), tone: 'rose' },
        { label: 'Accuracy', value: `${acc}%`, tone: 'teal' },
        { label: 'ROC-AUC', value: auc, tone: 'indigo' },
        { label: 'Threshold (τ)', value: threshold, tone: 'amber' }
      ],
      table: {
        title: `Predicted Probabilities (τ = ${threshold})`,
        headers: ['i', 'True y', 'Logit z', 'P(y=1)', 'Pred'],
        rows
      },
      chartData: roc,
      viz: {
        kind: 'logistic-regression',
        points,
        w1,
        w2,
        b,
        threshold
      }
    });

    w1 -= (lr * dw1) / n;
    w2 -= (lr * dw2) / n;
    b -= (lr * db) / n;
  }

  return steps;
}
