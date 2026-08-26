import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Bot,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Scale,
  Check,
  Search,
  Code2,
  Flame,
  Sliders,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SecurityRuleStandard } from '../types';
import { securityRulesStore } from '../lib/securityRulesStore';
import { SeverityBadge } from '../components/common/SeverityBadge';

interface TermsAndConditionsPageProps {
  onAccept?: () => void;
  initialTab?: 'terms' | 'guide';
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({
  onAccept,
  initialTab = 'terms'
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  const [activeTab, setActiveTab] = useState<'terms' | 'guide'>(initialTab);

  // Terms State
  const [hasAgreedAI, setHasAgreedAI] = useState(false);
  const [hasAgreedPrivacy, setHasAgreedPrivacy] = useState(false);
  const [hasAgreedLiability, setHasAgreedLiability] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Security Guide State
  const [rules, setRules] = useState<SecurityRuleStandard[]>(() =>
    securityRulesStore.getRules(userId)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'VULN' | 'SECURE'>>({});

  useEffect(() => {
    const accepted = localStorage.getItem(`vibeguard_terms_accepted_${userId}`);
    if (accepted === 'true') {
      setHasAgreedAI(true);
      setHasAgreedPrivacy(true);
      setHasAgreedLiability(true);
      setIsSaved(true);
    }
  }, [userId]);

  useEffect(() => {
    setRules(securityRulesStore.getRules(userId));
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

  const handleToggle = (ruleId: string, currentVal: boolean) => {
    const updated = securityRulesStore.saveRuleToggle(userId, ruleId, !currentVal);
    setRules(updated);
  };

  const handleSetAll = (enableAll: boolean) => {
    const updated = securityRulesStore.setAllRules(userId, enableAll);
    setRules(updated);
  };

  const enabledCount = rules.filter(r => r.enabled).length;

  const filteredRules = rules.filter(r => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.framework.toLowerCase().includes(q) ||
        r.whatIsIt.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>POLICY, ACCURACY & SECURITY STANDARDS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
            Terms, AI Policy & Security Guide
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-[#090d18] p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Terms & AI Policy
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security Rules Guide ({enabledCount}/{rules.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TERMS & AI POLICY */}
      {activeTab === 'terms' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Critical AI Warning Alert */}
          <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3 shadow-md card-3d">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-amber-950 dark:text-amber-300 uppercase tracking-wide">
                  ⚠️ Important Notice: AI-Generated Security Analysis & Advice
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300/80 font-mono">
                  VibeGuard utilizes multi-model generative AI engines for autonomous code auditing and vulnerability detection.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-amber-950 dark:text-amber-100 font-sans">
              <strong>Artificial Intelligence models can make mistakes, hallucinate, or produce false positive/negative results.</strong> All security vulnerability assessments, risk scores, taint flow diagrams, and automated code fixes provided by VibeGuard are <strong>advisory in nature</strong>. You, as the developer and organization, are solely responsible for reviewing, testing, and verifying all proposed security solutions before applying them to production systems.
            </p>
          </div>

          {/* Legal Sections */}
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-slate-800 dark:text-slate-200 transition-colors card-3d">
            <section className="space-y-2 pb-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-cyan-600 dark:text-cyan-400">01.</span> AI Analysis & Advisory Disclaimer
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                VibeGuard employs autonomous multi-tier AI routers to evaluate source code Abstract Syntax Trees (AST), detect configuration anomalies, and summarize threat vectors. While our models are designed to maximize accuracy, AI outputs do not replace human code audits, penetration testing, or formal security reviews.
              </p>
            </section>

            <section className="space-y-2 pb-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-cyan-600 dark:text-cyan-400">02.</span> Zero-Code-Retention & Data Privacy
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                Your proprietary source code is analyzed strictly in transient runtime memory and is <strong>never stored on persistent external servers</strong>. Only project metadata (project name, repository URL, file counts, and diagnostic vulnerability reports) are stored securely in your Supabase database.
              </p>
            </section>

            <section className="space-y-2 pb-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-cyan-600 dark:text-cyan-400">03.</span> Developer Responsibility & Approvals
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                VibeGuard incorporates a Gatekeeper Approval system. When VibeGuard recommends a patch, dependency upgrade, or code change, the user must explicitly inspect and approve the modification. VibeGuard is not liable for system downtime, data corruption, or regressions resulting from approved AI suggestions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-cyan-600 dark:text-cyan-400">04.</span> Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                To the maximum extent permitted by law, VibeGuard and its maintainers provide the software "AS IS" without warranties of any kind. Users agree to hold VibeGuard harmless from any direct or indirect damages arising from the use of AI analysis tools.
              </p>
            </section>
          </div>

          {/* Interactive Checkbox Confirmation Card */}
          <div className="bg-slate-50 dark:bg-[#0d1322] border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl card-3d">
            <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Mandatory User Acknowledgement & Confirmation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Please check the boxes below to confirm your understanding:
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm">
                <input
                  type="checkbox"
                  checked={hasAgreedAI}
                  onChange={(e) => setHasAgreedAI(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-400 border-slate-400 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 font-medium select-none">
                  <strong>I understand that VibeGuard uses Artificial Intelligence (AI)</strong> to detect security risks and generate fixes. I acknowledge that <strong>AI can make mistakes or false detections</strong>, and I will review and verify all code changes before production deployment.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm">
                <input
                  type="checkbox"
                  checked={hasAgreedPrivacy}
                  onChange={(e) => setHasAgreedPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-400 border-slate-400 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 font-medium select-none">
                  I acknowledge the <strong>Zero-Code-Retention policy</strong>, and agree that project vulnerability reports and metadata will be stored in my authenticated Supabase account.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-300 dark:border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all shadow-sm">
                <input
                  type="checkbox"
                  checked={hasAgreedLiability}
                  onChange={(e) => setHasAgreedLiability(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-400 border-slate-400 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 font-medium select-none">
                  I agree to the <strong>Terms of Service and Limitation of Liability</strong>, accepting sole responsibility for the execution and deployment of any remediations.
                </span>
              </label>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
              {isSaved ? (
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-500/20">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Terms & AI Policy Confirmed & Saved</span>
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
      )}

      {/* TAB 2: ACTIVE SECURITY RULES & KNOWLEDGE GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Guide Header Controls & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search security rules, CWE codes, keywords (SQL, AWS, XSS)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#090d18] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {enabledCount} of {rules.length} Active
              </span>
              <button
                onClick={() => handleSetAll(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-mono font-bold hover:bg-emerald-200 transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={() => handleSetAll(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold hover:bg-slate-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Active Rules List */}
          <div className="space-y-6">
            {filteredRules.map(rule => {
              const isEnabled = rule.enabled;
              const codeTab = activeCodeTab[rule.id] || 'VULN';

              return (
                <div
                  key={rule.id}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 card-3d transform-3d ${
                    isEnabled
                      ? 'bg-white dark:bg-[#111726]/95 border-slate-200 dark:border-[#1f293d] shadow-lg'
                      : 'bg-slate-50/80 dark:bg-[#0b101d]/60 border-slate-200 dark:border-slate-800/80 opacity-75'
                  }`}
                >
                  {/* Card Top Row: Code, Title, Badges & Toggle Switch */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#090d18] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-cyan-400 font-mono text-xs font-bold">
                          {rule.code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-500/15 border border-purple-300 dark:border-purple-500/30 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-bold">
                          {rule.framework}
                        </span>
                        <SeverityBadge severity={rule.defaultSeverity} size="sm" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                        {rule.title}
                      </h3>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <div className="flex items-center gap-3 shrink-0 bg-slate-100 dark:bg-[#0d1322] p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <span className={`text-xs font-mono font-bold ${isEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {isEnabled ? 'ACTIVE FOR SCAN' : 'DISABLED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(rule.id, isEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Explanations Grid: What is it vs Why check it */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 font-sans text-xs sm:text-sm">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-[#1f293d] space-y-1.5 shadow-sm">
                      <h4 className="font-bold font-mono text-cyan-800 dark:text-cyan-400 uppercase text-xs flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> What is this security check?
                      </h4>
                      <p className="text-slate-800 dark:text-slate-300 leading-relaxed font-normal">
                        {rule.whatIsIt}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-1.5 shadow-sm">
                      <h4 className="font-bold font-mono text-amber-900 dark:text-amber-300 uppercase text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Why is it critical to audit?
                      </h4>
                      <p className="text-amber-950 dark:text-amber-200/90 leading-relaxed font-normal">
                        {rule.whyCheckIt}
                      </p>
                    </div>
                  </div>

                  {/* Real World Impact Notice */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#090d18] border border-slate-200 dark:border-[#1f293d] text-xs font-mono text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      <strong>Breach Risk:</strong> {rule.realWorldImpact}
                    </span>
                  </div>

                  {/* Code Examples Section with Vulnerable vs Secure switcher */}
                  <div className="rounded-2xl border border-slate-200 dark:border-[#1f293d] overflow-hidden bg-white dark:bg-[#0b101b] shadow-md">
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-[#0e1424] px-4 py-2.5 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                          Code Implementation Guide
                        </span>
                      </div>

                      <div className="flex items-center bg-white dark:bg-[#090d18] p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
                        <button
                          onClick={() => setActiveCodeTab(prev => ({ ...prev, [rule.id]: 'VULN' }))}
                          className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            codeTab === 'VULN'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>❌ Vulnerable Code</span>
                        </button>
                        <button
                          onClick={() => setActiveCodeTab(prev => ({ ...prev, [rule.id]: 'SECURE' }))}
                          className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            codeTab === 'SECURE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>✅ Hardened Fix</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-[#080d1a] overflow-x-auto">
                      <pre className="text-xs font-mono leading-relaxed">
                        <code className={codeTab === 'VULN' ? 'text-rose-300' : 'text-emerald-300'}>
                          {codeTab === 'VULN' ? rule.vulnerableSnippet : rule.secureSnippet}
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* Remediation Directive */}
                  <div className="mt-4 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 text-xs font-mono text-cyan-900 dark:text-cyan-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Remediation:</strong> {rule.remediationAdvice}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
