const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
const dist2D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function runHierarchicalHistory(points = [], params = {}) {
  const cutoff = Number(params.cutoff ?? 2.5);
  if (!points.length) return [];

  let clusters = points.map((p, idx) => ({
    id: idx,
    label: `#${p.id ?? idx + 1}`,
    members: [idx],
    height: 0
  }));

  const merges = [];
  let nextId = points.length;

  while (clusters.length > 1) {
    let bestI = 0;
    let bestJ = 1;
    let bestD = Infinity;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let sum = 0;
        for (const a of clusters[i].members) {
          for (const b of clusters[j].members) {
            sum += dist2D(points[a], points[b]);
          }
        }
        const avgD = sum / (clusters[i].members.length * clusters[j].members.length);
        if (avgD < bestD) {
          bestD = avgD;
          bestI = i;
          bestJ = j;
        }
      }
    }

    const left = clusters[bestI];
    const right = clusters[bestJ];
    const merged = {
      id: nextId++,
      label: `${left.label}+${right.label}`,
      members: [...left.members, ...right.members],
      height: round(bestD, 3),
      left,
      right
    };

    merges.push({
      step: merges.length + 1,
      leftLabel: left.label,
      rightLabel: right.label,
      distance: round(bestD, 3),
      members: merged.members
    });

    clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ);
    clusters.push(merged);
  }

  const rootTree = clusters[0];

  // Assign cluster IDs at active cutoff
  const activeClusters = [];
  function collectAtCutoff(node) {
    if (!node.left && !node.right) {
      activeClusters.push(node.members);
      return;
    }
    if (node.height <= cutoff) {
      activeClusters.push(node.members);
    } else {
      collectAtCutoff(node.left);
      collectAtCutoff(node.right);
    }
  }
  collectAtCutoff(rootTree);

  const pointLabels = Array(points.length).fill(0);
  activeClusters.forEach((members, cIdx) => {
    members.forEach((m) => {
      pointLabels[m] = cIdx;
    });
  });

  return [
    {
      step: 0,
      phase: `Cut-off d = ${cutoff} → ${activeClusters.length} Clusters`,
      substitutionLatex: `D(A, B) \\le ${cutoff} \\implies ${activeClusters.length} \\text{ active clusters}`,
      kpis: [
        { label: 'Cut-off Dist', value: cutoff, tone: 'amber' },
        { label: 'Active Clusters', value: activeClusters.length, tone: 'teal' },
        { label: 'Total Merges', value: merges.length, tone: 'indigo' },
        { label: 'Max Height', value: rootTree.height, tone: 'slate' }
      ],
      table: {
        title: 'Agglomerative Merge Sequence',
        headers: ['Step', 'Merged Pair', 'Linkage Dist'],
        rows: merges.map((m) => [m.step, `${m.leftLabel} & ${m.rightLabel}`, m.distance])
      },
      chartData: { tree: rootTree, cutoff, leafCount: points.length },
      viz: {
        kind: 'hierarchical',
        points,
        labels: pointLabels
      }
    }
  ];
}
