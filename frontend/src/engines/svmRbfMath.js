const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function runSvmRbfHistory(points = [], params = {}) {
  const targetLift = Number(params.liftStrength ?? 1);
  const cParam = Number(params.cParam ?? 2.5);
  if (!points.length) return [];

  // Precompute Hinge Loss curve vs C
  const lossCurve = [];
  for (let c = 0.5; c <= 10; c += 1.0) {
    const margin = 1.6 / Math.sqrt(c);
    const hinge = points.reduce((acc, p) => {
      const z = p.x * p.x + p.y * p.y;
      const score = (1.6 - z) * p.label;
      return acc + Math.max(0, 1 - score * (c / 2.5));
    }, 0) / points.length;
    lossCurve.push({ x: round(c, 1), y: round(hinge, 3), margin: round(margin, 3) });
  }

  const totalSteps = 10;
  const steps = [];
  for (let s = 0; s <= totalSteps; s++) {
    const alpha = (s / totalSteps) * targetLift;
    const zPlane = 1.55 * alpha;

    const liftedPoints = points.map((p) => {
      const r2 = p.x * p.x + p.y * p.y;
      return {
        ...p,
        z: round(r2 * alpha, 3),
        r2: round(r2, 3)
      };
    });

    const hingeAvg =
      liftedPoints.reduce((acc, p) => {
        const marginVal = (1.55 - p.r2) * p.label;
        return acc + Math.max(0, 1 - marginVal * (cParam / 2.5));
      }, 0) / liftedPoints.length;

    steps.push({
      step: s,
      phase: alpha === 0 ? '2D Non-Linear Rings' : alpha < 1 ? 'Lifting to 3D' : 'Linearly Separable 3D',
      substitutionLatex: `\\phi(x,y) = (x,\\; y,\\; ${round(alpha, 2)}(x^2+y^2)), \\quad z_{\\text{plane}} = ${round(
        zPlane,
        2
      )}`,
      kpis: [
        { label: 'Kernel Lift', value: `${Math.round(alpha * 100)}%`, tone: 'amber' },
        { label: 'Hyperplane z', value: round(zPlane, 2), tone: 'indigo' },
        { label: 'Hinge Loss', value: round(hingeAvg, 3), tone: 'rose' },
        { label: 'C Penalty', value: cParam, tone: 'teal' }
      ],
      table: {
        title: 'Radial Kernel Mapping z = x² + y²',
        headers: ['Pt', '(x, y)', 'r² = x²+y²', 'Class'],
        rows: liftedPoints.slice(0, 8).map((p) => [`#${p.id}`, `(${p.x}, ${p.y})`, p.r2, p.label === 1 ? '+1' : '-1'])
      },
      chartData: lossCurve,
      viz: {
        kind: 'svm-rbf-3d',
        points: liftedPoints,
        zPlane,
        liftAlpha: alpha
      }
    });
  }

  return steps;
}
