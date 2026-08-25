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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vibeguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check live Supabase session if available
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'developer@vibeguard.io',
            name: meta.full_name || meta.name || meta.user_name || session.user.email?.split('@')[0] || 'Security Developer',
            role: 'Security Engineer',
            created_at: session.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          setLoading(false);
          return;
        }
      });

      // Listen for OAuth callbacks / login events
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'developer@vibeguard.io',
            name: meta.full_name || meta.name || meta.user_name || session.user.email?.split('@')[0] || 'Security Developer',
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
    }

    // 2. Local fallback
    async function loadLocalUser() {
      try {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('vibeguard_user', JSON.stringify(res.user));
        }
      } catch (err) {
        if (!user) {
          const defaultUser: UserProfile = {
            id: 'usr_shyam',
            email: 'shyam@vibeguard.io',
            name: 'Shyam Sundar',
            role: 'Lead Security Engineer',
            created_at: new Date().toISOString()
          };
          setUser(defaultUser);
          localStorage.setItem('vibeguard_user', JSON.stringify(defaultUser));
        }
      } finally {
        setLoading(false);
      }
    }

    loadLocalUser();
  }, []);

  const login = async (email: string, password?: string) => {
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const meta = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: meta.full_name || meta.name || email.split('@')[0],
            role: 'Security Engineer',
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          return;
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword fallback:', e);
      }
    }

    const res = await api.login(email, password);
    setUser(res.user);
    localStorage.setItem('vibeguard_user', JSON.stringify(res.user));
  };

  const signup = async (email: string, name: string, password?: string) => {
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, name } }
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: name,
            role: 'Security Engineer',
            created_at: data.user.created_at || new Date().toISOString()
          };
          setUser(profile);
          localStorage.setItem('vibeguard_user', JSON.stringify(profile));
          return;
        }
      } catch (e) {
        console.warn('Supabase signUp fallback:', e);
      }
    }

    // Direct fallback registration
    const res = await api.signup(email, name, password);
    setUser(res.user);
    localStorage.setItem('vibeguard_user', JSON.stringify(res.user));
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

    // Fallback if supabase client not connected
    const fallbackUser: UserProfile = {
      id: `usr_${provider}_` + Date.now(),
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
