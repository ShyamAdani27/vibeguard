import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Bot,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TermsAndConditionsPageProps {
  onAccept?: () => void;
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ onAccept }) => {
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  const [hasAgreedAI, setHasAgreedAI] = useState(false);
  const [hasAgreedPrivacy, setHasAgreedPrivacy] = useState(false);
  const [hasAgreedLiability, setHasAgreedLiability] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(`vibeguard_terms_accepted_${userId}`);
    if (accepted === 'true') {
      setHasAgreedAI(true);
      setHasAgreedPrivacy(true);
      setHasAgreedLiability(true);
      setIsSaved(true);
    }
  }, [userId]);

  const allChecked = hasAgreedAI && hasAgreedPrivacy && hasAgreedLiability;

  const handleConfirmAgreement = () => {
    if (!allChecked) return;
    localStorage.setItem(`vibeguard_terms_accepted_${userId}`, 'true');
    localStorage.setItem('vibeguard_terms_accepted_timestamp', new Date().toISOString());
    setIsSaved(true);
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-xs font-mono font-semibold">
          <Scale className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>LEGAL POLICY & AI ACCURACY NOTICE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
          Terms of Service &{' '}
          <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            AI Advisory Disclaimer
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-mono">
          Last Updated: August 2026 • Please read and confirm before utilizing VibeGuard automated AI scanning services.
        </p>
      </div>

      {/* Critical AI Disclaimer Banner (Highlighted Warning) */}
      <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              ⚠️ Important Notice: AI-Generated Security Analysis & Thinking Logic
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300/80 font-mono">
              VibeGuard operates multi-model generative AI engines (Antigravity Claude 3.7 Thinking, Claude 3.6, and Google Gemini).
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-amber-950 dark:text-amber-100 font-sans">
          <strong>Artificial Intelligence models can make mistakes, hallucinate, or produce false positive/negative results.</strong> All security vulnerability assessments, risk scores, taint flow diagrams, and automated code fixes provided by VibeGuard are <strong>advisory in nature</strong>. You, as the developer and organization, are solely responsible for reviewing, testing, and verifying all proposed security solutions before applying them to production systems.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800 dark:text-slate-200 transition-colors">
        {/* Section 1: AI Capabilities & Advisory Nature */}
        <section className="space-y-2.5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-cyan-500 dark:text-cyan-400">01.</span> AI Analysis & Advisory Disclaimer
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            VibeGuard employs autonomous multi-tier AI routers to evaluate source code Abstract Syntax Trees (AST), detect configuration anomalies, and summarize threat vectors. While our models are designed to maximize accuracy, AI outputs do not replace human code audits, penetration testing, or formal security reviews.
          </p>
        </section>

        {/* Section 2: Zero Code Retention & Privacy */}
        <section className="space-y-2.5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-cyan-500 dark:text-cyan-400">02.</span> Zero-Code-Retention & Data Privacy
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your proprietary source code is analyzed strictly in transient runtime memory and is <strong>never stored on persistent external servers</strong>. Only project metadata (project name, repository URL, file counts, and diagnostic vulnerability reports) are stored securely in your Supabase database.
          </p>
        </section>

        {/* Section 3: User Responsibility */}
        <section className="space-y-2.5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-cyan-500 dark:text-cyan-400">03.</span> Developer Responsibility & Approvals
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            VibeGuard incorporates a Gatekeeper Approval system. When VibeGuard recommends a patch, dependency upgrade, or Dockerfile change, the user must explicitly inspect and approve the modification. VibeGuard is not liable for system downtime, data corruption, or regressions resulting from approved AI suggestions.
          </p>
        </section>

        {/* Section 4: Limitation of Liability */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-cyan-500 dark:text-cyan-400">04.</span> Limitation of Liability
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            To the maximum extent permitted by law, VibeGuard and its maintainers provide the software "AS IS" without warranties of any kind. Users agree to hold VibeGuard harmless from any direct or indirect damages arising from the use of AI analysis tools.
          </p>
        </section>
      </div>

      {/* Mandatory Interactive Checkboxes & Acceptance Card */}
      <div className="bg-slate-50 dark:bg-[#0d1322] border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl transition-colors">
        <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
          Mandatory User Acknowledgement & Confirmation
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          Please check the boxes below to confirm your understanding before continuing:
        </p>

        <div className="space-y-3.5">
          {/* Tick Mark 1 */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group">
            <input
              type="checkbox"
              checked={hasAgreedAI}
              onChange={(e) => setHasAgreedAI(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-400 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium select-none">
              <strong>I understand that VibeGuard uses Artificial Intelligence (AI)</strong> to detect security risks and generate fixes. I acknowledge that <strong>AI can make mistakes or false detections</strong>, and I will review and verify all code changes before production deployment.
            </span>
          </label>

          {/* Tick Mark 2 */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group">
            <input
              type="checkbox"
              checked={hasAgreedPrivacy}
              onChange={(e) => setHasAgreedPrivacy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-400 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium select-none">
              I acknowledge the <strong>Zero-Code-Retention policy</strong>, and agree that project vulnerability reports and metadata will be stored in my authenticated Supabase account.
            </span>
          </label>

          {/* Tick Mark 3 */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm group">
            <input
              type="checkbox"
              checked={hasAgreedLiability}
              onChange={(e) => setHasAgreedLiability(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-400 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium select-none">
              I agree to the <strong>Terms of Service and Limitation of Liability</strong>, accepting sole responsibility for the execution and deployment of any remediations.
            </span>
          </label>
        </div>

        {/* Action Button & Status */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          {isSaved ? (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Check className="w-4 h-4" />
              <span>Terms & AI Accuracy Policy Accepted</span>
            </div>
          ) : (
            <span className="text-xs font-mono text-slate-500">
              Check all 3 boxes to confirm and save your agreement.
            </span>
          )}

          <button
            type="button"
            onClick={handleConfirmAgreement}
            disabled={!allChecked}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            <span>Confirm & Accept Terms</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
