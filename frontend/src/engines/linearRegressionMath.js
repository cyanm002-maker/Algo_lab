const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;

export function evaluateLinearState(points, w, b) {
  const n = points.length;
  if (!n) return { rows: [], mse: 0, dw: 0, db: 0, r2: 0 };

  let sumSq = 0;
  let sumDw = 0;
  let sumDb = 0;
  let sumY = 0;

  const rows = points.map((pt, idx) => {
    const yHat = w * pt.x + b;
    const err = yHat - pt.y;
    const sq = err * err;
    sumSq += sq;
    sumDw += err * pt.x;
    sumDb += err;
    sumY += pt.y;
    return [pt.id ?? idx + 1, round(pt.x, 2), round(pt.y, 2), round(yHat, 3), round(err, 3), round(sq, 3)];
  });

  const mse = sumSq / n;
  const dw = (2 / n) * sumDw;
  const db = (2 / n) * sumDb;
  const meanY = sumY / n;
  const ssTot = points.reduce((acc, p) => acc + (p.y - meanY) ** 2, 0);
  const r2 = ssTot > 1e-12 ? 1 - sumSq / ssTot : 1;

  return { rows, mse: round(mse, 4), dw: round(dw, 4), db: round(db, 4), r2: round(r2, 4) };
}

export function runLinearRegressionHistory(points = [], params = {}) {
  const lr = Number(params.learningRate ?? 0.02);
  const maxIter = Math.max(2, Math.round(Number(params.maxIterations ?? 25)));
  const manualOverride = params.manualW !== undefined && params.manualB !== undefined;

  let w = 0;
  let b = 0;
  const steps = [];
  const lossCurve = [];

  for (let i = 0; i <= maxIter; i++) {
    const activeW = manualOverride && i === maxIter ? Number(params.manualW) : w;
    const activeB = manualOverride && i === maxIter ? Number(params.manualB) : b;
    const ev = evaluateLinearState(points, activeW, activeB);
    lossCurve.push({ x: i, y: ev.mse });

    steps.push({
      step: i,
      phase: i === 0 ? 'Initialization' : 'Gradient Step',
      substitutionLatex: `\\hat{y} = ${round(activeW, 3)}x + ${round(activeB, 3)}, \\quad J = ${ev.mse}, \\quad \\nabla_w J = ${ev.dw}`,
      kpis: [
        { label: 'Slope (w)', value: round(activeW, 3), tone: 'indigo' },
        { label: 'Intercept (b)', value: round(activeB, 3), tone: 'indigo' },
        { label: 'MSE Loss', value: ev.mse, tone: 'rose' },
        { label: 'R² Fit', value: ev.r2, tone: 'teal' }
      ],
      table: {
        title: `Point Residuals (n = ${points.length})`,
        headers: ['i', 'x', 'y', 'ŷ', 'ŷ - y', 'SqErr'],
        rows: ev.rows
      },
      chartData: lossCurve.map((pt) => ({ ...pt })),
      viz: {
        kind: 'linear-regression',
        points,
        w: round(activeW, 4),
        b: round(activeB, 4)
      }
    });

    const nextW = w - lr * ev.dw;
    const nextB = b - lr * ev.db;
    if (!Number.isFinite(nextW) || Math.abs(nextW) > 1e4) break;
    w = nextW;
    b = nextB;
  }

  return steps;
}
