import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  History,
  Users,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/practice', label: 'AI Practice', icon: BrainCircuit },
    { path: '/history', label: 'History & Compare', icon: History },
    { path: '/mentor', label: 'Mentor Hub', icon: Users },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Left Zone: Brand Logo */}
          <RouterLink to={user ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight block">CareerPilot <span className="text-indigo-600 dark:text-indigo-400">AI</span></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold block">Interview Practice</span>
            </div>
          </RouterLink>

          {/* Center Zone: Nav Links */}
          {user && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <RouterLink
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </RouterLink>
                );
              })}
            </div>
          )}

          {/* Right Zone: User Actions */}
          <div className="flex items-center gap-3 shrink-0">

            {user ? (
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md flex items-center justify-center font-extrabold text-xs text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block truncate max-w-[120px]">{user.target_role || 'Candidate'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <RouterLink
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Log In
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Get Started Free
                </RouterLink>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-700 dark:text-slate-400 hover:text-slate-900 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {user ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <RouterLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/60"
                  >
                    <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {link.label}
                  </RouterLink>
                );
              })}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">{user.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <RouterLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Log In
              </RouterLink>
              <RouterLink
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                Register Account
              </RouterLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
