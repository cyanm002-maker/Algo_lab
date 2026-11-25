/**
 * Pure client-side Linear Regression (Gradient Descent) math engine.
 * Executes with 0ms network latency so hyperparameter sliders and playback
 * scrubbers update at 60fps.
 */

const round = (val, digits = 4) => {
  const factor = 10 ** digits;
  return Math.round(val * factor) / factor;
};

/**
 * Computes predictions, residuals, MSE, and partial derivatives for a single state.
 */
export function evaluateLinearState(points, w, b) {
  const n = points.length;
  if (n === 0) {
    return {
      predictions: [],
      mse: 0,
      dw: 0,
      db: 0,
      r2: 0
    };
  }

  let sumSqErr = 0;
  let sumDw = 0;
  let sumDb = 0;
  let sumY = 0;

  const predictions = points.map((pt, idx) => {
    const yHat = w * pt.x + b;
    const error = yHat - pt.y;
    const sqError = error * error;

    sumSqErr += sqError;
    sumDw += error * pt.x;
    sumDb += error;
    sumY += pt.y;

    return {
      id: pt.id ?? idx + 1,
      x: round(pt.x, 3),
      y: round(pt.y, 3),
      yHat: round(yHat, 4),
      error: round(error, 4),
      sqError: round(sqError, 4)
    };
  });

  const mse = sumSqErr / n;
  const dw = (2 / n) * sumDw;
  const db = (2 / n) * sumDb;

  const meanY = sumY / n;
  let ssTot = 0;
  for (const pt of points) {
    ssTot += (pt.y - meanY) ** 2;
  }
  const r2 = ssTot > 1e-12 ? 1 - sumSqErr / ssTot : 1;

  return {
    predictions,
    mse: round(mse, 5),
    dw: round(dw, 5),
    db: round(db, 5),
    r2: round(r2, 4)
  };
}

/**
 * Generates the complete sequence of gradient descent states from step 0..maxIterations.
 */
export function runLinearRegressionHistory(points, params = {}) {
  const learningRate = Number(params.learningRate ?? 0.02);
  const maxIterations = Math.max(1, Math.round(Number(params.maxIterations ?? 30)));

  let w = 0;
  let b = 0;
  const steps = [];

  for (let iter = 0; iter <= maxIterations; iter++) {
    const evalState = evaluateLinearState(points, w, b);
    const nextW = w - learningRate * evalState.dw;
    const nextB = b - learningRate * evalState.db;

    steps.push({
      step: iter,
      phase: iter === 0 ? 'Initialization' : 'Gradient Step',
      w: round(w, 4),
      b: round(b, 4),
      learningRate,
      mse: evalState.mse,
      dw: evalState.dw,
      db: evalState.db,
      r2: evalState.r2,
      nextW: round(nextW, 4),
      nextB: round(nextB, 4),
      predictions: evalState.predictions,
      substitutionLatex: `\\hat{y} = ${round(w, 3)}x + ${round(b, 3)}, \\quad J = ${round(
        evalState.mse,
        4
      )}, \\quad w_{next} = ${round(w, 3)} - ${learningRate}(${round(evalState.dw, 3)}) = ${round(
        nextW,
        3
      )}`
    });

    // Guard against divergence if learning rate is extreme on custom points
    if (!Number.isFinite(nextW) || !Number.isFinite(nextB) || Math.abs(nextW) > 1e5) {
      break;
    }

    w = nextW;
    b = nextB;
  }

  return steps;
}
