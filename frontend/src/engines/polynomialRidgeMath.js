const round = (v, d = 4) => Math.round(v * 10 ** d) / 10 ** d;

function solveLinearSystem(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const diag = Math.abs(M[col][col]) < 1e-10 ? 1e-10 : M[col][col];
    for (let j = col; j <= n; j++) M[col][j] /= diag;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let j = col; j <= n; j++) M[r][j] -= factor * M[col][j];
    }
  }
  return M.map((row) => row[n]);
}

function fitPolyRidge(points, degree, lambda) {
  const p = degree + 1;
  const X = points.map((pt) => {
    const xNorm = (pt.x - 4.75) / 3.0;
    return Array.from({ length: p }, (_, d) => xNorm ** d);
  });

  const XtX = Array.from({ length: p }, () => Array(p).fill(0));
  const XtY = Array(p).fill(0);

  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < p; j++) {
      XtY[j] += X[i][j] * points[i].y;
      for (let k = 0; k < p; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  for (let j = 1; j < p; j++) {
    XtX[j][j] += lambda;
  }

  const weights = solveLinearSystem(XtX, XtY);
  const predict = (x) => {
    const xNorm = (x - 4.75) / 3.0;
    return weights.reduce((acc, w, d) => acc + w * xNorm ** d, 0);
  };
  return { weights, predict };
}

export function runPolynomialRidgeHistory(points = [], params = {}) {
  const targetDegree = Math.min(8, Math.max(1, Math.round(Number(params.degree ?? 3))));
  const lambda = Number(params.lambda ?? 0.2);
  if (points.length < 3) return [];

  const trainPts = points.filter((_, i) => i % 4 !== 3);
  const valPts = points.filter((_, i) => i % 4 === 3);

  const biasVarianceCurve = [];
  for (let d = 1; d <= 8; d++) {
    const { predict } = fitPolyRidge(trainPts, d, lambda);
    const trainMse =
      trainPts.reduce((acc, p) => acc + (predict(p.x) - p.y) ** 2, 0) / trainPts.length;
    const valMse =
      valPts.reduce((acc, p) => acc + (predict(p.x) - p.y) ** 2, 0) / Math.max(1, valPts.length);
    biasVarianceCurve.push({
      x: d,
      train: round(Math.min(20, trainMse), 3),
      val: round(Math.min(20, valMse), 3)
    });
  }

  const steps = [];
  for (let d = 1; d <= targetDegree; d++) {
    const { weights, predict } = fitPolyRidge(points, d, lambda);
    const mse = points.reduce((acc, p) => acc + (predict(p.x) - p.y) ** 2, 0) / points.length;
    const l2Norm = weights.slice(1).reduce((acc, w) => acc + w * w, 0);

    const curvePoints = [];
    for (let x = 0; x <= 9.6; x += 0.2) {
      curvePoints.push({ x: round(x, 2), y: round(predict(x), 3) });
    }

    steps.push({
      step: d - 1,
      phase: `Degree d = ${d}`,
      substitutionLatex: `J(\\mathbf{w}) = \\text{MSE}(${round(mse, 3)}) + ${lambda}\\|\\mathbf{w}\\|_2^2(${round(
        l2Norm,
        2
      )})`,
      kpis: [
        { label: 'Degree (d)', value: d, tone: 'indigo' },
        { label: 'L2 Penalty (λ)', value: lambda, tone: 'amber' },
        { label: 'Train MSE', value: round(mse, 4), tone: 'teal' },
        { label: '||w||² Norm', value: round(l2Norm, 3), tone: 'rose' }
      ],
      table: {
        title: `Polynomial Coefficients (Normalized x)`,
        headers: ['Term', 'Weight w_j', 'Penalty λw_j²'],
        rows: weights.map((w, idx) => [`x^${idx}`, round(w, 4), idx === 0 ? 0 : round(lambda * w * w, 4)])
      },
      chartData: biasVarianceCurve,
      viz: {
        kind: 'polynomial-ridge',
        points,
        curvePoints
      }
    });
  }

  return steps;
}
