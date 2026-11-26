import React from 'react';
import * as d3 from 'd3';
import { TrendingUp } from 'lucide-react';

export default function TimeSeriesForecastPlot({ stepData }) {
  const viz = stepData?.viz || {};
  const series = viz.series || [];
  const xScale = d3.scaleLinear().domain([0, Math.max(1, series.length - 1)]).range([42, 650]);
  const yScale = d3.scaleLinear().domain([0, 10]).range([335, 22]);

  const actualLine = d3
    .line()
    .defined((d) => d.actual !== null)
    .x((d) => xScale(d.t))
    .y((d) => yScale(d.actual))(series);

  const forecastLine = d3
    .line()
    .defined((d) => d.forecast !== null)
    .x((d) => xScale(d.t))
    .y((d) => yScale(d.forecast))(series);

  const ciArea = d3
    .area()
    .defined((d) => d.upper !== null && d.lower !== null)
    .x((d) => xScale(d.t))
    .y0((d) => yScale(d.lower))
    .y1((d) => yScale(d.upper))(series);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#475569] flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-[#4F46E5]" />
        <span>Historical Series + Forecast Horizon &amp; 95% Confidence Interval</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <svg viewBox="0 0 680 370" className="w-full h-auto block">
          {ciArea && <path d={ciArea} fill="#0D9488" fillOpacity={0.14} />}
          {actualLine && <path d={actualLine} fill="none" stroke="#4F46E5" strokeWidth={2.5} />}
          {forecastLine && (
            <path d={forecastLine} fill="none" stroke="#0D9488" strokeWidth={2.5} strokeDasharray="6 4" />
          )}
          {series.map((d) => (
            <circle
              key={d.t}
              cx={xScale(d.t)}
              cy={yScale(d.actual ?? d.forecast ?? 0)}
              r={3.5}
              fill={d.actual !== null ? '#4F46E5' : '#0D9488'}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
