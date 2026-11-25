import React, { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
    <div className="bento-card p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#4F46E5]" />
          <h2 className="text-sm font-bold text-[#0F172A]">
            Python Implementation
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-[#F1F5F9] p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('fromScratch')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'fromScratch'
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              From Scratch (NumPy)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scikitLearn')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'scikitLearn'
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Production (Scikit-Learn)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-xs font-medium text-[#0F172A] flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="text-[#0D9488]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#F1F5F9]">
        <SyntaxHighlighter
          language="python"
          style={oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            fontSize: '0.8rem',
            lineHeight: '1.55',
            background: '#F1F5F9'
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
