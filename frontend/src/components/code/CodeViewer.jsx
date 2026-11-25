import React, { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check } from 'lucide-react';

SyntaxHighlighter.registerLanguage('python', python);

export default function CodeViewer({ codeTemplates }) {
  const [activeTab, setActiveTab] = useState('fromScratch');
  const [copied, setCopied] = useState(false);

  const code =
    activeTab === 'fromScratch'
      ? codeTemplates?.fromScratch || ''
      : codeTemplates?.scikitLearn || '';

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Python Implementation
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('fromScratch')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'fromScratch'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              From Scratch (NumPy)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scikitLearn')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'scikitLearn'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Production (Scikit-Learn)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#1e1e1e] flex-1 min-h-[260px]">
        <SyntaxHighlighter
          language="python"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.78rem',
            lineHeight: '1.5',
            height: '100%',
            background: '#0b1120'
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
