import React from 'react';
import { Target, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StarBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const items = [
    { key: 'situation', label: 'Situation', icon: Target, color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', desc: breakdown.situation },
    { key: 'task', label: 'Task', icon: Zap, color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5', desc: breakdown.task },
    { key: 'action', label: 'Action', icon: CheckCircle2, color: 'border-purple-500/30 text-purple-400 bg-purple-500/5', desc: breakdown.action },
    { key: 'result', label: 'Result', icon: TrendingUp, color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', desc: breakdown.result }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className={`p-3.5 rounded-xl border ${item.color} flex items-start gap-3`}>
            <div className="p-2 rounded-lg bg-slate-900/60 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block mb-1">{item.label}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc || 'Not clearly articulated.'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
