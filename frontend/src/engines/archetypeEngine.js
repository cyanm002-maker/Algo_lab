const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function runArchetypeEngine(algorithm, dataset, params = {}, viewMode = '2d') {
  const archetype = algorithm?.visualArchetype || 'SpatialRegressionClassifier';
  const lr = Number(params.learningRate ?? 0.12);
  const intensity = Number(params.intensity ?? 5);

  if (archetype === 'LossOptimization3D') {
    const steps = [];
    let x = 2.6;
    let y = -2.2;
    const path = [];
    const lossCurve = [];
    for (let s = 0; s <= 15; s++) {
      const z = 0.22 * (x * x + y * y) + 0.35 * Math.sin(x * 1.4) * Math.cos(y * 1.4);
      path.push({ x: round(x, 2), y: round(y, 2), z: round(z, 3) });
      lossCurve.push({ x: s, y: round(z, 3) });
      steps.push({
        step: s,
        phase: s === 0 ? 'Initial Weights θ₀' : `Step ${s} (α=${lr})`,
        substitutionLatex: `\\theta_{${s}} = (${round(x, 2)},\\; ${round(y, 2)}), \\quad \\mathcal{L}(\\theta) = ${round(z, 3)}`,
        kpis: [
          { label: 'Param θ₁', value: round(x, 2), tone: 'indigo' },
          { label: 'Param θ₂', value: round(y, 2), tone: 'indigo' },
          { label: 'Loss L(θ)', value: round(z, 3), tone: 'rose' },
          { label: 'Step Rate α', value: lr, tone: 'amber' }
        ],
        table: {
          title: 'Optimization Trajectory',
          headers: ['Step', 'θ₁', 'θ₂', 'Loss L(θ)'],
          rows: path.slice(-6).map((p, idx) => [Math.max(0, path.length - 6) + idx, p.x, p.y, p.z])
        },
        chartData: lossCurve.map((c) => ({ ...c })),
        viz: { kind: 'loss-opt-3d', path: path.map((p) => ({ ...p })), current: { x, y, z } }
      });
      const gx = 0.44 * x + 0.49 * Math.cos(x * 1.4) * Math.cos(y * 1.4);
      const gy = 0.44 * y - 0.49 * Math.sin(x * 1.4) * Math.sin(y * 1.4);
      x -= lr * gx * (0.7 + intensity * 0.08);
      y -= lr * gy * (0.7 + intensity * 0.08);
    }
    return steps;
  }

  if (archetype === 'TensorGridCube3D') {
    const sliceDepth = Math.round(Number(params.sliceDepth ?? 0));
    const axisMode = Math.round(Number(params.axisMode ?? 0));
    const shape = dataset?.shape || [3, 4, 4];
    const [D, R, C] = shape;
    const cells = [];
    for (let d = 0; d < D; d++) {
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          cells.push({
            d,
            r,
            c,
            val: d * R * C + r * C + c,
            highlighted: axisMode === 0 ? d === sliceDepth : axisMode === 1 ? r === sliceDepth % R : c === sliceDepth % C
          });
        }
      }
    }
    const benchChart = [
      { name: 'Python Loop', value: 48.2 },
      { name: 'NumPy Vector', value: 0.6 },
      { name: 'PyTorch CUDA', value: 0.15 }
    ];
    return [0, 1, 2].map((stepIdx) => {
      const activeSlice = (sliceDepth + stepIdx) % D;
      return {
        step: stepIdx,
        phase: `Slice axis=${axisMode} · idx=${activeSlice}`,
        substitutionLatex: `\\text{shape} = (${D},\\; ${R},\\; ${C}), \\quad \\text{sum}(\\text{axis}=${axisMode}) \\to ${
          axisMode === 0 ? `(${R},${C})` : axisMode === 1 ? `(${D},${C})` : `(${D},${R})`
        }`,
        kpis: [
          { label: 'Shape', value: `(${D}, ${R}, ${C})`, tone: 'cobalt' },
          { label: 'Total Elements', value: D * R * C, tone: 'indigo' },
          { label: 'Active Slice', value: activeSlice, tone: 'amber' },
          { label: 'Reduce Axis', value: `axis=${axisMode}`, tone: 'teal' }
        ],
        table: {
          title: `Slice [${activeSlice}, :, :] Values`,
          headers: ['Row', 'Col 0', 'Col 1', 'Col 2', 'Col 3'],
          rows: Array.from({ length: R }, (_, r) => [
            `r${r}`,
            ...Array.from({ length: C }, (_, c) => activeSlice * R * C + r * C + c)
          ])
        },
        chartData: benchChart,
        viz: { kind: 'tensor-cube-3d', shape, cells, activeSlice, axisMode }
      };
    });
  }

  if (archetype === 'DataFramePipeline2D') {
    const rawRows = Array.isArray(dataset) && dataset.length
      ? dataset
      : [
          { id: 1, segment: 'Enterprise', age: 34, spend: 420 },
          { id: 2, segment: 'SMB', age: 28, spend: 140 },
          { id: 3, segment: 'Enterprise', age: null, spend: 510 },
          { id: 4, segment: 'Consumer', age: 22, spend: 65 },
          { id: 5, segment: 'SMB', age: 41, spend: 230 },
          { id: 6, segment: 'Enterprise', age: 37, spend: 390 }
        ];
    const minSpend = Number(params.minSpend ?? 100);
    const imputed = rawRows.map((r) => ({ ...r, age: r.age ?? 34, imputed: r.age === null }));
    const filtered = imputed.filter((r) => r.spend >= minSpend);
    const groups = Object.entries(
      filtered.reduce((acc, r) => {
        acc[r.segment] = acc[r.segment] || [];
        acc[r.segment].push(r.spend);
        return acc;
      }, {})
    ).map(([seg, vals]) => ({
      segment: seg,
      count: vals.length,
      meanSpend: round(vals.reduce((a, b) => a + b, 0) / vals.length, 1)
    }));

    const chartData = [
      { name: 'Raw', value: rawRows.length },
      { name: 'Imputed', value: imputed.length },
      { name: 'Filtered', value: filtered.length },
      { name: 'Groups', value: groups.length }
    ];

    const stages = [
      { title: '1. Raw Ingestion', rows: rawRows },
      { title: '2. fillna(median=34)', rows: imputed },
      { title: `3. Filter spend >= $${minSpend}`, rows: filtered },
      { title: "4. groupby('segment').mean()", rows: groups, isGroup: true }
    ];

    return stages.map((st, idx) => ({
      step: idx,
      phase: st.title,
      substitutionLatex: `\\text{df.pipe(fillna).query('spend >= ${minSpend}').groupby('segment')}`,
      kpis: [
        { label: 'Raw Rows', value: rawRows.length, tone: 'slate' },
        { label: 'Filtered Rows', value: filtered.length, tone: 'cobalt' },
        { label: 'Groups', value: groups.length, tone: 'teal' },
        { label: 'NaNs Fixed', value: rawRows.filter((r) => r.age === null).length, tone: 'amber' }
      ],
      table: st.isGroup
        ? {
            title: 'Grouped Output DataFrame',
            headers: ['segment', 'count', 'mean_spend'],
            rows: groups.map((g) => [g.segment, g.count, `$${g.meanSpend}`])
          }
        : {
            title: st.title,
            headers: ['id', 'segment', 'age', 'spend'],
            rows: st.rows.map((r) => [r.id, r.segment, r.age ?? 'NaN', `$${r.spend}`])
          },
      chartData,
      viz: { kind: 'dataframe-2d', stageIndex: idx, rawRows, imputed, filtered, groups, minSpend }
    }));
  }

  if (archetype === 'NeuralNetworkGraph3D') {
    const hiddenW = Math.round(Number(params.hiddenWidth ?? 4));
    const layers = [2, hiddenW, 3, 1];
    const steps = [];
    const lossCurve = [];
    for (let s = 0; s <= 10; s++) {
      const loss = round(1.8 * Math.exp(-s * (0.2 + lr)), 4);
      lossCurve.push({ x: s, y: loss });
      const isBackward = s % 2 === 1;
      steps.push({
        step: s,
        phase: isBackward ? `Backward Pass (.backward() #${s})` : `Forward Pass #${s}`,
        substitutionLatex: `\\mathcal{L} = ${loss}, \\quad \\nabla_W \\mathcal{L} = ${round(
          -0.4 * Math.exp(-s * 0.2),
          3
        )}`,
        kpis: [
          { label: 'Architecture', value: layers.join('→'), tone: 'cobalt' },
          { label: 'MSE Loss', value: loss, tone: 'rose' },
          { label: 'Pass Mode', value: isBackward ? 'Backward' : 'Forward', tone: isBackward ? 'amber' : 'teal' },
          { label: 'Grad Norm', value: round(0.85 * Math.exp(-s * 0.15), 3), tone: 'indigo' }
        ],
        table: {
          title: 'Layer Tensor Shapes & Gradients',
          headers: ['Layer', 'In→Out', 'Grad Norm'],
          rows: layers.slice(0, -1).map((l, idx) => [
            `Linear_${idx + 1}`,
            `${l} → ${layers[idx + 1]}`,
            round(0.9 / (idx + 1) * Math.exp(-s * 0.1), 3)
          ])
        },
        chartData: lossCurve.map((c) => ({ ...c })),
        viz: { kind: 'neural-graph-3d', layers, isBackward, step: s }
      });
    }
    return steps;
  }

  if (archetype === 'AttentionTransformerFlow') {
    const tokens = dataset?.tokens || ['The', 'river', 'bank', 'flooded', 'fast'];
    const dk = Number(params.dk ?? 16);
    const scale = Math.sqrt(dk);
    const rawDots = [
      [2.4, 0.8, 0.9, 0.4, 0.3],
      [0.7, 2.8, 2.1, 1.4, 0.5],
      [0.6, 2.5, 2.9, 2.0, 0.6],
      [0.3, 1.5, 2.2, 2.7, 1.6],
      [0.2, 0.4, 0.7, 1.9, 2.8]
    ];

    const matrix = rawDots.map((row) => {
      const scaled = row.map((v) => v / (scale * 0.25));
      const maxS = Math.max(...scaled);
      const exps = scaled.map((v) => Math.exp(v - maxS));
      const sumE = exps.reduce((a, b) => a + b, 0);
      return exps.map((e) => round(e / sumE, 3));
    });

    return tokens.map((tok, qIdx) => ({
      step: qIdx,
      phase: `Query Token: "${tok}"`,
      substitutionLatex: `\\text{softmax}\\left(\\frac{Q_{\\text{${tok}}} K^T}{\\sqrt{${dk}}}\\right), \\quad \\sqrt{d_k}=${round(
        scale,
        2
      )}`,
      kpis: [
        { label: 'Active Query', value: `"${tok}"`, tone: 'indigo' },
        { label: 'Head Dim d_k', value: dk, tone: 'cobalt' },
        { label: 'Scale √d_k', value: round(scale, 2), tone: 'amber' },
        { label: 'Peak Weight', value: Math.max(...matrix[qIdx]), tone: 'teal' }
      ],
      table: {
        title: `Attention Weights for Query "${tok}"`,
        headers: ['Key Token', 'Dot Score', 'Softmax α'],
        rows: tokens.map((kTok, kIdx) => [kTok, rawDots[qIdx][kIdx], matrix[qIdx][kIdx]])
      },
      chartData: tokens.map((kTok, kIdx) => ({ name: kTok, value: matrix[qIdx][kIdx] })),
      viz: { kind: 'attention-2d', tokens, matrix, activeQuery: qIdx }
    }));
  }

  if (archetype === 'DiffusionFlowVisualizer') {
    const steps = [];
    const snrCurve = [];
    for (let t = 0; t <= 10; t++) {
      const noiseLevel = 1 - t / 10;
      snrCurve.push({ x: t, y: round((1 - noiseLevel) * 100, 1) });
      const pts = Array.from({ length: 48 }, (_, i) => {
        const angle = (i / 48) * Math.PI * 2;
        const cleanX = 5 + Math.cos(angle) * 2.6;
        const cleanY = 5 + Math.sin(angle) * 2.6;
        const nx = Math.sin(i * 12.9898 + t) * 2.2;
        const ny = Math.cos(i * 78.233 + t) * 2.2;
        return {
          x: round(cleanX * (1 - noiseLevel) + (5 + nx) * noiseLevel, 2),
          y: round(cleanY * (1 - noiseLevel) + (5 + ny) * noiseLevel, 2)
        };
      });
      steps.push({
        step: t,
        phase: t === 0 ? 'Pure Gaussian Noise z_T' : t === 10 ? 'Clean Sample x_0' : `Denoising t=${10 - t}`,
        substitutionLatex: `x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}}\\left(x_t - \\frac{1-\\alpha_t}{\\sqrt{1-\\bar{\\alpha}_t}}\\epsilon_\\theta\\right), \\quad \\sigma_t=${round(
          noiseLevel,
          2
        )}`,
        kpis: [
          { label: 'Timestep', value: `t=${10 - t}`, tone: 'teal' },
          { label: 'Noise σ_t', value: round(noiseLevel, 2), tone: 'rose' },
          { label: 'Signal %', value: `${round((1 - noiseLevel) * 100, 0)}%`, tone: 'indigo' },
          { label: 'Samples', value: pts.length, tone: 'slate' }
        ],
        table: {
          title: 'Denoising Schedule State',
          headers: ['Step', 'Noise σ', 'Signal %'],
          rows: snrCurve.slice(-5).map((c) => [c.x, round(1 - c.y / 100, 2), `${c.y}%`])
        },
        chartData: snrCurve.map((c) => ({ ...c })),
        viz: { kind: 'diffusion-2d', points: pts, noiseLevel }
      });
    }
    return steps;
  }

  if (archetype === 'TimeSeriesForecastPlot') {
    const historyLen = 18;
    const horizon = 6;
    const series = [];
    for (let t = 0; t < historyLen + horizon; t++) {
      const trend = 2.0 + t * 0.22;
      const seasonal = 1.4 * Math.sin((t * Math.PI) / 4);
      const val = round(trend + seasonal, 2);
      series.push({
        t,
        actual: t < historyLen ? val : null,
        forecast: t >= historyLen - 1 ? val : null,
        upper: t >= historyLen - 1 ? round(val + (t - historyLen + 2) * 0.28, 2) : null,
        lower: t >= historyLen - 1 ? round(val - (t - historyLen + 2) * 0.28, 2) : null
      });
    }
    return [
      {
        step: 0,
        phase: 'Trend + Seasonal Forecast',
        substitutionLatex: `\\hat{y}_{t+h} = \\ell_t + h\\,b_t + s_{t+h-m}, \\quad \\text{Horizon } h=${horizon}`,
        kpis: [
          { label: 'History', value: `${historyLen} pts`, tone: 'indigo' },
          { label: 'Horizon', value: `+${horizon} steps`, tone: 'teal' },
          { label: 'MAE', value: '0.24', tone: 'amber' },
          { label: 'Coverage', value: '95%', tone: 'slate' }
        ],
        table: {
          title: 'Forecast Horizon Values',
          headers: ['t', 'Forecast', '95% CI'],
          rows: series.slice(historyLen).map((s) => [s.t, s.forecast, `[${s.lower}, ${s.upper}]`])
        },
        chartData: series.map((s) => ({ x: s.t, y: s.actual ?? s.forecast })),
        viz: { kind: 'timeseries-2d', series }
      }
    ];
  }

  if (archetype === 'RlAndMetricMatrix') {
    const steps = [];
    const rewardCurve = [];
    for (let ep = 0; ep <= 10; ep++) {
      const progress = ep / 10;
      const reward = round(-12 + progress * 22, 1);
      rewardCurve.push({ x: ep, y: reward });
      const grid = Array.from({ length: 16 }, (_, idx) => {
        const r = Math.floor(idx / 4);
        const c = idx % 4;
        const distGoal = 3 - r + (3 - c);
        const val = idx === 15 ? 10 : idx === 5 || idx === 10 ? -5 : round((10 - distGoal * 2.1) * progress, 1);
        return { r, c, val, isGoal: idx === 15, isHazard: idx === 5 || idx === 10 };
      });
      steps.push({
        step: ep,
        phase: `Episode ${ep * 10}`,
        substitutionLatex: `Q(s,a) \\leftarrow Q(s,a) + ${lr}\\left[r + 0.9\\max_{a'}Q(s',a') - Q(s,a)\\right]`,
        kpis: [
          { label: 'Episode', value: ep * 10, tone: 'indigo' },
          { label: 'Return', value: reward, tone: 'teal' },
          { label: 'Alpha α', value: lr, tone: 'amber' },
          { label: 'Gamma γ', value: '0.90', tone: 'slate' }
        ],
        table: {
          title: 'Gridworld State Values (4×4)',
          headers: ['Row', 'C0', 'C1', 'C2', 'C3'],
          rows: [0, 1, 2, 3].map((r) => [
            `R${r}`,
            ...grid.slice(r * 4, r * 4 + 4).map((cell) => cell.val)
          ])
        },
        chartData: rewardCurve.map((c) => ({ ...c })),
        viz: { kind: 'rl-matrix-2d', grid }
      });
    }
    return steps;
  }

  // Fallback for SubspaceEmbedding3D / ClusterDensity3D / TreeEnsembleVisualizer / SpatialRegressionClassifier
  const defaultPts = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    x: round(1.5 + ((i * 1.7) % 7), 2),
    y: round(1.5 + ((i * 2.3) % 7), 2),
    z: round(-2 + ((i * 0.9) % 4), 2),
    label: i % 2
  }));

  return [0, 1, 2, 3].map((s) => ({
    step: s,
    phase: `Iteration ${s}`,
    substitutionLatex: `\\text{Step } ${s}: \\; \\mathcal{L} = ${round(1.2 / (s + 1), 3)}, \\quad \\alpha = ${lr}`,
    kpis: [
      { label: 'Step', value: s, tone: 'indigo' },
      { label: 'Objective', value: round(1.2 / (s + 1), 3), tone: 'teal' },
      { label: 'Complexity', value: intensity, tone: 'amber' },
      { label: 'Mode', value: viewMode.toUpperCase(), tone: 'slate' }
    ],
    table: {
      title: 'Sample Coordinates',
      headers: ['Pt', 'x', 'y', 'Class'],
      rows: defaultPts.slice(0, 6).map((p) => [`#${p.id}`, p.x, p.y, `C${p.label}`])
    },
    chartData: [0, 1, 2, 3].slice(0, s + 1).map((i) => ({ x: i, y: round(1.2 / (i + 1), 3) })),
    viz: {
      kind: viewMode === '3d' ? 'kmeans-3d' : 'logistic-regression',
      points: defaultPts,
      assignments: defaultPts.map((p) => p.label),
      centroids: [],
      w1: 0.4,
      w2: 0.5,
      b: -4.2 + s * 0.15,
      threshold: 0.5
    }
  }));
}
