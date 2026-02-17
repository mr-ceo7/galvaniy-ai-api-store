
import React, { useState, useEffect, useMemo } from 'react';
import { PRICING_TIERS } from './constants';
import { PricingTier } from './types';
import PaymentModal from './components/PaymentModal';

type ViewState = 'landing' | 'dashboard';
type ModalView = 'none' | 'login' | 'privacy' | 'terms';

// --- Floating Stars Component ---
const Stars: React.FC = () => {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 3}s`,
      size: `${1 + Math.random() * 2}px`,
    })), []);

  return (
    <div className="stars-container">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            ['--duration' as string]: s.duration,
            ['--delay' as string]: s.delay,
          }}
        />
      ))}
    </div>
  );
};

// --- Code Preview Component ---
const CodePreview: React.FC = () => (
  <div className="code-preview p-5 animate-float max-w-lg mx-auto">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
      <div className="w-3 h-3 rounded-full bg-red-500/80" />
      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
      <div className="w-3 h-3 rounded-full bg-green-500/80" />
      <span className="text-[10px] text-slate-600 ml-2 font-mono">api-call.js</span>
    </div>
    <div className="space-y-1">
      <div className="flex">
        <span className="line-number">1</span>
        <span><span className="code-keyword">const</span> <span className="code-const">response</span> <span className="code-bracket">=</span> <span className="code-keyword">await</span> <span className="code-function">fetch</span><span className="code-bracket">(</span></span>
      </div>
      <div className="flex">
        <span className="line-number">2</span>
        <span className="pl-4"><span className="code-string">"https://api.galvaniy.com/v1/generate"</span><span className="code-bracket">,</span></span>
      </div>
      <div className="flex">
        <span className="line-number">3</span>
        <span className="pl-4"><span className="code-bracket">{'{'}</span> <span className="code-property">method</span>: <span className="code-string">"POST"</span><span className="code-bracket">,</span></span>
      </div>
      <div className="flex">
        <span className="line-number">4</span>
        <span className="pl-6"><span className="code-property">headers</span>: <span className="code-bracket">{'{'}</span> <span className="code-string">"x-api-key"</span>: API_KEY <span className="code-bracket">{'}'}</span><span className="code-bracket">,</span></span>
      </div>
      <div className="flex">
        <span className="line-number">5</span>
        <span className="pl-6"><span className="code-property">body</span>: <span className="code-function">JSON.stringify</span><span className="code-bracket">(</span><span className="code-bracket">{'{'}</span> <span className="code-property">prompt</span> <span className="code-bracket">{'}'}</span><span className="code-bracket">)</span> <span className="code-bracket">{'}'}</span></span>
      </div>
      <div className="flex">
        <span className="line-number">6</span>
        <span><span className="code-bracket">)</span><span className="code-bracket">;</span></span>
      </div>
      <div className="flex mt-2">
        <span className="line-number">7</span>
        <span className="code-comment">// ✓ Avg response: 142ms</span>
      </div>
    </div>
  </div>
);

// --- Tier Icon Helper ---
const TierIcon: React.FC<{ tierId: string }> = ({ tierId }) => {
  if (tierId === 'starter') return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  );
  if (tierId === 'pro') return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    </div>
  );
};

// --- Card Color Class Map ---
const cardColorClass: Record<string, string> = {
  starter: 'card-blue',
  pro: 'card-purple',
  enterprise: 'card-amber',
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalView>('none');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyKey = () => {
    if (purchasedKey) {
      navigator.clipboard.writeText(purchasedKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsBrowsing(true);
    setTimeout(() => setIsBrowsing(false), 800);
  };

  const navigateToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView('landing');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentView('dashboard');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDashboard = () => {
    setPurchasedKey(null);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col">
      {/* Floating Stars */}
      <Stars />

      {/* Animated Background Blobs */}
      <div className="fixed top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled || currentView === 'dashboard' ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={navigateToLanding} className="flex items-center space-x-2 group outline-none">
            <span className="text-xl font-bold tracking-tight text-white font-heading">Galvaniy <span className="text-purple-500">Technologies</span></span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('docs')} className="hover:text-white transition-colors">Documentation</button>
            <button
              onClick={navigateToDashboard}
              className={`transition-colors ${currentView === 'dashboard' ? 'text-white font-bold' : 'hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={handleBrowseClick}
              className="hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button onClick={() => setActiveModal('login')} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/10 transition-all hover:border-white/20">
              Login
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''} md:hidden fixed top-[72px] left-0 right-0 bottom-0 bg-slate-950/95 backdrop-blur-xl z-50`}>
          <div className="flex flex-col p-6 space-y-6 text-lg font-medium">
            <button onClick={() => scrollToSection('docs')} className="text-left text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5">Documentation</button>
            <button onClick={navigateToDashboard} className="text-left text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5">Dashboard</button>
            <button onClick={handleBrowseClick} className="text-left text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5">Pricing</button>
            <button onClick={() => { setMobileMenuOpen(false); setActiveModal('login'); }} className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold">Login</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 relative z-10">
        {currentView === 'landing' ? (
          <div>
            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-12 pb-16 px-6">
              <div className="container mx-auto text-center max-w-4xl">
                {/* Announcement Badge */}
                <div className="animate-fade-in-up inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-shimmer">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-300">New: Galvaniy 1.5 Pro Keys now available</span>
                </div>

                {/* Headline */}
                <h1 className="animate-fade-in-up delay-100 text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent font-heading leading-tight">
                  Next-Gen AI Intelligence <br /> <span className="text-white">At Your Fingertips.</span>
                </h1>

                {/* Subtext */}
                <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Get instant access to the most powerful generative AI models. Buy your API keys securely with M-Pesa and start building in seconds.
                </p>

                {/* CTA Buttons */}
                <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                  <button
                    onClick={handleBrowseClick}
                    className="btn-primary px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 min-w-[200px]"
                  >
                    {isBrowsing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Browse API Tiers</span>
                    )}
                  </button>
                  <button onClick={() => scrollToSection('docs')} className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 hover:border-white/20 transition-all">
                    Read Developer Docs
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="animate-fade-in-up delay-400 flex flex-wrap items-center justify-center gap-4 mb-16">
                  <div className="trust-badge">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>10K+ Developers</span>
                  </div>
                  <div className="trust-badge">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>99.9% Uptime</span>
                  </div>
                  <div className="trust-badge">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>KE-Based Servers</span>
                  </div>
                </div>

                {/* Code Preview */}
                <div className="animate-fade-in-up delay-500">
                  <CodePreview />
                </div>
              </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="py-20 px-6 relative">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16 animate-fade-in-up">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">How It Works</h2>
                  <p className="text-slate-400 max-w-xl mx-auto">Get up and running in three simple steps. No credit card needed — just M-Pesa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                  {[
                    {
                      step: '01',
                      title: 'Choose a Tier',
                      desc: 'Select the plan that matches your project scope and token needs.',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      ),
                      color: 'from-blue-500 to-cyan-500',
                    },
                    {
                      step: '02',
                      title: 'Pay with M-Pesa',
                      desc: 'Complete your purchase instantly and securely from your phone.',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ),
                      color: 'from-green-500 to-emerald-500',
                    },
                    {
                      step: '03',
                      title: 'Get Your API Key',
                      desc: 'Receive your key instantly and start integrating world-class AI.',
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      ),
                      color: 'from-purple-500 to-pink-500',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`animate-fade-in-up delay-${(i + 1) * 200} liquid-glass rounded-2xl p-8 text-center relative group hover:border-white/10 transition-all ${i < 2 ? 'step-connector' : ''}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-10 flex items-center justify-center mx-auto mb-5 text-white`}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">{item.step}</span>
                      <h3 className="text-lg font-bold mt-2 mb-3 font-heading">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== PRICING SECTION ===== */}
            <section id="pricing" className="py-20 px-6">
              <div className="container mx-auto">
                <div className="text-center mb-16 animate-fade-in-up">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 font-heading">Choose Your Power</h2>
                  <p className="text-slate-400">Flexible pricing tiers for every stage of your project.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {PRICING_TIERS.map((tier, index) => (
                    <div
                      key={tier.id}
                      className={`pricing-card ${cardColorClass[tier.id] || ''} ${tier.popular ? 'gradient-border' : ''} animate-fade-in-up delay-${(index + 1) * 200} liquid-glass relative rounded-3xl p-8 group ${tier.popular ? 'scale-105 z-10' : ''}`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] uppercase tracking-widest font-bold py-1.5 px-5 rounded-full shadow-lg shadow-purple-500/30">
                          Most Popular
                        </div>
                      )}

                      {/* Tier Icon + Name */}
                      <div className="flex items-center space-x-3 mb-6">
                        <TierIcon tierId={tier.id} />
                        <h3 className="text-xl font-bold font-heading">{tier.name}</h3>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-4xl font-bold">KES {tier.price.toLocaleString()}</span>
                          <span className="text-slate-500 text-sm">/ one-time</span>
                        </div>
                        <p className="mt-2 text-purple-400 font-medium text-sm">{tier.tokens}</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-10">
                        {tier.features.map((feature, i) => (
                          <div key={i} className="flex items-center space-x-3 text-sm text-slate-300">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => setSelectedTier(tier)}
                        className={`btn-primary w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${tier.color} shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/30 transition-all`}
                      >
                        Get Key Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== SOCIAL PROOF / STATS ===== */}
            <section className="py-20 px-6 border-t border-white/5">
              <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12 animate-fade-in-up">
                  <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">Trusted by Developers Across Africa</h2>
                  <p className="text-slate-400">Join thousands of developers building the future with Galvaniy AI.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in-up delay-200">
                  {[
                    { number: '10K+', label: 'Active Developers' },
                    { number: '50M+', label: 'API Calls Served' },
                    { number: '99.9%', label: 'Uptime SLA' },
                    { number: '<150ms', label: 'Avg Latency' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card liquid-glass rounded-2xl">
                      <div className="stat-number font-heading">{stat.number}</div>
                      <p className="text-xs text-slate-500 mt-2 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== DOCUMENTATION / API REFERENCE ===== */}
            <section id="docs" className="py-20 px-6 border-t border-white/5">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16 animate-fade-in-up">
                  <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">API Documentation</h2>
                  <p className="text-slate-400 max-w-xl mx-auto">Everything you need to integrate Galvaniy AI into your application.</p>
                </div>

                {/* Quick Start */}
                <div className="liquid-glass rounded-3xl p-8 mb-8 animate-fade-in-up">
                  <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                    Quick Start
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Authenticate your requests by including your API key in the <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-xs">x-api-key</code> header.</p>
                  <div className="code-preview p-5">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      <span className="text-[10px] text-slate-600 ml-2 font-mono">quickstart.js</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex"><span className="line-number">1</span><span><span className="code-keyword">const</span> <span className="code-const">res</span> = <span className="code-keyword">await</span> <span className="code-function">fetch</span>(<span className="code-string">"https://api.galvaniy.com/v1/generate"</span>, {'{'}</span></div>
                      <div className="flex"><span className="line-number">2</span><span className="pl-4"><span className="code-property">method</span>: <span className="code-string">"POST"</span>,</span></div>
                      <div className="flex"><span className="line-number">3</span><span className="pl-4"><span className="code-property">headers</span>: {'{'} <span className="code-string">"x-api-key"</span>: <span className="code-const">YOUR_API_KEY</span>, <span className="code-string">"Content-Type"</span>: <span className="code-string">"application/json"</span> {'}'},</span></div>
                      <div className="flex"><span className="line-number">4</span><span className="pl-4"><span className="code-property">body</span>: <span className="code-function">JSON.stringify</span>({'{'} <span className="code-property">prompt</span>: <span className="code-string">"Hello, Galvaniy!"</span>, <span className="code-property">model</span>: <span className="code-string">"gemini-1.5-flash"</span> {'}'})</span></div>
                      <div className="flex"><span className="line-number">5</span><span>{'}'});</span></div>
                      <div className="flex"><span className="line-number">6</span><span><span className="code-keyword">const</span> <span className="code-const">data</span> = <span className="code-keyword">await</span> <span className="code-const">res</span>.<span className="code-function">json</span>();</span></div>
                      <div className="flex"><span className="line-number">7</span><span><span className="code-function">console.log</span>(<span className="code-const">data</span>.<span className="code-property">text</span>);</span></div>
                    </div>
                  </div>
                </div>

                {/* Endpoints Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { method: 'POST', path: '/v1/generate', desc: 'Generate text completions from a prompt using any supported model.', color: 'text-green-400 bg-green-500/10' },
                    { method: 'POST', path: '/v1/chat', desc: 'Multi-turn chat conversations with context-aware responses.', color: 'text-blue-400 bg-blue-500/10' },
                    { method: 'GET', path: '/v1/models', desc: 'List all available AI models and their capabilities.', color: 'text-purple-400 bg-purple-500/10' },
                    { method: 'GET', path: '/v1/usage', desc: 'Check your current token usage, limits, and billing cycle.', color: 'text-amber-400 bg-amber-500/10' },
                  ].map((ep, i) => (
                    <div key={i} className="liquid-glass rounded-2xl p-6 hover:border-white/10 transition-all animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${ep.color}`}>{ep.method}</span>
                        <code className="text-sm text-white font-mono">{ep.path}</code>
                      </div>
                      <p className="text-sm text-slate-400">{ep.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Rate Limits */}
                <div className="liquid-glass rounded-3xl overflow-hidden animate-fade-in-up">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold font-heading">Rate Limits</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-white/5"><tr>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Tier</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Requests / min</th>
                      <th className="px-6 py-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Tokens / day</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3 text-sm"> Lite</td><td className="px-6 py-3 text-sm text-slate-400">60</td><td className="px-6 py-3 text-sm text-slate-400">50,000</td></tr>
                      <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3 text-sm"> Pro</td><td className="px-6 py-3 text-sm text-slate-400">300</td><td className="px-6 py-3 text-sm text-slate-400">500,000</td></tr>
                      <tr className="hover:bg-white/5 transition-colors"><td className="px-6 py-3 text-sm"> Ultra</td><td className="px-6 py-3 text-sm text-slate-400">1,000</td><td className="px-6 py-3 text-sm text-slate-400">Unlimited</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ===== DASHBOARD ===== */
          <section id="dashboard" className="py-12 px-6 animate-fade-in-up">
            <div className="container mx-auto max-w-5xl">
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-2">Developer Dashboard</h2>
                  <p className="text-slate-400">Manage your active API keys and monitor usage.</p>
                </div>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="btn-primary px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
                >
                  + Buy New Key
                </button>
              </div>

              {/* API Keys Table */}
              <div className="liquid-glass rounded-3xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Key Name</th>
                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">API Key</th>
                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Tier</th>
                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold">Created</th>
                        <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-medium">Default Project</td>
                        <td className="px-6 py-4"><code className="text-purple-400 text-sm">gal_live_••••••••••••••••</code></td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">Lite</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">Oct 24, 2024</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-500 hover:text-white p-2 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-heading">Ready to expand?</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Your purchased keys will appear here instantly for secure management.</p>
                  <button
                    onClick={() => setCurrentView('landing')}
                    className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                  >
                    View Pricing Tiers &rarr;
                  </button>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="liquid-glass p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Live</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Monthly API Calls</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-white">1.5M</span>
                    <span className="text-slate-500 text-sm">/ 5M limit</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 w-[30%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-right">30% consumed</p>
                </div>

                <div className="liquid-glass p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Quota</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Token Consumption</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-white">4.2M</span>
                    <span className="text-slate-500 text-sm">/ 10M plan</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 w-[42%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-right">42% consumed</p>
                </div>

                <div className="liquid-glass p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-wider">Health</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Average Latency</p>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-white">142ms</span>
                    <span className="text-emerald-500 text-sm font-bold flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Optimal
                    </span>
                  </div>
                  <div className="flex gap-1 h-8 items-end">
                    {[30, 45, 25, 60, 40, 35, 20, 50, 45, 30].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm transition-all hover:bg-emerald-500/40" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===== SUCCESS MODAL ===== */}
      {purchasedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="liquid-glass w-full max-w-xl rounded-3xl overflow-hidden animate-zoom-in">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2 font-heading">Payment Successful!</h2>
              <p className="text-slate-400 mb-8">Your Galvaniy AI API Key has been generated. Please store it securely.</p>

              <div className="relative group mb-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-950 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <code className="text-lg text-purple-400 font-mono break-all">{purchasedKey}</code>
                  <button
                    onClick={handleCopyKey}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all flex items-center space-x-2 min-w-[110px] justify-center ${
                      isCopied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="text-sm font-medium">Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className="font-bold text-green-400">Active</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Environment</p>
                  <p className="font-bold text-white">Production</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGoToDashboard}
                  className="btn-primary w-full py-4 bg-white text-slate-950 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={() => setPurchasedKey(null)}
                  className="w-full py-3 text-slate-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4"
                >
                  Dismiss &amp; Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="py-20 px-6 border-t border-white/5 bg-slate-950/50 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-xl font-bold tracking-tight font-heading text-white">Galvaniy <span className="text-purple-500">Technologies</span></span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6">
                Empowering the next generation of African developers with high-performance AI infrastructure. Secure, fast, and local.
              </p>
              {/* Social Icons */}
              <div className="flex items-center space-x-3">
                <a href="https://x.com/galvaniytech" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter / X">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://github.com/mr-ceo7" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/galvaniy" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 font-heading text-white">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => scrollToSection('docs')} className="hover:text-white transition-colors">Documentation</button></li>
                <li><button onClick={handleBrowseClick} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollToSection('docs')} className="hover:text-white transition-colors">API Reference</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 font-heading text-white">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={navigateToLanding} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><a href="mailto:support@galvaniy.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-slate-600">
            <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0 text-center md:text-left">
              <p>&copy; 2024 Galvaniy Technologies Limited. All rights reserved.</p>
              <div className="flex items-center space-x-6">
                <button onClick={() => setActiveModal('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => setActiveModal('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-6 md:mt-0 opacity-60">
              <span>Payments secured by Lipana</span>
              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== LOGIN MODAL ===== */}
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setActiveModal('none')}>
          <div className="liquid-glass w-full max-w-md rounded-3xl overflow-hidden animate-zoom-in" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold font-heading">Welcome Back</h2>
                <button onClick={() => setActiveModal('none')} className="text-slate-500 hover:text-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setActiveModal('none'); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <input type="email" placeholder="you@example.com" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                  <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all">Sign In</button>
              </form>
              <div className="mt-6 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative bg-slate-900 px-4 text-xs text-slate-600">or continue with</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  GitHub
                </button>
              </div>
              <p className="text-center text-xs text-slate-600 mt-6">Don&apos;t have an account? <button onClick={handleBrowseClick} className="text-purple-400 hover:text-purple-300">Get started</button></p>
            </div>
          </div>
        </div>
      )}

      {/* ===== PRIVACY POLICY MODAL ===== */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setActiveModal('none')}>
          <div className="liquid-glass w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden animate-zoom-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/5 flex-shrink-0">
              <h2 className="text-xl font-bold font-heading">Privacy Policy</h2>
              <button onClick={() => setActiveModal('none')} className="text-slate-500 hover:text-white transition-colors p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-400 space-y-4 leading-relaxed">
              <p className="text-xs text-slate-600">Last updated: February 2026</p>
              <p>Galvaniy Technologies Limited (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our API services and website.</p>
              <h3 className="text-white font-bold font-heading pt-2">1. Information We Collect</h3>
              <p>We collect your email address and phone number when you create an account or purchase an API key. We also collect M-Pesa transaction details solely for payment processing and verification purposes. Usage data such as API call counts and timestamps is collected to provide you with analytics and enforce rate limits.</p>
              <h3 className="text-white font-bold font-heading pt-2">2. How We Use Your Information</h3>
              <p>Your information is used to: process payments via M-Pesa, generate and deliver API keys, provide customer support, monitor service health and enforce usage limits, and send important service update notifications.</p>
              <h3 className="text-white font-bold font-heading pt-2">3. Data Security</h3>
              <p>All API keys are generated using cryptographically secure random methods. Payment data is processed through the Lipana payment gateway and is never stored on our servers. All communications are encrypted using TLS 1.3.</p>
              <h3 className="text-white font-bold font-heading pt-2">4. Data Sharing</h3>
              <p>We do not sell your personal data. We share transaction data only with Lipana (our M-Pesa payment processor) to complete your purchases. We may disclose information if required by Kenyan law.</p>
              <h3 className="text-white font-bold font-heading pt-2">5. Your Rights</h3>
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at support@galvaniy.com. We will respond within 30 days.</p>
              <h3 className="text-white font-bold font-heading pt-2">6. Contact</h3>
              <p>For privacy-related inquiries, contact us at <a href="mailto:support@galvaniy.com" className="text-purple-400 hover:text-purple-300">support@galvaniy.com</a>.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== TERMS OF SERVICE MODAL ===== */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setActiveModal('none')}>
          <div className="liquid-glass w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden animate-zoom-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/5 flex-shrink-0">
              <h2 className="text-xl font-bold font-heading">Terms of Service</h2>
              <button onClick={() => setActiveModal('none')} className="text-slate-500 hover:text-white transition-colors p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-400 space-y-4 leading-relaxed">
              <p className="text-xs text-slate-600">Last updated: February 2026</p>
              <p>By accessing or using the Galvaniy AI API services, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
              <h3 className="text-white font-bold font-heading pt-2">1. Service Description</h3>
              <p>Galvaniy Technologies provides API access to generative AI models. Each purchased API key grants access to a specific token allocation and rate limit as described in the selected pricing tier.</p>
              <h3 className="text-white font-bold font-heading pt-2">2. Payments</h3>
              <p>All payments are processed via M-Pesa through the Lipana payment gateway. Payments are one-time, non-recurring charges. Your API key is activated immediately upon successful payment confirmation.</p>
              <h3 className="text-white font-bold font-heading pt-2">3. Acceptable Use</h3>
              <p>You agree not to: use our API to generate harmful, illegal, or misleading content; attempt to reverse-engineer our systems; exceed your allocated rate limits through automated means; resell or redistribute your API key.</p>
              <h3 className="text-white font-bold font-heading pt-2">4. API Key Security</h3>
              <p>You are solely responsible for the security of your API key. Treat it as a secret credential. If you believe your key has been compromised, contact us immediately at support@galvaniy.com for revocation and replacement.</p>
              <h3 className="text-white font-bold font-heading pt-2">5. Refund Policy</h3>
              <p>Due to the digital nature of API keys, all sales are final once the key has been generated. Refunds may be considered on a case-by-case basis for service outages exceeding 24 hours.</p>
              <h3 className="text-white font-bold font-heading pt-2">6. Limitation of Liability</h3>
              <p>Galvaniy Technologies shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the specific API key in question.</p>
              <h3 className="text-white font-bold font-heading pt-2">7. Governing Law</h3>
              <p>These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Nairobi.</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedTier && (
        <PaymentModal
          tier={selectedTier}
          onClose={() => setSelectedTier(null)}
          onSuccess={(apiKey) => {
            setPurchasedKey(apiKey);
            setSelectedTier(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
