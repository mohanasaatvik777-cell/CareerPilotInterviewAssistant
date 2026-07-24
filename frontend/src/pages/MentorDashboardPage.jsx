import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mentorAPI } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import StarBreakdown from '../components/StarBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { Users, Lock, Award, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

export default function MentorDashboardPage() {
  const { code } = useParams();

  const [sharedSessions, setSharedSessions] = useState([]);
  const [singleSessionData, setSingleSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (code) {
          // Fetch specific shared session by share code
          const res = await mentorAPI.getSharedSessionByCode(code);
          if (res.data.success) {
            setSingleSessionData(res.data);
          }
        } else {
          // Fetch sessions shared with logged in mentor's email
          const res = await mentorAPI.getSharedSessions();
          if (res.data.success) {
            setSharedSessions(res.data.sharedSessions);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to access shared mentor session.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);

  if (loading) return <LoadingSpinner message="Loading mentor portal..." fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">
          <Users className="w-3.5 h-3.5" />
          <span>Invited Mentor Review Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mentor Review Dashboard</h1>
        <p className="text-xs text-slate-400">
          Invited mentors have view-only access to explicitly shared candidate practice sessions.
        </p>
      </div>

      <DisclaimerBanner />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* View Single Shared Session by Code */}
      {singleSessionData ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Candidate: {singleSessionData.candidate?.name}</span>
                <h2 className="text-xl font-extrabold text-white">{singleSessionData.session?.title}</h2>
                <p className="text-xs text-slate-400">{singleSessionData.session?.target_role} • {singleSessionData.session?.experience_level}</p>
              </div>
              <ScoreBadge score={singleSessionData.session?.overall_score} size="lg" />
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
              {singleSessionData.session?.summary}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Questions & Answers Review</h3>
            {(singleSessionData.session?.questions || []).map((q, idx) => (
              <div key={q.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">Question {idx + 1} ({q.category})</span>
                  {q.feedback && <ScoreBadge score={q.feedback.overall_score} size="sm" />}
                </div>
                <h4 className="font-bold text-sm text-white">"{q.question_text}"</h4>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Candidate Answer:</span>
                  <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {q.answer ? q.answer.answer_text : 'No answer'}
                  </p>
                </div>

                {q.feedback && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-indigo-300">Gemini STAR Analysis:</span>
                    <StarBreakdown breakdown={q.feedback.star_breakdown} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List Sessions Shared with Mentor Email */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Sessions Shared With You ({sharedSessions.length})</h2>

          {sharedSessions.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Shared Sessions Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When a candidate shares an interview session using your email, it will be listed here for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedSessions.map((share) => (
                <div key={share.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">From: {share.candidate_name}</span>
                      <h4 className="font-bold text-sm text-white">{share.title}</h4>
                      <p className="text-xs text-slate-400">{share.target_role} • {share.interview_type}</p>
                    </div>
                    <ScoreBadge score={share.overall_score} size="md" />
                  </div>

                  <Link
                    to={`/mentor/share/${share.share_code}`}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 font-bold hover:underline"
                  >
                    Open Full Review <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
