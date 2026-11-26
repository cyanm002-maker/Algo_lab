import React, { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { MousePointerClick, RotateCcw } from 'lucide-react';
import { CLUSTER_COLORS } from '../../engines/kMeansMath';

const WIDTH = 680;
const HEIGHT = 390;
const MARGIN = { top: 20, right: 20, bottom: 38, left: 46 };

export default function Visualizer2D({
  stepData,
  onAddPoint,
  onMoveQuery,
  onResetPoints,
  hasCustomPoints
}) {
  const svgRef = useRef(null);
  const [hoveredPt, setHoveredPt] = useState(null);

  const viz = stepData?.viz || {};
  const kind = viz.kind || 'linear-regression';
  const points = viz.points || [];

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale, xTicks, yTicks } = useMemo(() => {
    const xS = d3.scaleLinear().domain([0, 10]).range([0, innerWidth]);
    const yS = d3.scaleLinear().domain([0, 10]).range([innerHeight, 0]);
    return {
      xScale: xS,
      yScale: yS,
      xTicks: xS.ticks(5),
      yTicks: yS.ticks(5)
    };
  }, [innerWidth, innerHeight]);

  const handleSvgClick = (event) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const px = (event.clientX - rect.left) * scaleX - MARGIN.left;
    const py = (event.clientY - rect.top) * scaleY - MARGIN.top;
    if (px < 0 || px > innerWidth || py < 0 || py > innerHeight) return;

    const dataX = Number(xScale.invert(px).toFixed(2));
    const dataY = Number(yScale.invert(py).toFixed(2));

    if ((kind === 'knn-2d' || kind === 'gaussian-nb') && onMoveQuery) {
      onMoveQuery({ x: dataX, y: dataY, z: 0 });
    } else if (kind === 'linear-regression' && onAddPoint) {
      onAddPoint({ x: dataX, y: dataY });
    }
  };

  const hintText =
    kind === 'knn-2d' || kind === 'gaussian-nb'
      ? 'Click anywhere in the plot to move the query point (q)'
      : kind === 'linear-regression'
      ? 'Click anywhere on the grid to plot new points · Watch the line rotate smoothly'
      : 'Interactive 2D spatial coordinate space';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[#475569] flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-[#4F46E5]" />
          {hintText}
        </span>
        {hasCustomPoints && onResetPoints && (
          <button
            type="button"
            onClick={onResetPoints}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Points
          </button>
        )}
      </div>

      <div className="relative w-full bg-white border border-slate-200 rounded-xl overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          onClick={handleSvgClick}
          className="w-full h-auto cursor-crosshair select-none block"
        >
          <defs>
            <clipPath id="light-plot-clip">
              <rect x={0} y={0} width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>

          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {xTicks.map((t) => (
              <line
                key={`gx-${t}`}
                x1={xScale(t)}
                x2={xScale(t)}
                y1={0}
                y2={innerHeight}
                stroke="#F1F5F9"
                strokeWidth={1.2}
              />
            ))}
            {yTicks.map((t) => (
              <line
                key={`gy-${t}`}
                x1={0}
                x2={innerWidth}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="#F1F5F9"
                strokeWidth={1.2}
              />
            ))}

            <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="#CBD5E1" />
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="#CBD5E1" />

            {xTicks.map((t) => (
              <text
                key={`tx-${t}`}
                x={xScale(t)}
                y={innerHeight + 16}
                textAnchor="middle"
                fill="#64748B"
                fontSize={10.5}
                fontFamily="monospace"
              >
                {t}
              </text>
            ))}
            {yTicks.map((t) => (
              <text
                key={`ty-${t}`}
                x={-8}
                y={yScale(t) + 3.5}
                textAnchor="end"
                fill="#64748B"
                fontSize={10.5}
                fontFamily="monospace"
              >
                {t}
              </text>
            ))}

            <g clipPath="url(#light-plot-clip)">
              {kind === 'random-forest' &&
                (viz.grid || []).map((cell, idx) => (
                  <rect
                    key={`rf-${idx}`}
                    x={xScale(cell.x - 0.5)}
                    y={yScale(cell.y + 0.5)}
                    width={xScale(1) - xScale(0)}
                    height={yScale(0) - yScale(1)}
                    fill={cell.prob >= 0.5 ? '#0D9488' : '#4F46E5'}
                    opacity={0.08 + Math.abs(cell.prob - 0.5) * 0.35}
                  />
                ))}

              {kind === 'decision-tree' &&
                (viz.regions || []).map((reg, idx) => (
                  <rect
                    key={`dt-r-${idx}`}
                    x={xScale(reg.xMin)}
                    y={yScale(reg.yMax)}
                    width={xScale(reg.xMax) - xScale(reg.xMin)}
                    height={yScale(reg.yMin) - yScale(reg.yMax)}
                    fill={reg.pred === 1 ? '#0D9488' : '#4F46E5'}
                    opacity={0.1}
                  />
                ))}
              {kind === 'decision-tree' &&
                (viz.splits || []).map((sp, idx) =>
                  sp.feature === 'x' ? (
                    <motion.line
                      key={`dt-s-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x1={xScale(sp.threshold)}
                      x2={xScale(sp.threshold)}
                      y1={yScale(sp.bounds.yMin)}
                      y2={yScale(sp.bounds.yMax)}
                      stroke="#0F172A"
                      strokeWidth={1.8}
                      strokeDasharray="4 3"
                    />
                  ) : (
                    <motion.line
                      key={`dt-s-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x1={xScale(sp.bounds.xMin)}
                      x2={xScale(sp.bounds.xMax)}
                      y1={yScale(sp.threshold)}
                      y2={yScale(sp.threshold)}
                      stroke="#0F172A"
                      strokeWidth={1.8}
                      strokeDasharray="4 3"
                    />
                  )
                )}

              {kind === 'isolation-forest' &&
                (viz.splits || []).map((sp, idx) =>
                  sp.feat === 'x' ? (
                    <line
                      key={`if-s-${idx}`}
                      x1={xScale(sp.val)}
                      x2={xScale(sp.val)}
                      y1={yScale(sp.bounds.yMin)}
                      y2={yScale(sp.bounds.yMax)}
                      stroke="#94A3B8"
                      strokeWidth={1.2}
                      strokeDasharray="3 3"
                    />
                  ) : (
                    <line
                      key={`if-s-${idx}`}
                      x1={xScale(sp.bounds.xMin)}
                      x2={xScale(sp.bounds.xMax)}
                      y1={yScale(sp.val)}
                      y2={yScale(sp.val)}
                      stroke="#94A3B8"
                      strokeWidth={1.2}
                      strokeDasharray="3 3"
                    />
                  )
                )}

              {/* Animated Linear Regression Residuals & Rotating Best-Fit Line */}
              {kind === 'linear-regression' && (
                <>
                  {points.map((pt, idx) => (
                    <motion.line
                      key={`res-${pt.id ?? idx}`}
                      animate={{
                        x1: xScale(pt.x),
                        x2: xScale(pt.x),
                        y1: yScale(pt.y),
                        y2: yScale(viz.w * pt.x + viz.b)
                      }}
                      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                      stroke="#E11D48"
                      strokeWidth={1.6}
                      strokeDasharray="4 3"
                      opacity={0.78}
                    />
                  ))}
                  <motion.line
                    animate={{
                      x1: xScale(0),
                      y1: yScale(viz.b),
                      x2: xScale(10),
                      y2: yScale(viz.w * 10 + viz.b)
                    }}
                    transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                    stroke="#4F46E5"
                    strokeWidth={3}
                  />
                </>
              )}

              {kind === 'polynomial-ridge' && viz.curvePoints?.length > 1 && (
                <path
                  d={d3
                    .line()
                    .x((d) => xScale(d.x))
                    .y((d) => yScale(d.y))
                    .curve(d3.curveMonotoneX)(viz.curvePoints)}
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth={2.75}
                />
              )}

              {kind === 'logistic-regression' && Math.abs(viz.w2) > 1e-4 && (
                (() => {
                  const logit = Math.log(viz.threshold / (1 - viz.threshold));
                  const yAt0 = (logit - viz.b - viz.w1 * 0) / viz.w2;
                  const yAt10 = (logit - viz.b - viz.w1 * 10) / viz.w2;
                  return (
                    <motion.line
                      animate={{
                        x1: xScale(0),
                        y1: yScale(yAt0),
                        x2: xScale(10),
                        y2: yScale(yAt10)
                      }}
                      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                      stroke="#0F172A"
                      strokeWidth={2.2}
                      strokeDasharray="6 4"
                    />
                  );
                })()
              )}

              {kind === 'knn-2d' && viz.query && (
                <>
                  <motion.circle
                    animate={{
                      cx: xScale(viz.query.x),
                      cy: yScale(viz.query.y),
                      r: Math.abs(xScale(viz.radius) - xScale(0))
                    }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                    fill="#4F46E5"
                    fillOpacity={0.07}
                    stroke="#4F46E5"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                  />
                  {(viz.neighbors || []).map((n, idx) => (
                    <line
                      key={`knn-l-${idx}`}
                      x1={xScale(viz.query.x)}
                      y1={yScale(viz.query.y)}
                      x2={xScale(n.x)}
                      y2={yScale(n.y)}
                      stroke="#94A3B8"
                      strokeWidth={1.4}
                    />
                  ))}
                </>
              )}

              {kind === 'gaussian-nb' &&
                (viz.classes || []).map((cls) =>
                  [1, 2].map((sigma) => (
                    <ellipse
                      key={`gnb-${cls.label}-${sigma}`}
                      cx={xScale(cls.meanX)}
                      cy={yScale(cls.meanY)}
                      rx={Math.abs(xScale(cls.stdX * sigma) - xScale(0))}
                      ry={Math.abs(yScale(0) - yScale(cls.stdY * sigma))}
                      fill={cls.label === 0 ? '#4F46E5' : '#0D9488'}
                      fillOpacity={sigma === 1 ? 0.12 : 0.05}
                      stroke={cls.label === 0 ? '#4F46E5' : '#0D9488'}
                      strokeWidth={1.4}
                      strokeDasharray={sigma === 2 ? '4 3' : undefined}
                    />
                  ))
                )}

              {kind === 'dbscan' &&
                points.map((pt, idx) =>
                  viz.roles?.[idx] === 'core' ? (
                    <circle
                      key={`eps-${idx}`}
                      cx={xScale(pt.x)}
                      cy={yScale(pt.y)}
                      r={Math.abs(xScale(viz.eps) - xScale(0))}
                      fill="#0D9488"
                      fillOpacity={0.06}
                      stroke="#0D9488"
                      strokeOpacity={0.35}
                      strokeDasharray="3 3"
                    />
                  ) : null
                )}

              {kind === 'gmm-em' &&
                (viz.ellipses || []).map((el, idx) => {
                  const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
                  return (
                    <ellipse
                      key={`gmm-${idx}`}
                      cx={xScale(el.cx)}
                      cy={yScale(el.cy)}
                      rx={Math.abs(xScale(el.rx) - xScale(0))}
                      ry={Math.abs(yScale(0) - yScale(el.ry))}
                      transform={`rotate(${-el.angle}, ${xScale(el.cx)}, ${yScale(el.cy)})`}
                      fill={color}
                      fillOpacity={0.12}
                      stroke={color}
                      strokeWidth={2}
                    />
                  );
                })}

              {points.map((pt, idx) => {
                let fill = '#4F46E5';
                if (kind === 'isolation-forest') {
                  fill = pt.isAnomaly ? '#E11D48' : '#0D9488';
                } else if (kind === 'dbscan') {
                  const lbl = viz.labels?.[idx] ?? -1;
                  fill = lbl === -1 ? '#E11D48' : CLUSTER_COLORS[lbl % CLUSTER_COLORS.length];
                } else if (kind === 'hierarchical') {
                  const lbl = viz.labels?.[idx] ?? 0;
                  fill = CLUSTER_COLORS[lbl % CLUSTER_COLORS.length];
                } else if (kind === 'gmm-em') {
                  const lbl = viz.assignments?.[idx] ?? 0;
                  fill = CLUSTER_COLORS[lbl % CLUSTER_COLORS.length];
                } else if (pt.label !== undefined) {
                  fill = pt.label === 1 ? '#0D9488' : '#4F46E5';
                }

                return (
                  <motion.circle
                    key={`pt-${pt.id ?? idx}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    cx={xScale(pt.x)}
                    cy={yScale(pt.y)}
                    r={hoveredPt?.id === (pt.id ?? idx) ? 7.5 : 5.5}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={1.75}
                    onMouseEnter={() => setHoveredPt({ id: pt.id ?? idx, x: pt.x, y: pt.y })}
                    onMouseLeave={() => setHoveredPt(null)}
                  />
                );
              })}

              {(kind === 'knn-2d' || kind === 'gaussian-nb') && viz.query && (
                <g transform={`translate(${xScale(viz.query.x)},${yScale(viz.query.y)})`}>
                  <circle r={7.5} fill="#D97706" stroke="#FFFFFF" strokeWidth={2} />
                  <text y={-11} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#D97706">
                    q
                  </text>
                </g>
              )}
            </g>
          </g>
        </svg>

        {hoveredPt && (
          <div className="absolute top-3 right-3 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-[#0F172A] shadow-md pointer-events-none">
            Pt #{hoveredPt.id}: ({hoveredPt.x}, {hoveredPt.y})
          </div>
        )}
      </div>
    </div>
  );
}
