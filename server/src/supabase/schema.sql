-- ==========================================================
-- VibeGuard Zero-Code-Retention Schema for Supabase PostgreSQL
-- Project Ref: vuqqdcmrkisoymgstrpp
-- ==========================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects & Linked GitHub Repos Table
-- NOTE: Stores Project Metadata & GitHub Link ONLY. (Source files remain in local server memory)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'JavaScript/TypeScript',
  github_url TEXT,
  github_branch TEXT DEFAULT 'main',
  file_count INT DEFAULT 0,
  total_lines INT DEFAULT 0,
  security_score INT DEFAULT 100,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Scans History Table
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('QUEUED', 'ANALYZING', 'COMPLETED', 'FAILED')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INT DEFAULT 1200,
  files_scanned INT DEFAULT 0,
  critical_count INT DEFAULT 0,
  high_count INT DEFAULT 0,
  medium_count INT DEFAULT 0,
  low_count INT DEFAULT 0,
  security_score INT DEFAULT 100,
  provider_used TEXT DEFAULT 'Antigravity AI Pro',
  model_used TEXT DEFAULT 'antigravity-pro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vulnerabilities & Findings Table
CREATE TABLE IF NOT EXISTS public.vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file TEXT NOT NULL,
  line INT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  why TEXT NOT NULL,
  risk TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  code_snippet TEXT,
  detected_by TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FIXED', 'IGNORED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT,
  risk TEXT CHECK (risk IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  decision TEXT DEFAULT 'EXECUTED',
  provider TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI Providers Health Table
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'COOLDOWN', 'QUOTA_REACHED', 'DISABLED')),
  priority INT DEFAULT 1,
  request_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  last_used TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant Access to anon and authenticated roles
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.scans TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.vulnerabilities TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.ai_providers TO anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for Application Access
CREATE POLICY "Allow public read-write for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for scans" ON public.scans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for vulnerabilities" ON public.vulnerabilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ai_providers" ON public.ai_providers FOR ALL USING (true) WITH CHECK (true);

-- Seed Default Demo Project & Profile
INSERT INTO public.profiles (id, email, name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'shyam@vibeguard.io', 'Shyam Sundar', 'Lead Security Engineer')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.projects (id, user_id, name, description, language, github_url, github_branch, security_score)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'College E-Commerce Demo',
  'Sample vulnerable educational project for AI security scanning demonstration',
  'JavaScript/Node.js',
  'https://github.com/vibeguard/college-ecommerce',
  'main',
  10
)
ON CONFLICT (id) DO NOTHING;
