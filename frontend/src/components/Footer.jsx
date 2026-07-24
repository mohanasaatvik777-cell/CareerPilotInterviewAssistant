import React from 'react';
import DisclaimerBanner from './DisclaimerBanner';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <DisclaimerBanner />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-900">
          <p>© {new Date().getFullYear()} CareerPilot AI — Full-Stack Generative AI Interview Practice Platform.</p>
          <div className="flex items-center gap-6 font-medium">
            <span>Powered by Google Gemini API & Node.js</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
