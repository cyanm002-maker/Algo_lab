import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

function DendrogramSvg({ data }) {
  if (!data?.tree) return null;
  const { tree, cutoff, leafCount } = data;
  const W = 460;
  const H = 220;
  const pad = { top: 18, right: 20, bottom: 28, left: 38 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  let leafIndex = 0;
  const maxH = Math.max(1, tree.height * 1.15);
  const yScale = (h) => innerH - (h / maxH) * innerH;
  const xStep = innerW / Math.max(1, leafCount - 1);

  const segments = [];
  const leaves = [];

  function layout(node) {
    if (!node.left && !node.right) {
      const x = leafIndex * xStep;
      leafIndex++;
      leaves.push({ x, label: node.label });
      return { x, y: yScale(0) };
    }
    const lPos = layout(node.left);
    const rPos = layout(node.right);
    const y = yScale(node.height);
    segments.push({ x1: lPos.x, y1: lPos.y, x2: lPos.x, y2: y });
    segments.push({ x1: rPos.x, y1: rPos.y, x2: rPos.x, y2: y });
    segments.push({ x1: lPos.x, y1: y, x2: rPos.x, y2: y });
    return { x: (lPos.x + rPos.x) / 2, y };
  }
  layout(tree);

  const cutY = yScale(Math.min(maxH, cutoff));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px] select-none">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {segments.map((s, idx) => (
          <line
            key={idx}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="#0D9488"
            strokeWidth={2}
          />
        ))}
        <line
          x1={0}
          x2={innerW}
          y1={cutY}
          y2={cutY}
          stroke="#D97706"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
        <text x={innerW - 4} y={cutY - 5} textAnchor="end" fontSize={10} fill="#D97706" fontWeight="600">
          Cut-off = {cutoff}
        </text>
        {leaves.map((lf, idx) => (
          <text
            key={idx}
            x={lf.x}
            y={innerH + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#475569"
            fontFamily="monospace"
          >
            {lf.label}
          </text>
        ))}
      </g>
    </svg>
  );
}

export default function EvaluationChart({ algorithm, stepData }) {
  const chartMeta = algorithm?.evaluationChart || {};
  const chartData = stepData?.chartData;
  const isSup = algorithm?.category === 'supervised';
  const accent = isSup ? '#4F46E5' : '#0D9488';

  return (
    <div className="bento-card p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: accent }} />
            {chartMeta.title || 'Evaluation & Diagnostic Curve'}
          </h3>
          <p className="text-xs text-[#475569] mt-0.5">{chartMeta.description}</p>
        </div>
      </div>

      <div className="w-full h-[225px] bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2">
        {chartMeta.type === 'dendrogram' ? (
          <DendrogramSvg data={chartData} />
        ) : !Array.isArray(chartData) || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No diagnostic data available
          </div>
        ) : chartMeta.type === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill={accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : chartMeta.type === 'multiLine' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="train"
                name="Train MSE"
                stroke="#4F46E5"
                strokeWidth={2.2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="val"
                name="Validation MSE"
                stroke="#D97706"
                strokeWidth={2.2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              {chartMeta.type === 'roc' && (
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                  ]}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                />
              )}
              <Line
                type="monotone"
                dataKey="y"
                name={chartMeta.yLabel || 'Metric'}
                stroke={accent}
                strokeWidth={2.4}
                dot={{ r: 2.5, fill: accent }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#475569] font-medium">
        <span>X: {chartMeta.xLabel}</span>
        <span>Y: {chartMeta.yLabel}</span>
      </div>
    </div>
  );
}
