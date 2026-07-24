import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, aiAPI } from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  Plus,
  Search,
  Filter,
  BrainCircuit,
  Award,
  Clock,
  Archive,
  Trash2,
  CreditCard,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [prepCardsCount, setPrepCardsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (formatFilter) params.interview_type = formatFilter;
      if (statusFilter) params.status = statusFilter;
      if (minScoreFilter) params.min_score = minScoreFilter;

      const [resSessions, resCards] = await Promise.all([
        interviewAPI.getSessions(params),
        aiAPI.getPrepCards()
      ]);

      if (resSessions.data.success) {
        setSessions(resSessions.data.sessions);
      }
      if (resCards.data.success) {
        setPrepCardsCount(resCards.data.cards.length);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery, formatFilter, statusFilter, minScoreFilter]);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalScores = completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0);
  const avgScore = completedSessions.length > 0 ? Math.round(totalScores / completedSessions.length) : 0;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this practice session?')) {
      try {
        await interviewAPI.deleteSession(id);
        fetchDashboardData();
      } catch (err) {
        alert('Failed to delete session');
      }
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    try {
      await interviewAPI.archiveSession(id);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to archive session');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Hero Executive Banner with Vibrant Indigo/Violet Gradient */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-indigo-600/25">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold shadow-inner">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target Role: {user?.target_role || 'Candidate'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl font-medium leading-relaxed">
            Rehearse role-specific interview prompts, record real verbal responses, receive instant Gemini STAR feedback, and track performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto">
          <Link
            to="/practice"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs shadow-xl shadow-black/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-indigo-700" /> Start Practice Session
          </Link>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-3xl space-y-2 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-xs">
            <span>Total Sessions</span>
            <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{totalSessions}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">{completedSessions.length} completed sessions</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-xs">
            <span>Average Score</span>
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{avgScore}%</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-bold">
            {avgScore >= 80 ? 'Top Tier Performance' : avgScore >= 60 ? 'Good Readiness' : 'Needs Practice'}
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-xs">
            <span>Practice Time</span>
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{totalMinutes} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">mins</span></p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Total verbal timing</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-bold text-xs">
            <span>Saved Flashcards</span>
            <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{prepCardsCount}</p>
          <Link to="/profile" className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline block font-bold">View Prep Cards →</Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, JDs, titles..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
              <Filter className="w-3.5 h-3.5 text-indigo-500" /> Filter:
            </div>

            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Formats</option>
              <option value="Behavioural">Behavioural</option>
              <option value="Technical">Technical</option>
              <option value="Managerial">Managerial</option>
              <option value="Case Study">Case Study</option>
              <option value="HR">HR</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="">Any Score</option>
              <option value="80">80%+ (High)</option>
              <option value="60">60%+ (Medium)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Practice Sessions ({sessions.length})
          </h2>
          <Link to="/history" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
            Compare Sessions & History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching practice sessions..." />
        ) : sessions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">No Interview Sessions Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
              Start your first role-specific AI practice session to test technical questions, receive STAR feedback, and track performance.
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> Start New Practice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(session.status === 'in_progress' ? `/mock/${session.id}` : `/sessions/${session.id}`)}
                className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                      {session.interview_type}
                    </span>
                    <ScoreBadge score={session.overall_score} size="sm" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{session.experience_level} • {session.industry}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                    <span>Questions Answered:</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{session.answered_questions || 0} / {session.total_questions || 5}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round(((session.answered_questions || 0) / (session.total_questions || 5)) * 100))}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleArchive(session.id, e)}
                        title="Archive Session"
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        title="Delete Session"
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
