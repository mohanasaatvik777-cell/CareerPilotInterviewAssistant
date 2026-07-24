import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-50 border border-amber-500/25 dark:border-amber-500/25 light:border-amber-300 text-amber-300 dark:text-amber-300 light:text-amber-900 text-xs font-semibold">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Mock practice & AI feedback platform. Does not guarantee hiring outcomes.</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/10 dark:via-amber-500/5 light:from-amber-100/80 light:via-amber-50/40 border-l-4 border-amber-500 dark:border-amber-500 light:border-amber-600 p-4 rounded-r-2xl my-4 text-xs flex items-start gap-3 shadow-lg">
      <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <h5 className="font-extrabold text-amber-950 dark:text-amber-300 text-xs uppercase tracking-wider mb-0.5">Practice & Coaching Disclaimer</h5>
        <p className="leading-relaxed text-slate-800 dark:text-amber-200/90 font-medium">
          CareerPilot AI provides simulated mock interview scenarios, AI evaluation metrics, and answer improvement recommendations for practice and preparation purposes only. Performance scores do not guarantee hiring outcomes or job offers.
        </p>
      </div>
    </div>
  );
}
