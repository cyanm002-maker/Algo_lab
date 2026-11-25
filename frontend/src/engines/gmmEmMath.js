const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

function gaussian2DPdf(pt, mu, cov) {
  const dx = pt.x - mu.x;
  const dy = pt.y - mu.y;
  const det = Math.max(1e-4, cov.xx * cov.yy - cov.xy * cov.xy);
  const invXX = cov.yy / det;
  const invYY = cov.xx / det;
  const invXY = -cov.xy / det;
  const quad = dx * dx * invXX + 2 * dx * dy * invXY + dy * dy * invYY;
  return Math.exp(-0.5 * quad) / (2 * Math.PI * Math.sqrt(det));
}

function covToEllipse(mu, cov) {
  const trace = cov.xx + cov.yy;
  const det = cov.xx * cov.yy - cov.xy * cov.xy;
  const disc = Math.sqrt(Math.max(0, (trace / 2) ** 2 - det));
  const l1 = Math.max(0.05, trace / 2 + disc);
  const l2 = Math.max(0.05, trace / 2 - disc);
  const angle = (0.5 * Math.atan2(2 * cov.xy, cov.xx - cov.yy) * 180) / Math.PI;
  return {
    cx: mu.x,
    cy: mu.y,
    rx: round(2 * Math.sqrt(l1), 3),
    ry: round(2 * Math.sqrt(l2), 3),
    angle: round(angle, 1)
  };
}

export function runGmmEmHistory(points = [], params = {}) {
  const k = Math.min(4, Math.max(2, Math.round(Number(params.k ?? 3))));
  const maxIter = Math.max(2, Math.round(Number(params.maxIterations ?? 8)));
  if (!points.length) return [];

  let components = Array.from({ length: k }, (_, idx) => {
    const pt = points[Math.floor((idx * points.length) / k)];
    return {
      mu: { x: pt.x + 0.2, y: pt.y - 0.2 },
      cov: { xx: 0.9, yy: 0.9, xy: 0.0 },
      pi: 1 / k
    };
  });

  const llCurve = [];
  const steps = [];

  for (let iter = 0; iter <= maxIter; iter++) {
    let logLikelihood = 0;
    const resp = points.map((pt) => {
      const weights = components.map((c) => c.pi * gaussian2DPdf(pt, c.mu, c.cov));
      const sumW = Math.max(1e-12, weights.reduce((a, b) => a + b, 0));
      logLikelihood += Math.log(sumW);
      return weights.map((w) => w / sumW);
    });

    llCurve.push({ x: iter, y: round(logLikelihood, 2) });

    const assignments = resp.map((r) => r.indexOf(Math.max(...r)));
    const ellipses = components.map((c, idx) => ({
      ...covToEllipse(c.mu, c.cov),
      pi: round(c.pi, 2),
      id: idx
    }));

    steps.push({
      step: iter,
      phase: iter === 0 ? 'Initial Gaussians' : `EM Step ${iter}`,
      substitutionLatex: `\\ell(\\theta) = \\sum_{i=1}^{n} \\log\\left(\\sum_{k=1}^{${k}} \\pi_k\\mathcal{N}_k\\right) = ${round(
        logLikelihood,
        2
      )}`,
      kpis: [
        { label: 'Components (K)', value: k, tone: 'indigo' },
        { label: 'Log-Likelihood', value: round(logLikelihood, 2), tone: 'teal' },
        { label: 'EM Iteration', value: iter, tone: 'amber' },
        { label: 'Points', value: points.length, tone: 'slate' }
      ],
      table: {
        title: 'Component Mixing Weights & Means',
        headers: ['Comp', 'Weight πₖ', 'Mean μₖ'],
        rows: components.map((c, idx) => [
          `G${idx + 1}`,
          round(c.pi, 3),
          `(${round(c.mu.x, 2)}, ${round(c.mu.y, 2)})`
        ])
      },
      chartData: llCurve.map((p) => ({ ...p })),
      viz: {
        kind: 'gmm-em',
        points,
        assignments,
        ellipses
      }
    });

    // M-Step
    components = components.map((_, cIdx) => {
      const nk = Math.max(1e-4, resp.reduce((acc, r) => acc + r[cIdx], 0));
      const mx = resp.reduce((acc, r, i) => acc + r[cIdx] * points[i].x, 0) / nk;
      const my = resp.reduce((acc, r, i) => acc + r[cIdx] * points[i].y, 0) / nk;

      let xx = 0.08;
      let yy = 0.08;
      let xy = 0;
      for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - mx;
        const dy = points[i].y - my;
        xx += (resp[i][cIdx] * dx * dx) / nk;
        yy += (resp[i][cIdx] * dy * dy) / nk;
        xy += (resp[i][cIdx] * dx * dy) / nk;
      }
      return {
        mu: { x: mx, y: my },
        cov: { xx, yy, xy },
        pi: nk / points.length
      };
    });
  }

  return steps;
}
