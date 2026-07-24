import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  History,
  GitCompare,
  Trash2,
  Archive,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.getSessions();
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleSelectCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(prev => prev.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare(prev => [...prev, id]);
      }
    }
  };

  const handleRunCompare = async () => {
    if (selectedForCompare.length !== 2) {
      alert('Please select exactly 2 sessions to run side-by-side comparison.');
      return;
    }

    setComparing(true);
    try {
      const res = await interviewAPI.compareSessions(selectedForCompare[0], selectedForCompare[1]);
      if (res.data.success) {
        setCompareResult(res.data.comparison);
      }
    } catch (err) {
      console.error('Failed to compare sessions:', err);
      alert('Failed to compare sessions.');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-indigo-600/25">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold">
            <History className="w-3.5 h-3.5" />
            <span>Interview Log & Side-by-Side Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Interview History & Comparison</h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl font-medium leading-relaxed">
            Select any two practice sessions to compare STAR performance, relevance improvements, and growth trajectory side-by-side.
          </p>
        </div>

        {selectedForCompare.length === 2 && (
          <button
            onClick={handleRunCompare}
            disabled={comparing}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs shadow-xl flex items-center gap-2 transition-all"
          >
            <GitCompare className="w-4 h-4 text-indigo-700" /> {comparing ? 'Comparing...' : 'Compare Selected (2)'}
          </button>
        )}
      </div>

      <DisclaimerBanner />

      {/* Side-by-Side Comparison Modal / Box */}
      {compareResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-indigo-500/40 indigo-glow">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> Side-by-Side Performance Comparison
            </h3>
            <button
              onClick={() => setCompareResult(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Close Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">Session 1</span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{compareResult.session1.title}</h4>
              <ScoreBadge score={compareResult.session1.overall_score} size="lg" label="Overall Score" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Type: {compareResult.session1.interview_type} • {compareResult.session1.experience_level}</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase">Session 2</span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{compareResult.session2.title}</h4>
              <ScoreBadge score={compareResult.session2.overall_score} size="lg" label="Overall Score" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Type: {compareResult.session2.interview_type} • {compareResult.session2.experience_level}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-slate-800 dark:text-indigo-200 leading-relaxed font-medium">
            <strong>Gemini Growth Insight:</strong> {compareResult.analysis || 'Both sessions show consistent progress across technical depth and STAR response structuring.'}
          </div>
        </div>
      )}

      {/* History List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">All Logged Sessions ({sessions.length})</h2>

        {loading ? (
          <LoadingSpinner message="Fetching history logs..." />
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const isSelected = selectedForCompare.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/sessions/${s.id}`)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectCompare(s.id);
                      }}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.interview_type} • {s.experience_level} • {new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ScoreBadge score={s.overall_score} size="md" />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
