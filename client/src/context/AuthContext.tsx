import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<void>;
  logout: () => void;
}

export function getDeterministicUserId(email: string): string {
  try {
    const clean = email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
    return `usr_${clean}`;
  } catch {
    return 'usr_guest';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('vibeguard_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check live Supabase session if available
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userEmail = session.user.email || 'developer@vibeguard.io';
          const profile: UserProfile = {
            id: getDeterministicUserId(userEmail),
            email: userEmail,
            name: meta.full_name || meta.name || meta.user_name || userEmail.split('@')[0],
            role: 'Security Engineer',
            created_at: session.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          setLoading(false);
          return;
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      // Listen for OAuth callbacks / login events
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const userEmail = session.user.email || 'developer@vibeguard.io';
          const profile: UserProfile = {
            id: getDeterministicUserId(userEmail),
            email: userEmail,
            name: meta.full_name || meta.name || meta.user_name || userEmail.split('@')[0],
            role: 'Security Engineer',
            created_at: session.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('vibeguard_user');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const deterministicId = getDeterministicUserId(cleanEmail);

    // 1. Try Supabase Auth first
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          const meta = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: deterministicId,
            email: cleanEmail,
            name: meta.full_name || meta.name || cleanEmail.split('@')[0],
            role: 'Security Engineer',
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          return;
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword notice:', e);
      }
    }

    // 2. Try API backend if available
    try {
      const res = await api.login(cleanEmail, password);
      if (res?.user) {
        const profile: UserProfile = {
          ...res.user,
          id: deterministicId,
          email: cleanEmail
        };
        setUser(profile);
        localStorage.setItem('vibeguard_user', JSON.stringify(profile));
        return;
      }
    } catch (e) {}

    // 3. Deterministic client session (reconnects with user's saved projects every time)
    const profile: UserProfile = {
      id: deterministicId,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: 'Security Engineer',
      created_at: new Date().toISOString()
    };
    setUser(profile);
    localStorage.setItem('vibeguard_user', JSON.stringify(profile));
  };

  const signup = async (email: string, name: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const deterministicId = getDeterministicUserId(cleanEmail);

    // 1. Try Supabase Auth first
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: name, name } }
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: deterministicId,
            email: cleanEmail,
            name: name,
            role: 'Security Engineer',
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          return;
        }
      } catch (e) {
        console.warn('Supabase signUp notice:', e);
      }
    }

    // 2. Try API backend if available
    try {
      const res = await api.signup(cleanEmail, name, password);
      if (res?.user) {
        const profile: UserProfile = {
          ...res.user,
          id: deterministicId,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0]
        };
        setUser(profile);
        localStorage.setItem('vibeguard_user', JSON.stringify(profile));
        return;
      }
    } catch (e) {}

    // 3. Deterministic client session
    const profile: UserProfile = {
      id: deterministicId,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      role: 'Security Engineer',
      created_at: new Date().toISOString()
    };
    setUser(profile);
    localStorage.setItem('vibeguard_user', JSON.stringify(profile));
  };

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return;
    }

    const fallbackUser: UserProfile = {
      id: `usr_${provider}_oauth`,
      email: `${provider}.user@vibeguard.io`,
      name: `${provider === 'github' ? 'GitHub' : 'Google'} Developer`,
      role: 'Security Engineer',
      created_at: new Date().toISOString()
    };
    setUser(fallbackUser);
    localStorage.setItem('vibeguard_user', JSON.stringify(fallbackUser));
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem('vibeguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, signInWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
