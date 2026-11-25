const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

const gaussianPdf = (x, mean, varVal) =>
  Math.exp(-0.5 * ((x - mean) ** 2 / varVal)) / Math.sqrt(2 * Math.PI * varVal);

export function runGaussianNaiveBayesHistory(points = [], params = {}) {
  const varSmooth = Number(params.varSmoothing ?? 0.15);
  const query = params.queryPoint || { x: 4.6, y: 4.5 };
  if (!points.length) return [];

  const classes = [0, 1].map((c) => {
    const pts = points.filter((p) => p.label === c);
    const meanX = pts.reduce((a, p) => a + p.x, 0) / Math.max(1, pts.length);
    const meanY = pts.reduce((a, p) => a + p.y, 0) / Math.max(1, pts.length);
    const varX =
      pts.reduce((a, p) => a + (p.x - meanX) ** 2, 0) / Math.max(1, pts.length) + varSmooth;
    const varY =
      pts.reduce((a, p) => a + (p.y - meanY) ** 2, 0) / Math.max(1, pts.length) + varSmooth;
    return {
      label: c,
      prior: pts.length / points.length,
      meanX,
      meanY,
      stdX: Math.sqrt(varX),
      stdY: Math.sqrt(varY),
      varX,
      varY
    };
  });

  const likelihoods = classes.map((cls) => {
    const lx = gaussianPdf(query.x, cls.meanX, cls.varX);
    const ly = gaussianPdf(query.y, cls.meanY, cls.varY);
    return { label: cls.label, joint: cls.prior * lx * ly };
  });
  const total = Math.max(1e-12, likelihoods[0].joint + likelihoods[1].joint);
  const p0 = round((likelihoods[0].joint / total) * 100, 1);
  const p1 = round((likelihoods[1].joint / total) * 100, 1);

  const chartData = [
    { name: 'Class 0', value: p0 },
    { name: 'Class 1', value: p1 }
  ];

  return [
    {
      step: 0,
      phase: 'Bayesian Posterior Inference',
      substitutionLatex: `P(y=0\\mid\\mathbf{q}) = ${p0}\\%, \\quad P(y=1\\mid\\mathbf{q}) = ${p1}\\%`,
      kpis: [
        { label: 'P(Class 0 | q)', value: `${p0}%`, tone: 'indigo' },
        { label: 'P(Class 1 | q)', value: `${p1}%`, tone: 'teal' },
        { label: 'Prediction', value: p1 >= p0 ? 'Class 1' : 'Class 0', tone: 'amber' },
        { label: 'Var Smooth', value: varSmooth, tone: 'slate' }
      ],
      table: {
        title: 'Class Gaussian Parameters (μ, σ)',
        headers: ['Class', 'Prior', 'μ = (μx, μy)', 'σ = (σx, σy)'],
        rows: classes.map((c) => [
          `C${c.label}`,
          round(c.prior, 2),
          `(${round(c.meanX, 2)}, ${round(c.meanY, 2)})`,
          `(${round(c.stdX, 2)}, ${round(c.stdY, 2)})`
        ])
      },
      chartData,
      viz: {
        kind: 'gaussian-nb',
        points,
        classes,
        query
      }
    }
  ];
}
