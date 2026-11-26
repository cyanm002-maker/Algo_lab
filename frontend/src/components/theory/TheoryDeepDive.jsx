import React, { useState } from 'react';
import { Lightbulb, ListOrdered, CheckCircle2, AlertTriangle, Compass, Cpu } from 'lucide-react';

export default function TheoryDeepDive({ algorithm }) {
  const [tab, setTab] = useState('brief'); // 'brief' | 'howItWorks' | 'prosCons'
  if (!algorithm) return null;

  const pros = algorithm.prosAndCons || {};
  const props = pros.properties || {};
  const steps = algorithm.howItWorks || [];

  return (
    <div className="bento-card p-5 flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#4F46E5]" />
          Algorithm Brief &amp; Mechanics
        </h3>

        <div className="inline-flex rounded-lg bg-[#F1F5F9] p-0.5 border border-slate-200">
          {[
            { id: 'brief', label: 'Brief & Intuition' },
            { id: 'howItWorks', label: 'How It Works' },
            { id: 'prosCons', label: 'Pros & Cons' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'brief' && (
        <div className="flex flex-col gap-3">
          <div className="bg-[#EEF2FF]/60 border border-indigo-200 rounded-xl p-3.5 flex flex-col gap-1.5">
            <div className="text-xs font-bold text-[#4F46E5] flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Intuition &amp; Core Idea
            </div>
            <p className="text-xs text-[#0F172A] leading-relaxed">{algorithm.intuition}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 font-semibold">Difficulty</div>
              <div className="text-[11px] font-bold text-[#0F172A]">{algorithm.difficulty}</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 font-semibold">Time</div>
              <div className="text-[11px] font-mono font-bold text-[#0F172A]">{props.timeComplexity}</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 font-semibold">Interpretability</div>
              <div className="text-[11px] font-bold text-[#4F46E5]">{props.interpretability}</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-2">
              <div className="text-[10px] text-slate-400 font-semibold">Scaling</div>
              <div className="text-[11px] font-bold text-[#0D9488]">{props.scalingRequired}</div>
            </div>
          </div>

          {(pros.applications || []).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-1 mr-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Best For:
              </span>
              {pros.applications.map((app, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-[#475569] border border-slate-200"
                >
                  {app}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'howItWorks' && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 mb-1">
            <ListOrdered className="w-4 h-4 text-[#0D9488]" />
            Step-by-Step Internal Lifecycle
          </div>
          {steps.map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80"
            >
              <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </span>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">{s.title}</div>
                <p className="text-[11px] text-[#475569] leading-snug mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'prosCons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
            <h4 className="text-xs font-bold text-emerald-900 mb-1.5">Advantages</h4>
            <ul className="space-y-1.5">
              {(pros.advantages || []).map((adv, idx) => (
                <li key={idx} className="text-[11px] text-emerald-950/85 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
            <h4 className="text-xs font-bold text-amber-900 mb-1.5">Limitations</h4>
            <ul className="space-y-1.5">
              {(pros.limitations || []).map((lim, idx) => (
                <li key={idx} className="text-[11px] text-amber-950/85 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
