import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI, aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  BrainCircuit,
  Sparkles,
  Briefcase,
  Layers,
  Building,
  Target,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function AIPracticePage() {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (2-5 yrs)');
  const [industry, setIndustry] = useState('Software & Technology');
  const [interviewType, setInterviewType] = useState('Technical');
  const [focusTopics, setFocusTopics] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [loading, setLoading] = useState(false);
  const [roleExplanation, setRoleExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);

  const handleExplainRole = async () => {
    if (!targetRole.trim()) return;
    setExplaining(true);
    try {
      const res = await aiAPI.explainRole({ role: targetRole, experience_level: experienceLevel });
      if (res.data.success) {
        setRoleExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error('Failed to explain role:', err);
    } finally {
      setExplaining(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await interviewAPI.createSession({
        targetRole,
        experienceLevel,
        industry,
        interviewType,
        focusTopics,
        jobDescription,
        totalQuestions
      });

      if (res.data.success) {
        navigate(`/mock/${res.data.session.id}`);
      }
    } catch (err) {
      console.error('Failed to create practice session:', err);
      alert(err.response?.data?.message || 'Failed to create practice session.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Generating customized questions for ${targetRole} with Gemini AI...`} fullScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white space-y-3 shadow-xl shadow-indigo-600/25">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configurable AI Interview Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Start New Practice Session</h1>
        <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl font-medium leading-relaxed">
          Specify your exact target role, experience level, industry, and custom focus topics. Gemini will generate questions tailored to your request.
        </p>
      </div>

      <DisclaimerBanner />

      <form onSubmit={handleCreateSession} className="space-y-8">

        {/* Step 1: Target Role & Experience */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm">1</div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Target Role & Experience Level</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Define your target job title and career seniority</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">Target Role Title *</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Data Scientist, Product Manager"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">Experience Level *</label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                  <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                  <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  <option value="Lead / Principal">Lead / Principal</option>
                  <option value="Executive / Director">Executive / Director</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExplainRole}
            disabled={explaining || !targetRole}
            className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center gap-2 hover:bg-indigo-500/20 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" /> {explaining ? 'Analyzing Role...' : 'Explain Key Competencies with AI'}
          </button>

          {roleExplanation && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-slate-800 dark:text-indigo-200 leading-relaxed font-medium">
              {roleExplanation}
            </div>
          )}
        </div>

        {/* Step 2: Industry & Interview Format */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm">2</div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Industry Sector & Drill Format</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Choose interview question style</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">Industry Sector</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Consulting & Strategy">Consulting & Strategy</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">Interview Format</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="Behavioural">Behavioural (STAR Focus)</option>
                <option value="Technical">Technical & System Design</option>
                <option value="Managerial">Managerial & Leadership</option>
                <option value="Case Study">Case Study & Problem Solving</option>
                <option value="HR">HR Screening</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">Total Questions</label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Questions (Quick Drill)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (In-Depth)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Custom Focus Topics & Special Question Requests */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm">3</div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Custom Focus Topics & Special Question Requests</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Specify exact tech stacks, frameworks, or interview topics you want AI to ask about</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={focusTopics}
              onChange={(e) => setFocusTopics(e.target.value)}
              placeholder="e.g. React Performance, GraphQL, PostgreSQL indexing, System Architecture, Agile Conflict"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Step 4: Optional Job Description */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm">4</div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Target Job Description (Optional)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Paste company job posting text for tailored questions</p>
              </div>
            </div>
          </div>

          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description responsibilities, requirements, and tech stack here..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            Generate & Launch Tailored AI Session <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
