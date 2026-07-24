import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import StarBreakdown from '../components/StarBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Share2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQId, setExpandedQId] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await interviewAPI.getSession(id);
        if (res.data.success) {
          setSession(res.data.session);
          if (res.data.session.questions?.length > 0) {
            setExpandedQId(res.data.session.questions[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading performance report..." fullScreen />;

  if (!session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Session Report Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Executive Summary Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-[10px] uppercase">
              {session.interview_type} Performance Summary
            </span>
            <h1 className="text-2xl font-extrabold text-white">{session.title}</h1>
            <p className="text-xs text-slate-400">{session.experience_level} • {session.industry}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Rating</span>
              <ScoreBadge score={session.overall_score} size="xl" />
            </div>
          </div>
        </div>

        <DisclaimerBanner />

        {/* AI Summary Text */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Executive AI Performance Assessment
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {session.summary || 'Solid session execution demonstrating foundational competence.'}
          </p>
        </div>

        {/* Strengths & Growth Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
            <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {(session.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
            <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Areas for Coaching Focus
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {(session.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 7-Day Personalized Improvement Plan */}
      {(session.improvement_plan || []).length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Personalized 7-Day Action Plan
            </h3>
            <span className="text-xs text-slate-400">Step-by-step improvement roadmap</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.improvement_plan.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px]">
                    Day {item.day || idx + 1}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">{item.focus}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-by-Question Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" /> Detailed Question & STAR Evaluation Breakdown
        </h2>

        <div className="space-y-4">
          {(session.questions || []).map((q, idx) => {
            const isExpanded = expandedQId === q.id;
            const fb = q.feedback;

            return (
              <div key={q.id} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
                <div
                  onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">Question {idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{q.category}</span>
                      {q.is_follow_up === 1 && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">Follow-Up</span>}
                    </div>
                    <h4 className="font-bold text-sm text-white">{q.question_text}</h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {fb && <ScoreBadge score={fb.overall_score} size="md" />}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/40 space-y-6">

                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400">Your Submitted Answer:</span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                        {q.answer ? q.answer.answer_text : 'No answer submitted.'}
                      </p>
                    </div>

                    {fb && (
                      <>
                        {/* STAR Breakdown */}
                        <div>
                          <span className="text-xs font-bold text-indigo-300 mb-2 block">STAR Framework Analysis:</span>
                          <StarBreakdown breakdown={fb.star_breakdown} />
                        </div>

                        {/* Model STAR Answer */}
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-400 block">Exemplar Improved STAR Model Response:</span>
                          <p className="text-xs text-slate-300 leading-relaxed bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl">
                            {fb.improved_star_response}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
