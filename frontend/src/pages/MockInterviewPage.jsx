import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import ScoreBadge from '../components/ScoreBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import StarBreakdown from '../components/StarBreakdown';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  BrainCircuit,
  Clock,
  Send,
  Sparkles,
  Award,
  ChevronRight,
  User,
  Bot,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function MockInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [submittedAnswerText, setSubmittedAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const fetchSessionData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await interviewAPI.getSessionDetails(id);
      if (res.data.success) {
        setSession(res.data.session);
        setQuestions(res.data.questions || []);

        if (isInitial) {
          const unansweredIdx = (res.data.questions || []).findIndex(q => !q.user_answer);
          if (unansweredIdx !== -1) {
            setCurrentIndex(unansweredIdx);
          } else if (res.data.questions.length > 0) {
            setCurrentIndex(res.data.questions.length - 1);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load mock session:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData(true);
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!responseText.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    setSubmitting(true);
    setEvalResult(null);
    setSubmittedAnswerText(responseText);

    try {
      const res = await interviewAPI.submitAnswer({
        session_id: id,
        question_id: currentQuestion.id,
        user_answer: responseText,
        time_spent_seconds: timerSeconds
      });

      if (res.data.success) {
        setEvalResult(res.data);
        fetchSessionData(false);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert(err.response?.data?.message || 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setEvalResult(null);
      setResponseText('');
      setSubmittedAnswerText('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    try {
      await interviewAPI.completeSession(id);
      navigate(`/sessions/${id}`);
    } catch (err) {
      console.error('Failed to complete session:', err);
      navigate(`/sessions/${id}`);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Initializing 1-on-1 AI interview room..." fullScreen />;
  }

  if (!session || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <BrainCircuit className="w-16 h-16 text-slate-400 mx-auto animate-pulse" />
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Session Not Found</h2>
        <button onClick={() => navigate('/practice')} className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-lg">
          Return to AI Practice Setup
        </button>
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Top Header Bar */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase">
                {session.interview_type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{session.experience_level} • {session.industry}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{session.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold text-xs shadow-md">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>

            <button
              onClick={handleFinishSession}
              className="px-5 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all"
            >
              End Interview Early
            </button>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <span>Interview Stage</span>
            <span>Question {currentIndex + 1} of {questions.length} ({progressPercentage}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Main 1-on-1 Interview Card */}
      {currentQuestion && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          
          <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Question {currentIndex + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  {currentQuestion.category || 'Technical'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                  {currentQuestion.difficulty || 'Medium'}
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.question_text}
            </h2>

            {currentQuestion.star_guidance && (
              <p className="text-xs text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 p-3 rounded-xl font-medium border border-indigo-500/20">
                💡 <span className="font-bold">STAR Framework Tip:</span> {currentQuestion.star_guidance}
              </p>
            )}
          </div>

          {/* Voice & Text Recording Room */}
          {!evalResult && (
            <div className="space-y-6">
              <VoiceRecorder
                onTranscriptChange={(txt) => setResponseText(txt)}
                initialText={currentQuestion.user_answer || responseText}
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Speak into your mic or type. Gemini will evaluate relevance, evidence, and compare against exemplar models.
                </p>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !responseText.trim()}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
                    submitting || !responseText.trim()
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 transform hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <>Evaluating Answer with Gemini AI...</>
                  ) : (
                    <>Submit & Compare Answer <Send className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Comparison & Evaluation View */}
      {evalResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8 border border-emerald-500/30 emerald-glow">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase">
                <Award className="w-5 h-5 text-emerald-500" /> Evaluation & Response Comparison
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Gemini AI Answer Feedback</h3>
            </div>
            <ScoreBadge score={typeof evalResult.feedback?.relevance_score === 'number' ? evalResult.feedback.relevance_score : 0} size="lg" label="Relevance Score" />
          </div>

          <StarBreakdown feedback={evalResult.feedback} />

          {/* Side-by-Side Answer Comparison View */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Direct Response Comparison
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Candidate Response Card */}
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <User className="w-4 h-4 text-indigo-500" /> Your Submitted Response
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {submittedAnswerText || currentQuestion.user_answer || 'No response provided.'}
                </p>
              </div>

              {/* Gemini Ideal Exemplar STAR Answer Card */}
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-300">
                  <Bot className="w-4 h-4 text-indigo-500" /> Gemini Ideal Exemplar STAR Model Answer
                </div>
                <p className="text-xs text-slate-800 dark:text-indigo-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {evalResult.feedback?.improved_answer_model || 'No model answer generated.'}
                </p>
              </div>

            </div>
          </div>

          {/* Strengths & Improvements List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {evalResult.feedback?.strengths && evalResult.feedback.strengths.length > 0 && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h5 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths Identified
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-emerald-200 font-medium">
                  {evalResult.feedback.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evalResult.feedback?.improvements && evalResult.feedback.improvements.length > 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h5 className="text-xs font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Recommendations for Improvement
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-amber-200 font-medium">
                  {evalResult.feedback.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* Next Question Navigation Button */}
          <div className="pt-4 flex justify-end border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              {currentIndex < questions.length - 1 ? (
                <>Next Question ({currentIndex + 2} of {questions.length}) <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Finish & View Final Performance Report <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
