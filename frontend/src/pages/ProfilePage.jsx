import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { User, Briefcase, Award, CreditCard, Save, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Senior Full Stack Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Mid-Level (3-5 yrs)');
  const [industry, setIndustry] = useState(user?.industry || 'Software & Technology');
  const [bio, setBio] = useState(user?.bio || '');
  const [targetJd, setTargetJd] = useState(user?.target_jd || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [prepCards, setPrepCards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await aiAPI.getPrepCards();
        if (res.data.success) {
          setPrepCards(res.data.cards);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCards();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({
        name,
        target_role: targetRole,
        experience_level: experienceLevel,
        industry,
        bio,
        skills,
        target_jd: targetJd
      });
      setMessage('Profile preferences updated successfully.');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" /> Candidate Profile & Preparation Hub
        </h1>
        <p className="text-xs text-slate-400">
          Manage your target role preferences, core skills, and saved AI preparation cards.
        </p>
      </div>

      <DisclaimerBanner />

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Profile Settings Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" /> Target Role Preferences
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Entry-Level (0-2 yrs)">Entry-Level (0-2 yrs)</option>
                <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                <option value="Senior (5-8 yrs)">Senior (5-8 yrs)</option>
                <option value="Lead / Executive">Lead / Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Consulting & Business">Consulting & Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Skills & Technologies Manager</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. React, Docker, System Design)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief overview of technical accomplishments..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Saved Prep Cards Library */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" /> Saved Preparation Flashcards ({prepCards.length})
          </h2>

          {prepCards.length === 0 ? (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center text-xs text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No saved prep flashcards yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {prepCards.map((card) => (
                <div key={card.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{card.card_type}</span>
                    <span className="text-[10px] text-slate-500">{new Date(card.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{card.title}</h4>
                  {card.content?.talkingPoints && (
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {card.content.talkingPoints.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.content?.keyMetrics && (
                    <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                      Metrics: {card.content.keyMetrics}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
