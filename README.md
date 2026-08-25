# VibeGuard — AI-Powered Vibe Coding Security Platform

> **Tagline:** Code Fast. Scan Smart. Approve Safely.

VibeGuard is an enterprise-grade AI security platform and Gatekeeper designed for AI-assisted and vibe coding. It inspects developer prompts, scans full-stack repositories with a multi-provider AI Router, detects critical vulnerabilities (SQL Injection, Hardcoded Secrets, Weak Authentication, XSS), synthesizes drop-in secure fixes, and enforces an Approval Gateway before changes are applied.

---

## 🚀 Presentation Demo Flow (Section 29)

For a live presentation or grading review, follow these exact 18 steps:

1. **Login**: Launch the app and authenticate as `Shyam Sundar` (`shyam@vibeguard.io`).
2. **Select / Load Project**: Click **Quick Load "College E-Commerce"** (or create a new project and upload a ZIP/Folder).
3. **Inspect in File Explorer**: Browse `src/database.js`, `src/auth.js`, `src/routes/api.js`, `package.json`, and `.env.example`.
4. **Masked Secrets**: Notice `.env` secrets and API credentials are automatically masked before AI processing.
5. **Pre-Code Security Check**: Open **Pre-Code Check** tab, enter a coding prompt (e.g. *"Create login system with password storage"*), and observe the real-time Risk Score (e.g. `80/100`), Threat vectors, and AI mitigation directives.
6. **Scan Entire Project**: Click **Scan Entire Project**. Watch the multi-stage visual pipeline:
   - File Discovery & AST Traversal
   - Secret Detection & Pattern Filtering
   - Multi-AI Router Failover Engine
   - Rule Evaluation & Score Computation
7. **AI Router Selection**: The router dynamically selects the highest-priority available AI provider (e.g. `Gemini-1 (Primary)`).
8. **Findings View**: Findings populate with severity badges:
   - 🔴 **CRITICAL**: SQL Injection in `src/database.js:14`
   - 🔴 **CRITICAL**: Hardcoded Credential / Secret Key in `src/auth.js:8`
   - 🟠 **HIGH**: Weak Password Hashing (MD5) in `src/auth.js:19`
   - 🟠 **HIGH**: Reflected XSS in `src/routes/api.js:12`
9. **Monaco Code Inspector**: Click the SQL Injection finding. Monaco Editor automatically scrolls to the exact problematic line and highlights it with a glowing marker.
10. **WHAT + WHERE + WHY**: The side panel breaks down:
    - **WHAT**: Direct user input concatenation into SQL query.
    - **WHY**: The query structure can be manipulated by malicious inputs (`' OR 1=1 --`).
    - **RISK**: Full database compromise and data exfiltration.
    - **RECOMMENDATION**: Parameterized queries using prepared statements.
11. **Generate Secure Fix**: Click **Generate Secure Fix**. Gemini AI generates a parameterized prepared query.
12. **Monaco Diff Viewer**: Compare **Before** (vulnerable code) vs **After** (AI secure fix) side-by-side.
13. **Security Gateway**: Click **Review in Security Gateway & Apply**. The Gateway dialog displays the action request: Target File, Action, Risk Level (HIGH), Reason, and `[ REJECT ]` / `[ APPROVE ]` buttons.
14. **Approve & Apply**: Click `[ APPROVE ]`.
15. **Automated Re-Scan**: VibeGuard replaces the vulnerable line in the project file and automatically executes a re-scan.
16. **Security Score Delta**: Watch the Security Score jump (e.g. **42 → 91/100**) with celebratory confetti!
17. **AI Providers Health**: Open the **AI Providers Router** tab to see live health status pills (🟢 Available, 🟡 Cooldown, 🔴 Quota reached), request counts, and test the 429 failover simulator.
18. **Final Security Audit Report**: Open the **Security Reports** tab to view the executive Before vs After audit report and click **Print / Export PDF**.

---

## 🛠️ Architecture & Tech Stack

```
                    VibeGuard
                       │
          ┌────────────┴────────────┐
          │                         │
       Frontend                  Backend
          │                         │
     React / TS               Node / Express
  Tailwind / Monaco             TypeScript
          │                         │
          └────────────┬────────────┘
                       │
                ┌──────┴──────┐
                │             │
             Supabase       AI Router
          (PostgreSQL /   ┌─────┼─────┬─────┐
           Auth / RLS)  Gemini-1 -2  -3  Provider-B
                              │
                              ▼
                       Security Scanner
                              │
                        ┌─────┴─────┐
                        ▼           ▼
                     AST /       Multi-AI
                     Rules       Analysis
                        │
                        ▼
                    Gatekeeper
                    (Approvals)
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Recharts, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, Multer, Adm-Zip, `@supabase/supabase-js`, `@google/generative-ai`.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) + In-memory high performance local fallback.
- **Multi-AI Router**: Quota management, priority routing, rate limit (429) cooldowns, secret masking, and deterministic structured JSON enforcement.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Run Locally (Full Stack)
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 3. Optional: Configure Live Gemini / Supabase
Create `server/.env`:
```env
PORT=5000
GEMINI_API_KEY_1=your_gemini_api_key_here
GEMINI_API_KEY_2=your_backup_gemini_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
```
*(Note: If no keys are provided, VibeGuard runs in high-performance local mode with deterministic AI reasoning so the entire demo works immediately out of the box).*

---

## 📜 Database Schema (Supabase)
The complete PostgreSQL schema with RLS policies is available in `server/src/supabase/schema.sql`:
- `profiles`
- `projects`
- `project_files`
- `scans`
- `scan_files`
- `vulnerabilities`
- `ai_fixes`
- `approval_requests`
- `audit_logs`
- `ai_providers`
- `ai_usage`
