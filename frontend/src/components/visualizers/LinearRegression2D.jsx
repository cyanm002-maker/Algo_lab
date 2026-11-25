import React, { useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MousePointerClick, RotateCcw } from 'lucide-react';

const WIDTH = 680;
const HEIGHT = 400;
const MARGIN = { top: 24, right: 24, bottom: 44, left: 52 };

export default function LinearRegression2D({
  stepData,
  points = [],
  onAddPoint,
  onResetPoints,
  hasCustomPoints
}) {
  const svgRef = useRef(null);
  const [hoveredPt, setHoveredPt] = useState(null);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const { xScale, yScale, xTicks, yTicks } = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMax = Math.max(10, Math.ceil((d3.max(xs) || 9) + 1));
    const yMax = Math.max(10, Math.ceil((d3.max(ys) || 9) + 1));

    const xS = d3.scaleLinear().domain([0, xMax]).range([0, innerWidth]);
    const yS = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]);

    return {
      xScale: xS,
      yScale: yS,
      xTicks: xS.ticks(6),
      yTicks: yS.ticks(6)
    };
  }, [points, innerWidth, innerHeight]);

  const w = stepData?.w ?? 0;
  const b = stepData?.b ?? 0;

  const lineCoords = useMemo(() => {
    const [x0, x1] = xScale.domain();
    return {
      x1: xScale(x0),
      y1: yScale(w * x0 + b),
      x2: xScale(x1),
      y2: yScale(w * x1 + b)
    };
  }, [xScale, yScale, w, b]);

  const handleSvgClick = (event) => {
    if (!svgRef.current || !onAddPoint) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;

    const px = (event.clientX - rect.left) * scaleX - MARGIN.left;
    const py = (event.clientY - rect.top) * scaleY - MARGIN.top;

    if (px < 0 || px > innerWidth || py < 0 || py > innerHeight) return;

    const dataX = Number(xScale.invert(px).toFixed(2));
    const dataY = Number(yScale.invert(py).toFixed(2));
    onAddPoint({ x: dataX, y: dataY });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <MousePointerClick className="w-4 h-4 text-sky-400" />
          <span>Click anywhere inside the plot to add a custom data point</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-sky-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
            ŷ = {w}x + {b}
          </span>
          {hasCustomPoints && (
            <button
              type="button"
              onClick={onResetPoints}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Points
            </button>
          )}
        </div>
      </div>

      <div className="relative w-full bg-slate-950/90 border border-slate-800 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          onClick={handleSvgClick}
          className="w-full h-auto cursor-crosshair select-none block"
        >
          <defs>
            <clipPath id="plot-clip">
              <rect x={0} y={0} width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>

          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Gridlines */}
            {xTicks.map((tick) => (
              <line
                key={`gx-${tick}`}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}
            {yTicks.map((tick) => (
              <line
                key={`gy-${tick}`}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}

            {/* Axes */}
            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="#475569"
            />
            <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="#475569" />

            {xTicks.map((tick) => (
              <text
                key={`tx-${tick}`}
                x={xScale(tick)}
                y={innerHeight + 18}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={11}
                fontFamily="monospace"
              >
                {tick}
              </text>
            ))}
            {yTicks.map((tick) => (
              <text
                key={`ty-${tick}`}
                x={-10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize={11}
                fontFamily="monospace"
              >
                {tick}
              </text>
            ))}

            <text
              x={innerWidth / 2}
              y={innerHeight + 36}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize={12}
            >
              Feature (x)
            </text>
            <text
              transform={`translate(${-36},${innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize={12}
            >
              Target (y)
            </text>

            {/* Clipped Plot Elements */}
            <g clipPath="url(#plot-clip)">
              {/* Residual Error Lines */}
              {points.map((pt, idx) => {
                const yHat = w * pt.x + b;
                return (
                  <line
                    key={`res-${pt.id ?? idx}`}
                    x1={xScale(pt.x)}
                    x2={xScale(pt.x)}
                    y1={yScale(pt.y)}
                    y2={yScale(yHat)}
                    stroke="#fb7185"
                    strokeWidth={1.75}
                    strokeDasharray="4 3"
                    opacity={0.8}
                  />
                );
              })}

              {/* Regression Line */}
              <line
                x1={lineCoords.x1}
                y1={lineCoords.y1}
                x2={lineCoords.x2}
                y2={lineCoords.y2}
                stroke="#38bdf8"
                strokeWidth={2.75}
              />

              {/* Scatter Points */}
              {points.map((pt, idx) => {
                const isHovered = hoveredPt?.id === (pt.id ?? idx);
                return (
                  <circle
                    key={`pt-${pt.id ?? idx}`}
                    cx={xScale(pt.x)}
                    cy={yScale(pt.y)}
                    r={isHovered ? 7 : 5.5}
                    fill="#34d399"
                    stroke="#020617"
                    strokeWidth={1.75}
                    onMouseEnter={() =>
                      setHoveredPt({
                        id: pt.id ?? idx,
                        x: pt.x,
                        y: pt.y,
                        yHat: Number((w * pt.x + b).toFixed(3))
                      })
                    }
                    onMouseLeave={() => setHoveredPt(null)}
                    className="transition-all duration-75"
                  />
                );
              })}
            </g>
          </g>
        </svg>

        {hoveredPt && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-slate-200 pointer-events-none shadow-lg">
            <div>
              (x={hoveredPt.x}, y={hoveredPt.y})
            </div>
            <div className="text-sky-300">ŷ = {hoveredPt.yHat}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          Training Data (x, y)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-sky-400 inline-block" />
          Regression Hypothesis (ŷ = wx + b)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-400 inline-block" />
          Residual Error (ŷ - y)
        </span>
      </div>
    </div>
  );
}
