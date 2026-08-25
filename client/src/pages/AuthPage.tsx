import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, UserPlus, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, signup, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('shyam@vibeguard.io');
  const [name, setName] = useState('Shyam Sundar');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        await signup(email, name, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError('');
    try {
      await signInWithOAuth(provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to authenticate with ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0d14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111726]/90 border border-[#1f293d] rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mx-auto">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white font-mono tracking-tight">
            Vibe<span className="text-cyan-400">Guard</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Code Fast. Scan Smart. Approve Safely.
          </p>
        </div>

        {/* Social OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#0d1322] hover:bg-[#151f38] border border-[#232f48] hover:border-cyan-500/40 text-xs font-mono font-semibold text-white transition-all shadow-md"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-[#0d1322] hover:bg-[#151f38] border border-[#232f48] hover:border-cyan-500/40 text-xs font-mono font-semibold text-white transition-all shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1f293d] w-full" />
          <span className="bg-[#111726] px-3 text-[10px] uppercase font-mono tracking-widest text-slate-400 absolute">
            Or with Email
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-[#0d1322] p-1 border border-[#1f293d]">
          <button
            onClick={() => { setMode('LOGIN'); setError(''); }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-md transition-all ${
              mode === 'LOGIN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            [ Login ]
          </button>
          <button
            onClick={() => { setMode('SIGNUP'); setError(''); }}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-md transition-all ${
              mode === 'SIGNUP' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            [ Create Account ]
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shyam Sundar"
                className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="shyam@vibeguard.io"
              className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0d1322] border border-[#1f293d] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wider font-mono shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
          >
            {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Authenticating...' : mode === 'LOGIN' ? '[ LOGIN TO VIBEGUARD ]' : '[ CREATE ACCOUNT ]'}
          </button>
        </form>

        <div className="pt-1 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>Secured by Supabase Auth (OAuth & Email)</span>
        </div>
      </div>
    </div>
  );
};
