import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  BrainCircuit,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-16">

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 light:bg-indigo-100 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold text-xs tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generative AI Powered Interview Coaching</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Master Role-Specific Interviews with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Gemini AI Coaching</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Rehearse real-world technical, behavioral, and managerial interview scenarios. Receive instant STAR-structured feedback, relevance scores, and actionable 7-day preparation plans.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                Go to Practice Dashboard <ArrowRight className="w-5 h-5 text-white" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  Start Practice Free <ArrowRight className="w-5 h-5 text-white" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  Demo Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="max-w-3xl mx-auto">
          <DisclaimerBanner />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Targeted Questions & JD Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Upload custom job descriptions or pick specific roles (Full Stack, Data Science, Product, HR) to generate hyper-realistic, experience-calibrated interview prompts.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 transition-all duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Real-Time STAR Feedback</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Every answer is evaluated on Relevance, Clarity, Evidence, and STAR framework organization with exemplar improved response models.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 transition-all duration-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Compare & Share with Mentors</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Compare past interview scores side-by-side to measure growth, or generate private share links for mentor review.
            </p>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Simulated Practice Workflow</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Step-by-step interview rehearsal environment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-sm">1</div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Configure Session</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Set target role, experience tier, and optional job description.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-sm">2</div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Interactive Drill</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">One-question-at-a-time simulated interview with live timing.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-sm">3</div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Instant AI Feedback</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Receive Gemini STAR score breakdowns and improved model answers.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mx-auto text-sm">4</div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Actionable Growth</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">Get a 7-day improvement plan and flashcards for your portfolio.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
