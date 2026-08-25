import { Router } from 'express';
import { memoryStore, supabase } from '../supabase/client.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get current authenticated user / profile
router.get('/me', async (req, res) => {
  const users = Array.from(memoryStore.users.values());
  const user = users[0] || {
    id: 'usr_shyam',
    email: 'shyam@vibeguard.io',
    name: 'Shyam Sundar',
    role: 'Lead Security Engineer',
    created_at: new Date().toISOString()
  };

  res.json({ success: true, user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const meta = data.user.user_metadata || {};
        const profile = {
          id: data.user.id,
          email: data.user.email || email,
          name: meta.name || meta.full_name || email.split('@')[0],
          role: 'Security Engineer',
          created_at: data.user.created_at || new Date().toISOString()
        };
        memoryStore.users.set(profile.id, profile);
        return res.json({ success: true, user: profile, session: data.session });
      }
    } catch (e) {
      console.warn('[Supabase Auth Warning] Fallback to app auth:', e);
    }
  }

  // App / Database Account Match
  const existingUser = Array.from(memoryStore.users.values()).find(
    u => u.email?.toLowerCase() === email?.toLowerCase()
  );

  const user = existingUser || {
    id: 'usr_' + uuidv4().slice(0, 8),
    email: email || 'shyam@vibeguard.io',
    name: email ? email.split('@')[0] : 'Shyam Sundar',
    role: 'Security Engineer',
    created_at: new Date().toISOString()
  };

  memoryStore.users.set(user.id, user);

  // Sync profile to Supabase database table
  if (supabase) {
    (async () => {
      try {
        await supabase.from('profiles').upsert({
          id: user.id.startsWith('usr_') ? undefined : user.id,
          email: user.email,
          name: user.name,
          role: user.role
        });
      } catch (err) {}
    })();
  }

  res.json({ success: true, user, token: 'vg_session_token_' + Date.now() });
});

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, full_name: name } }
      });
      if (!error && data.user) {
        const profile = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || email.split('@')[0],
          role: 'Security Engineer',
          created_at: data.user.created_at || new Date().toISOString()
        };
        memoryStore.users.set(profile.id, profile);
        return res.json({ success: true, user: profile, session: data.session });
      }
    } catch (e) {
      console.warn('[Supabase Auth Warning] Fallback to app signup:', e);
    }
  }

  // App User Registration
  const user = {
    id: uuidv4(),
    email,
    name: name || email.split('@')[0],
    role: 'Security Engineer',
    created_at: new Date().toISOString()
  };

  memoryStore.users.set(user.id, user);

  // Sync profile to Supabase database table
  if (supabase) {
    (async () => {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        });
      } catch (err) {}
    })();
  }

  res.json({ success: true, user, token: 'vg_session_token_' + Date.now() });
});

export default router;
