import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Shield,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Search,
  Sliders,
  Check,
  Lock,
  Layers,
  Bot,
  Package,
  Server,
  Key,
  Sparkles,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SecurityRuleStandard } from '../types';
import { securityRulesStore } from '../lib/securityRulesStore';
import { SeverityBadge } from '../components/common/SeverityBadge';

export const SecurityStandardsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  const [rules, setRules] = useState<SecurityRuleStandard[]>(() =>
    securityRulesStore.getRules(userId)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeCodeTab, setActiveCodeTab] = useState<Record<string, 'VULN' | 'SECURE'>>({});

  useEffect(() => {
    setRules(securityRulesStore.getRules(userId));
  }, [userId]);

  const handleToggle = (ruleId: string, currentVal: boolean) => {
    const updated = securityRulesStore.saveRuleToggle(userId, ruleId, !currentVal);
    setRules(updated);
  };

  const handleSetAll = (enableAll: boolean) => {
    const updated = securityRulesStore.setAllRules(userId, enableAll);
    setRules(updated);
  };

  const categories = [
    { id: 'ALL', label: 'All Security Rules' },
    { id: 'OWASP', label: 'OWASP Top 10' },
    { id: 'SECRETS', label: 'Cloud Secrets & Keys' },
    { id: 'AI_PROMPT', label: 'AI & Prompt Security' },
    { id: 'SUPPLY_CHAIN', label: 'Dependency CVEs' },
    { id: 'CONTAINER_IAC', label: 'Docker & IaC' },
    { id: 'DATA_FLOW', label: 'AST Taint Flow' },
  ];

  const filteredRules = rules.filter(r => {
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
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

  const enabledCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 text-xs font-mono font-bold border border-cyan-300 dark:border-cyan-500/20">
              SECURITY STANDARDS & RULE SELECTOR
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
              KNOWLEDGE GUIDE & CONFIGURATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            Security Rule Standards & Scanner Selector
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium max-w-3xl">
            Choose which security rules and compliance engines are active when scanning your codebase. Learn why each check is critical and review vulnerable vs. remediated code examples.
          </p>
        </div>

        {/* Global Toggle Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-md card-3d">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
              {enabledCount} of {rules.length} Rules Active
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {enabledCount === rules.length ? 'Full Defense Shield' : 'Custom Profile'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={() => handleSetAll(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-mono font-bold hover:bg-emerald-200 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => handleSetAll(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold hover:bg-slate-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d] shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search security rules, CWE codes, keywords (SQL, AWS, Docker)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#090d18] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#0d1322] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Cards List */}
      <div className="space-y-6">
        {filteredRules.map(rule => {
          const isEnabled = rule.enabled;
          const codeTab = activeCodeTab[rule.id] || 'VULN';

          return (
            <div
              key={rule.id}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 card-3d transform-3d ${
                isEnabled
                  ? 'bg-white dark:bg-[#111726]/95 border-slate-200 dark:border-[#1f293d] shadow-lg dark:shadow-2xl'
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
                  <strong>Breach Risk Context:</strong> {rule.realWorldImpact}
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
                      <span>❌ Vulnerable Pattern</span>
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

              {/* Remediation Advice Callout */}
              <div className="mt-4 p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 text-xs font-mono text-cyan-900 dark:text-cyan-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Antigravity Remediation Rule:</strong> {rule.remediationAdvice}
                </div>
              </div>
            </div>
          );
        })}

        {filteredRules.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#1f293d]">
            <Shield className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-mono">No Security Rules Found</h4>
            <p className="text-xs text-slate-500 font-mono mt-1">Try clearing your search query or selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
