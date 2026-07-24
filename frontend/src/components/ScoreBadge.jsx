import React from 'react';

export default function ScoreBadge({ score, label, size = 'md' }) {
  const numScore = typeof score === 'number' ? score : 0;
  let colorClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30';

  if (numScore >= 80) {
    colorClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 emerald-glow';
  } else if (numScore >= 60) {
    colorClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 amber-glow';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 font-extrabold rounded-lg',
    md: 'text-xs px-3 py-1.5 font-extrabold rounded-xl',
    lg: 'text-sm px-4 py-2 font-extrabold rounded-2xl',
    xl: 'text-xl px-5 py-2.5 font-extrabold rounded-2xl'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border transition-all duration-300 ${colorClass} ${sizeClasses[size]}`}>
      {numScore}%
      {label && <span className="font-semibold opacity-90 text-xs">({label})</span>}
    </span>
  );
}
