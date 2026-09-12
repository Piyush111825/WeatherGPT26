import React from 'react';
import { X, Sparkles, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export interface ExplanationStepData {
  title: string;
  location: string;
  whatIsHappening: string;
  whyIsItHappening: string;
  howItAffectsUser: string;
  recommendedDecision: string;
  recommendedAction: string;
  confidence: number;
  dataSources: string[];
}

interface ExplainThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExplanationStepData;
}

export const ExplainThisModal: React.FC<ExplainThisModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl my-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                5-Step Scientific Synthesis
              </span>
              <h3 className="text-base sm:text-lg font-extrabold">{data.title}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Location: {data.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 5 Steps Body */}
        <div className="mt-5 space-y-3.5 text-xs">
          {/* Step 1 */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              1. What is Happening
            </span>
            <p className="mt-1 text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
              {data.whatIsHappening}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              2. Why is it Happening
            </span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.whyIsItHappening}
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              3. How It Affects You
            </span>
            <p className="mt-1 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {data.howItAffectsUser}
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              4. Recommended Decision
            </span>
            <p className="mt-1 text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
              {data.recommendedDecision}
            </p>
          </div>

          {/* Step 5 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/30">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>5. Recommended Action</span>
            </div>
            <p className="mt-1.5 text-zinc-800 dark:text-zinc-100 leading-relaxed font-semibold">
              {data.recommendedAction}
            </p>
          </div>

          {/* Data Sources and Confidence */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-zinc-400" />
              <span>Sources: {data.dataSources.join(', ')}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Confidence: {data.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
