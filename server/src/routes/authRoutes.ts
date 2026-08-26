import { Router } from 'express';
import { memoryStore, supabase } from '../supabase/client.js';

const router = Router();

function getDeterministicUserId(email: string): string {
  const clean = (email || 'guest').toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
  return `usr_${clean}`;
}

// Get current authenticated user / profile
router.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  if (userId && memoryStore.users.has(userId)) {
    return res.json({ success: true, user: memoryStore.users.get(userId) });
  }

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
  const cleanEmail = (email || '').trim().toLowerCase();
  const deterministicId = getDeterministicUserId(cleanEmail);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (!error && data.user) {
        const meta = data.user.user_metadata || {};
        const profile = {
          id: deterministicId,
          email: cleanEmail,
          name: meta.name || meta.full_name || cleanEmail.split('@')[0],
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
  const existingUser = memoryStore.users.get(deterministicId) || Array.from(memoryStore.users.values()).find(
    u => u.email?.toLowerCase() === cleanEmail
  );

  const user = existingUser || {
    id: deterministicId,
    email: cleanEmail || 'shyam@vibeguard.io',
    name: cleanEmail ? cleanEmail.split('@')[0] : 'Shyam Sundar',
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
  const cleanEmail = (email || '').trim().toLowerCase();
  const deterministicId = getDeterministicUserId(cleanEmail);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name, full_name: name } }
      });
      if (!error && data.user) {
        const profile = {
          id: deterministicId,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
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

  const user = {
    id: deterministicId,
    email: cleanEmail || 'shyam@vibeguard.io',
    name: name || (cleanEmail ? cleanEmail.split('@')[0] : 'Shyam Sundar'),
    role: 'Security Engineer',
    created_at: new Date().toISOString()
  };

  memoryStore.users.set(user.id, user);

  // Sync to Supabase table
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

  res.status(201).json({ success: true, user, token: 'vg_session_token_' + Date.now() });
});

export const authRoutes = router;
export default router;
