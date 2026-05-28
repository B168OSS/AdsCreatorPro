import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  User as UserIcon,
  Shield,
  Trash2,
  Plus,
  Lock,
  Compass,
  FileText,
  Volume2,
  Settings,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { translations } from './translations';
import {
  AppState,
  User,
  ProductStyle,
  VisualAngle,
  VOVoice,
  VOIntonation,
  AdFormInputs,
  AdStep,
  GenerationResult
} from './types';
import LandingPage from './components/LandingPage';
import AuthSystem from './components/AuthSystem';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<'id' | 'en'>('id');
  const t = translations[lang];

  // Theme State (Cosmic Dark vs Minimalist Light)
  const [theme, setTheme] = useState<'cosmic' | 'light'>(() => (localStorage.getItem('ads_theme') as 'cosmic' | 'light') || 'cosmic');

  // Rendering Engine Status State
  const [engineStatus, setEngineStatus] = useState<string>('Checking...');

  // App Phase State
  const [appState, setAppState] = useState<AppState>('welcome');

  // Security Simulation State
  const [simulatedIp, setSimulatedIp] = useState<string>('192.168.1.120');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Admin Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Guest Attempts tracking
  const [guestAttempts, setGuestAttempts] = useState<number>(0);
  const [showGuestLimitModal, setShowGuestLimitModal] = useState<boolean>(false);

  // Form Inputs State with localStorage retrieval
  const [inputs, setInputs] = useState<AdFormInputs>(() => {
    const saved = localStorage.getItem('ads_form_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            productVisuals: Array.isArray(parsed.productVisuals) ? parsed.productVisuals : [],
            productLinks: Array.isArray(parsed.productLinks) ? parsed.productLinks : [],
            modelPhoto: typeof parsed.modelPhoto === 'string' || parsed.modelPhoto === null ? parsed.modelPhoto : null,
            modelDetectionType: parsed.modelDetectionType || 'None',
            isOwnModelApproved: !!parsed.isOwnModelApproved,
            productDescription: parsed.productDescription || '',
            marketplace: parsed.marketplace || 'Shopee',
            affiliateId: parsed.affiliateId || '',
            style: parsed.style || 'Cinematic',
            angle: parsed.angle || 'Zoom',
            voVoice: parsed.voVoice || 'Male',
            voIntonation: parsed.voIntonation || 'Ceria',
          };
        }
      } catch (e) {
        console.error('Failed to parse saved ad form inputs', e);
      }
    }
    return {
      productVisuals: [],
      productLinks: [],
      modelPhoto: null,
      modelDetectionType: 'None',
      isOwnModelApproved: false,
      productDescription: '',
      marketplace: 'Shopee',
      affiliateId: '',
      style: 'Cinematic',
      angle: 'Zoom',
      voVoice: 'Male',
      voIntonation: 'Ceria',
    };
  });

  // LocalStorage auto-save effect
  useEffect(() => {
    localStorage.setItem('ads_form_inputs', JSON.stringify(inputs));
  }, [inputs]);

  // Temporary item inputs
  const [tempProductLink, setTempProductLink] = useState('');
  const [tempProductVisual, setTempProductVisual] = useState('');

  // Generation Loading & Result
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // Copy success notification states
  const [copiedIndex, setCopiedIndex] = useState<{ [key: string]: boolean }>({});

  // Theme Persistence effect
  useEffect(() => {
    localStorage.setItem('ads_theme', theme);
  }, [theme]);

  // Style customization helper constants for seamless responsive themes
  const cardClass = theme === 'cosmic' 
    ? 'cosmic-glass cosmic-glass-hover p-6 rounded-2xl' 
    : 'light-glass light-glass-hover p-6 rounded-2xl border border-zinc-200 shadow-xs text-zinc-900';
    
  const inputClass = theme === 'cosmic'
    ? 'w-full px-4 py-2.5 rounded-lg bg-zinc-950/60 border border-zinc-900/80 text-white focus:outline-none focus:border-[#D4AF37] font-mono font-bold'
    : 'w-full px-4 py-2.5 rounded-lg bg-white border border-zinc-300 text-zinc-950 focus:outline-none focus:border-zinc-800 font-mono font-bold shadow-xs';

  const selectClass = theme === 'cosmic'
    ? 'w-full px-3 py-2 rounded-lg bg-zinc-950/60 border border-[#D4AF37]/25 text-white text-xs font-sans focus:outline-none focus:border-[#D4AF37] cursor-pointer font-bold'
    : 'w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-950 text-xs font-sans focus:outline-none focus:border-zinc-800 cursor-pointer font-semibold shadow-xs';

  const textMutedClass = theme === 'cosmic' ? 'text-zinc-400 font-sans' : 'text-zinc-600 font-sans font-medium';
  const textTitleClass = theme === 'cosmic' ? 'text-white font-sans' : 'text-zinc-950 font-sans';
  const accentTextClass = theme === 'cosmic' ? 'text-[#D4AF37]' : 'text-zinc-900 font-bold';
  const labelClass = theme === 'cosmic' ? 'text-xs text-zinc-400 font-mono block' : 'text-xs text-zinc-700 font-mono block font-bold';

  // Toggle Theme handler
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'cosmic' ? 'light' : 'cosmic'));
  };

  // Synchronous Engine Status Sync Function
  const fetchEngineStatus = async () => {
    try {
      const res = await fetch('/api/engine-status');
      if (res.ok) {
        const data = await res.json();
        setEngineStatus(data.engine);
      } else {
        setEngineStatus('Local Studio Active');
      }
    } catch {
      setEngineStatus('Local Studio Active');
    }
  };

  // Fetch initial simulated IP connection upon mount
  useEffect(() => {
    fetch('/api/ip')
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) {
          setSimulatedIp(data.ip);
        }
      })
      .catch((err) => console.log('IP fetch omitted, using simulated fallback.'));
    
    fetchEngineStatus();
  }, []);

  // Sync registered users if logged in as Admin
  const fetchRegisteredUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        setRegisteredUsers(users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchRegisteredUsers();
    }
  }, [currentUser]);

  // Language switcher
  const toggleLanguage = () => {
    setLang(lang === 'id' ? 'en' : 'id');
  };

  // Auth Success hook
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.username === 'dev_admin') {
      setAppState('admin');
    } else {
      setAppState('dashboard');
    }
  };

  // Backdoor init trigger
  const handleBackdoorInit = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        setRegisteredUsers(users);
      }
      setAppState('admin');
    } catch (e) {
      setAppState('admin');
    }
  };

  // Add marketplace product links manually
  const addProductLink = () => {
    if (!tempProductLink.trim()) return;
    if (inputs.productLinks.length >= 5) {
      alert(lang === 'id' ? 'Maksimal 5 link produk!' : 'Maximum 5 product links allowed!');
      return;
    }
    setInputs({
      ...inputs,
      productLinks: [...inputs.productLinks, tempProductLink.trim()],
    });
    setTempProductLink('');
  };

  // Remove specific link
  const removeProductLink = (index: number) => {
    setInputs({
      ...inputs,
      productLinks: inputs.productLinks.filter((_, idx) => idx !== index),
    });
  };

  // Add visual simulation (Image links/simulation tokens)
  const addProductVisual = () => {
    if (!tempProductVisual.trim()) return;
    if (inputs.productVisuals.length >= 5) {
      alert(lang === 'id' ? 'Maksimal 5 foto produk!' : 'Maximum 5 product photos allowed!');
      return;
    }
    setInputs({
      ...inputs,
      productVisuals: [...inputs.productVisuals, tempProductVisual.trim()],
    });
    setTempProductVisual('');
  };

  // File Upload drag/drop simulator or mock
  const handleFileUploadMock = (filename: string) => {
    if (inputs.productVisuals.length >= 5) {
      alert(lang === 'id' ? 'Maksimal 5 foto produk!' : 'Maximum 5 product photos allowed!');
      return;
    }
    setInputs({
      ...inputs,
      productVisuals: [...inputs.productVisuals, filename],
    });
  };

  // Remove specific product visual image
  const removeProductVisual = (index: number) => {
    setInputs({
      ...inputs,
      productVisuals: inputs.productVisuals.filter((_, idx) => idx !== index),
    });
  };

  // Model file upload trigger
  const handleModelUploadMock = (filename: string, detectionType: typeof inputs.modelDetectionType) => {
    if (currentUser?.isGuest) {
      return; // Locked for guests
    }
    setInputs({
      ...inputs,
      modelPhoto: filename,
      modelDetectionType: detectionType,
    });
  };

  // Reset model upload state
  const clearModelPhotoObj = () => {
    setInputs({
      ...inputs,
      modelPhoto: null,
      modelDetectionType: 'None',
      isOwnModelApproved: false,
    });
  };

  // Click handler to process and render prompt generated output
  const handleGeneratePrompt = async () => {
    // Validation
    if (inputs.productVisuals.length === 0 && inputs.productLinks.length === 0) {
      alert(
        lang === 'id'
          ? 'WAJIB isi minimal 1 Visual Produk (Upload foto atau Masukkan Link Marketplace)!'
          : 'At least ONE product visual element (Photo upload or Marketplace link) is REQUIRED!'
      );
      return;
    }

    if (!inputs.productDescription.trim()) {
      alert(lang === 'id' ? 'Harap isi Deskripsi Produk!' : 'Please describe your product first!');
      return;
    }

    // Checking model upload approval if a model was setup
    if (inputs.modelPhoto && !inputs.isOwnModelApproved) {
      alert(
        lang === 'id'
          ? 'Anda wajib mencentang persetujuan kepemilikan foto model!'
          : 'You must check the agreement box verifying model photo legitimacy!'
      );
      return;
    }

    // Guest threshold validation check
    if (currentUser?.isGuest) {
      if (guestAttempts >= 1) {
        setShowGuestLimitModal(true);
        return;
      }
    }

    setIsGenerating(true);
    setAppState('result');

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDescription: inputs.productDescription,
          style: inputs.style,
          angle: inputs.angle,
          voVoice: inputs.voVoice,
          voIntonation: inputs.voIntonation,
          marketplace: inputs.marketplace,
          affiliateId: inputs.affiliateId,
          role: currentUser?.isGuest ? 'guest' : 'member',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGenerationResult(data);

        if (data.apiWarning) {
          setEngineStatus('Local Studio Active');
        } else {
          setEngineStatus('Gemini Online');
        }

        // Record guest attempt count
        if (currentUser?.isGuest) {
          setGuestAttempts((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper copy to clipboard simulation that triggers state markers
  const triggerCopyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex((prev) => ({ ...prev, [keyId]: true }));
    setTimeout(() => {
      setCopiedIndex((prev) => ({ ...prev, [keyId]: false }));
    }, 2000);
  };

  // Log Out Reset
  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('welcome');
    setGuestAttempts(0);
    setGenerationResult(null);
    setShowGuestLimitModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col relative overflow-x-hidden ${
      theme === 'cosmic' 
        ? 'bg-[#030307] text-[#F5F5FA] selection:bg-amber-500 selection:text-black' 
        : 'bg-[#F8F9FA] text-[#1E1E24] selection:bg-amber-200 selection:text-black'
    }`}>
      {/* Decorative Orbs */}
      {theme === 'cosmic' ? (
        <>
          <div className="absolute top-1/4 left-0 w-96 h-96 orb-gold rounded-full pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-12 right-0 w-[500px] h-[500px] orb-violet rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 left-0 w-96 h-96 orb-light-amber rounded-full pointer-events-none" />
          <div className="absolute bottom-12 right-0 w-[500px] h-[500px] orb-light-blue rounded-full pointer-events-none" />
        </>
      )}

      {/* GLOBAL HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto transition-all ${
        theme === 'cosmic' 
          ? 'bg-[#030307]/80 border-b border-amber-500/15' 
          : 'bg-white/80 border-b border-zinc-200 shadow-sm'
      }`} id="global-header">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAppState('welcome')}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold italic text-sm shadow-lg transition-all ${
            theme === 'cosmic'
              ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black shadow-amber-500/20'
              : 'bg-zinc-900 text-white shadow-zinc-900/10'
          }`}>A+</div>
          <div className="text-left font-sans">
            <span className={`text-lg font-extrabold tracking-tighter uppercase block leading-none ${theme === 'cosmic' ? 'text-white' : 'text-zinc-955'}`}>
              AdsCreator <span className={theme === 'cosmic' ? 'text-amber-500' : 'text-zinc-650'}>Pro</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-none block mt-0.5">AFFILIATE ENGINE</span>
          </div>
        </div>

        {/* HUD Controls & Info Bar */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
              theme === 'cosmic'
                ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-300'
                : 'bg-zinc-100 border border-zinc-200 text-zinc-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentUser.isGuest ? 'bg-zinc-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="font-bold">{currentUser.username}</span>
              <span className="opacity-40">|</span>
              <span className="text-amber-600 font-bold">{currentUser.isGuest ? 'GUEST' : 'MEMBER'}</span>
            </div>
          )}

          {/* Subtle Status Indicator */}
          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-[11px] font-mono select-none transition-all ${
            theme === 'cosmic'
              ? 'bg-zinc-950/60 border-amber-500/20 text-zinc-300'
              : 'bg-zinc-100/60 border-zinc-300 text-zinc-800'
          }`} id="engine-status-hud" title="Current Prompt AI Generating Engine Pool Status">
            <span className={`w-2 h-2 rounded-full ${
              engineStatus === 'Gemini Online' 
                ? 'bg-emerald-500 animate-pulse' 
                : 'bg-amber-500'
            }`} />
            <span className={`font-bold uppercase tracking-wider ${
              engineStatus === 'Gemini Online' 
                ? 'text-emerald-500' 
                : 'text-amber-600'
            }`}>
              {engineStatus === 'Gemini Online' ? 'Gemini Online' : 'Local Studio Active'}
            </span>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all cursor-pointer focus:outline-none flex items-center justify-center active:scale-95 ${
              theme === 'cosmic'
                ? 'bg-zinc-900/60 border-zinc-800 text-amber-400 hover:bg-zinc-800/10 hover:border-amber-500/30'
                : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 shadow-sm'
            }`}
            id="theme-toggler"
            title={theme === 'cosmic' ? 'Switch to Light Theme' : 'Switch to Cosmic Theme'}
          >
            {theme === 'cosmic' ? (
              <span className="text-xs">☀️</span>
            ) : (
              <span className="text-xs">🌙</span>
            )}
          </button>

          {/* Dynamic Interactive Translate Button */}
          <button
            onClick={toggleLanguage}
            className={`px-4 py-2 rounded-full text-xs flex items-center gap-2 cursor-pointer transition-colors font-mono uppercase tracking-widest active:scale-95 focus:outline-none ${
              theme === 'cosmic'
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 shadow-xs'
            }`}
            id="translate-toggle"
          >
            <span className="opacity-70">🌐 Translate:</span>
            <span className={`font-bold ${theme === 'cosmic' ? 'text-amber-500' : 'text-zinc-900'}`}>
              {lang === 'id' ? 'ID' : 'EN'} <span className="text-[9px] opacity-40 font-normal">(Powered by Google)</span>
            </span>
          </button>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-black border border-red-500/20 transition-all cursor-pointer focus:outline-none"
              title={t.logoutButton}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 relative z-10">
        
        {/* Welcome State (FASE 0 Landing Page) */}
        {appState === 'welcome' && (
          <LandingPage lang={lang} onGetStarted={() => setAppState('auth')} />
        )}

        {/* Auth State (FASE 1 Cybersecurity Gateway Panel) */}
        {appState === 'auth' && (
          <AuthSystem
            lang={lang}
            simulatedIp={simulatedIp}
            setSimulatedIp={setSimulatedIp}
            onAuthSuccess={handleAuthSuccess}
            onBackdoorInit={handleBackdoorInit}
          />
        )}

        {/* Core Workspace Dashboard State (FASE 2 Full Input Form UI) */}
        {appState === 'dashboard' && currentUser && (
          <div className="space-y-8 max-w-4xl mx-auto" id="dashboard-workspace">
            {/* Header section detailing account configuration limits */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl transition-all ${
              theme === 'cosmic'
                ? 'bg-zinc-950/40 border border-amber-500/15'
                : 'bg-white border border-zinc-200 shadow-xs text-zinc-900'
            }`}>
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${theme === 'cosmic' ? 'text-white' : 'text-zinc-955'}`}>
                  {lang === 'id' ? '📋 Panel Studi Pembuat Iklan' : '📋 Ad Creator Studio Deck'}
                </h2>
                <p className={`text-xs mt-1 ${theme === 'cosmic' ? 'text-zinc-400' : 'text-zinc-600 font-medium'}`}>
                  {lang === 'id'
                    ? `Peran Aktif Anda: ${currentUser.isGuest ? '🚀 GUEST TAMU (Batas 1 Kali)' : '💎 ANGGOTA PRO (Akses Penuh)'}`
                    : `Active Account Tier: ${currentUser.isGuest ? '🚀 GUEST TIER (1-Attempt Limit)' : '💎 PRO MEMBER (No-Limit Access)'}`}
                </p>
              </div>

              {currentUser.isGuest && (
                <div className={`p-3 rounded-xl max-w-sm border transition-all ${
                  theme === 'cosmic' 
                    ? 'bg-amber-500/10 border-amber-500/20' 
                    : 'bg-amber-50/60 border-amber-300'
                }`}>
                  <p className={`text-[10px] font-mono leading-relaxed ${theme === 'cosmic' ? 'text-amber-500' : 'text-amber-700 font-bold'}`}>
                    🚨 {lang === 'id' 
                      ? 'Mode Tamu memiliki batas generate 1 kali dan fitur upload model terkunci.' 
                      : 'Guest status allows 1-attempt limit. Custom model uploads are deactivated.'}
                  </p>
                </div>
              )}
            </div>

            {/* MAIN COMPLEX CONTROL PANEL FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Left Column: Visual Assets Upload & Model Config details */}
              <div className="space-y-6">
                
                {/* MODUL A: Product Visuals */}
                <div className={`${cardClass} space-y-4`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${theme === 'cosmic' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-orange-600 text-black font-bold text-[10px] italic">A</span>
                    <h3 className={`font-sans font-bold tracking-tight uppercase text-xs ${theme === 'cosmic' ? 'text-orange-500' : 'text-zinc-900'}`}>
                      {lang === 'id' ? 'Visual Produk (Wajib Min. 1)' : 'Product Visuals (Req. Min. 1)'}
                    </h3>
                  </div>

                  {/* Mock Drag Drop File Upload Simulator */}
                  <div className="space-y-3">
                    <label className={labelClass}>
                      {lang === 'id' ? '1. Unggah Foto Produk (Maks 5)' : '1. Upload Product Photo (Max 5)'}
                    </label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group relative ${
                        theme === 'cosmic'
                          ? 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/10'
                          : 'border-zinc-350 hover:border-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUploadMock(file.name);
                          }
                        }}
                      />
                      <Compass className="w-8 h-8 text-zinc-500 mx-auto group-hover:text-amber-500 transition-colors" />
                      <p className="text-xs text-zinc-300 font-bold mt-2">
                        {lang === 'id' ? 'Klik atau Tarik File Gambar Ke Sini' : 'Click or dragging files directly here'}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                        Supports JPEG, PNG up to 10MB
                      </p>
                    </div>

                    {/* Quick Simulation Options */}
                    <div className="flex gap-2 justify-center flex-wrap pt-1">
                      <button
                        onClick={() => handleFileUploadMock('shampoo_floral_bottle.jpg')}
                        className={`px-2 py-1 rounded border text-[10px] font-mono transition-all ${
                          theme === 'cosmic'
                            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                            : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 font-semibold shadow-xs'
                        }`}
                      >
                        + Shampoo Bottle Photo
                      </button>
                      <button
                        onClick={() => handleFileUploadMock('smart_watch_pro.png')}
                        className={`px-2 py-1 rounded border text-[10px] font-mono transition-all ${
                          theme === 'cosmic'
                            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
                            : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 font-semibold shadow-xs'
                        }`}
                      >
                        + Smart Watch Photo
                      </button>
                    </div>
                  </div>

                  {/* Manual Marketplace Link Inputs */}
                  <div className="space-y-2 pt-2">
                    <label className={labelClass}>
                      {lang === 'id' ? '2. Input Link Produk Marketplace (Maks 5)' : '2. Input Marketplace Product Links (Max 5)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempProductLink}
                        onChange={(e) => setTempProductLink(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-orange-500 ${
                          theme === 'cosmic'
                            ? 'bg-zinc-900 text-white border border-zinc-800'
                            : 'bg-white text-zinc-950 border border-zinc-300 shadow-xs'
                        }`}
                        placeholder="e.g. https://shopee.co.id/product/..."
                      />
                      <button
                        onClick={addProductLink}
                        className={`px-3 rounded-lg border text-xs transition-all cursor-pointer focus:outline-none ${
                          theme === 'cosmic'
                            ? 'bg-zinc-800 hover:bg-orange-600 hover:text-black hover:font-bold border-zinc-700 text-zinc-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Showcase Added Visual Assets / Links */}
                  {(inputs.productVisuals.length > 0 || inputs.productLinks.length > 0) && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold">
                        {lang === 'id' ? 'Aset Visual Terdeteksi:' : 'Parsed Visual Assets Ready:'}
                      </span>
                      <div className="space-y-1.5">
                        {inputs.productVisuals.map((vis, idx) => (
                          <div key={`vis-${idx}`} className="flex justify-between items-center bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80 text-xs font-mono">
                            <span className="text-zinc-300 line-clamp-1">📸 {vis}</span>
                            <button
                              onClick={() => removeProductVisual(idx)}
                              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {inputs.productLinks.map((lnk, idx) => (
                          <div key={`lnk-${idx}`} className="flex justify-between items-center bg-blue-950/20 p-2 rounded-lg border border-blue-900/20 text-xs font-mono">
                            <span className="text-blue-400 line-clamp-1 leading-none">{lnk}</span>
                            <button
                              onClick={() => removeProductLink(idx)}
                              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* MODUL B: Model & Karakter (GUEST RESTRICTED) */}
                <div className={`${cardClass} space-y-4`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${theme === 'cosmic' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-orange-600 text-black font-bold text-[10px] italic">B</span>
                      <h3 className={`font-sans font-bold tracking-tight uppercase text-xs ${theme === 'cosmic' ? 'text-orange-500' : 'text-zinc-900'}`}>
                        {lang === 'id' ? 'Model & Karakter (Opsional)' : 'Model & Character (Optional)'}
                      </h3>
                    </div>

                    {currentUser.isGuest && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-red-950/30 text-red-500 border border-red-950 px-2 py-0.5 rounded font-mono font-bold">
                        <Lock className="w-3 h-3" />
                        {lang === 'id' ? 'GUEST TERKUNCI' : 'LOCKED'}
                      </span>
                    )}
                  </div>

                  {currentUser.isGuest ? (
                    <div className={`p-5 text-center border rounded-xl space-y-2 ${
                      theme === 'cosmic'
                        ? 'text-zinc-500 border-zinc-900 bg-zinc-950/50'
                        : 'text-zinc-600 border-zinc-200 bg-zinc-50'
                    }`}>
                      <Lock className="w-8 h-8 text-zinc-400 mx-auto" />
                      <p className={`text-xs font-mono ${theme === 'cosmic' ? 'text-zinc-400' : 'text-zinc-700 font-medium'}`}>
                        {lang === 'id' 
                          ? '🔒 Akses Upload Model hanya untuk member.' 
                          : '🔒 Upload Model feature is locked. Reserved for registered members.'}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="mt-2 text-[10px] bg-amber-500 text-black font-bold font-mono px-3 py-1 rounded hover:bg-amber-400 transition-colors uppercase cursor-pointer"
                      >
                        {lang === 'id' ? 'Daftar Sekarang' : 'Register Now'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Photo Upload Simulator & Face Detection */}
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-400 font-mono block">
                          {lang === 'id' ? 'Upload Foto Model Pendukung:' : 'Upload Supporting Model Photo:'}
                        </label>

                        {!inputs.modelPhoto ? (
                          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/10 text-center space-y-2">
                            <p className="text-xs text-zinc-400">
                              {lang === 'id' ? 'Simulasikan deteksi cerdas pose AI:' : 'Simulate high intelligence model poses:'}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleModelUploadMock('model_avatar_kstyle.jpg', '3D')}
                                className="px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white transition-all text-center"
                              >
                                [Korean 3D Style]
                              </button>
                              <button
                                onClick={() => handleModelUploadMock('ghibli_girl_sitting.png', 'Cartoon')}
                                className="px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white transition-all text-center"
                              >
                                [Cartoon Style]
                              </button>
                              <button
                                onClick={() => handleModelUploadMock('faceless_office_sitting.jpg', 'Faceless')}
                                className="px-2 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white transition-all text-center"
                              >
                                [Faceless Silhouette]
                              </button>
                            </div>
                            <span className="text-[10px] text-zinc-500 block font-mono">
                              * {lang === 'id' ? 'Biarkan kosong untuk generate acak tanpa model preset.' : 'Leave empty for automated layout randomization.'}
                            </span>
                          </div>
                        ) : (
                          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3 font-mono">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-300">📁 {inputs.modelPhoto}</span>
                              <button
                                onClick={clearModelPhotoObj}
                                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Simulated Face Detection System */}
                            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] space-y-1">
                              <div className="flex items-center justify-between text-emerald-400 font-bold">
                                <span>⚡ AI COGNITIVE PARSE ENGINE DETECTED:</span>
                                <span className="animate-pulse">● ONLINE</span>
                              </div>
                              <div className="text-zinc-400 text-left">
                                - Detect-Classify Format: <span className="text-amber-500 font-bold uppercase">{inputs.modelDetectionType} DETECTED</span><br />
                                - Safety Filter Sweep: <span className="text-emerald-400 font-bold">NSFW 0% (CLEAN)</span><br />
                                - Celebrity Identity Check: <span className="text-emerald-400 font-semibold">NO PUBLIC FIGURES OBSERVED</span>
                              </div>
                            </div>

                            {/* Standard safety checkbox validation requirement */}
                            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={inputs.isOwnModelApproved}
                                onChange={(e) => setInputs({ ...inputs, isOwnModelApproved: e.target.checked })}
                                className="mt-1 rounded text-orange-600 focus:ring-orange-500 bg-zinc-950 border-zinc-800 cursor-pointer"
                              />
                              <span className="text-[10px] text-zinc-400 leading-snug">
                                {lang === 'id'
                                  ? 'Saya menyetujui foto ini milik saya/sah, tidak mengandung konten pornografi, LGBT, dan bukan tokoh terkenal publik.'
                                  : 'I confirm that this model photograph is legally mine, completely safe (non-pornographic/NSFW), and does not represent any famous public figures.'}
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Descriptions, Marketplace setups, & Style Preferences */}
              <div className="space-y-6">
                
                {/* MODUL C: Deskripsi & Affiliates */}
                <div className={`${cardClass} space-y-4`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${theme === 'cosmic' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-orange-600 text-black font-bold text-[10px] italic">C</span>
                    <h3 className={`font-sans font-bold tracking-tight uppercase text-xs ${theme === 'cosmic' ? 'text-orange-500' : 'text-zinc-900'}`}>
                      {lang === 'id' ? 'Deskripsi & Target Afiliasi' : 'Descriptions & Affiliate Target'}
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className={labelClass}>
                        {lang === 'id' ? 'Deskripsi Lengkap Produk (Wajib):' : 'Product Description Text (Req):'}
                      </label>
                      <textarea
                        required
                        value={inputs.productDescription}
                        onChange={(e) => setInputs({ ...inputs, productDescription: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-orange-500 h-24 resize-none leading-relaxed ${
                          theme === 'cosmic'
                            ? 'bg-zinc-900 text-white border border-zinc-800'
                            : 'bg-white text-zinc-950 border border-zinc-300 shadow-xs'
                        }`}
                        placeholder={
                          lang === 'id'
                            ? 'Contoh: Botol termos pintar stainless steel anti tumpah dengan sensor suhu LCD di tutupnya. Tahan panas 24 jam.'
                            : 'Explain core benefits: Stainless steel thermos smart bottle with integrated lid thermometer temperature sensors.'
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className={labelClass}>Marketplace</label>
                        <select
                          value={inputs.marketplace}
                          onChange={(e) => setInputs({ ...inputs, marketplace: e.target.value as any })}
                          className={selectClass}
                        >
                          <option value="Shopee">Shopee Affiliate</option>
                          <option value="Tokopedia">Tokopedia Mandiri</option>
                          <option value="TikTok Shop">TikTok Shop Creator</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className={labelClass}>
                          {lang === 'id' ? 'ID Affiliate (Opsional):' : 'Affiliate ID (Optional):'}
                        </label>
                        <input
                          type="text"
                          value={inputs.affiliateId}
                          onChange={(e) => setInputs({ ...inputs, affiliateId: e.target.value })}
                          className={inputClass}
                          placeholder="e.g. shopee_viral_99"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODUL D: Preferensi Artistik */}
                <div className={`${cardClass} space-y-4`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${theme === 'cosmic' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-orange-600 text-black font-bold text-[10px] italic">D</span>
                    <h3 className={`font-sans font-bold tracking-tight uppercase text-xs ${theme === 'cosmic' ? 'text-orange-500' : 'text-zinc-900'}`}>
                      {lang === 'id' ? 'Preferensi Visual & Audio' : 'Visual & Audio Settings'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className={labelClass}>{lang === 'id' ? 'Style Visual' : 'Artistic Style'}</label>
                      <select
                        value={inputs.style}
                        onChange={(e) => setInputs({ ...inputs, style: e.target.value as ProductStyle })}
                        className={selectClass}
                      >
                        <option value="Cinematic">Cinematic Hollywood</option>
                        <option value="Realistic">Realistic Photographic</option>
                        <option value="3D">3D Render Unreal Engine</option>
                        <option value="Studio Ghibli">Studio Ghibli Anime</option>
                        <option value="Minimalist">Minimalist Soft-Vibe</option>
                        <option value="Faceless">Review Produk Faceless (Hand Focus)</option>
                        <option value="Etalase">Review Produk di Etalase (No Model)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>{lang === 'id' ? 'Sudut Kamera' : 'Camera Angle'}</label>
                      <select
                        value={inputs.angle}
                        onChange={(e) => setInputs({ ...inputs, angle: e.target.value as VisualAngle })}
                        className={selectClass}
                      >
                        <option value="Zoom">Zoom / Extreme Close-up</option>
                        <option value="Fisheyes">Fisheyes Extreme Curve</option>
                        <option value="Boomerang">Boomerang Dynamic Looping</option>
                        <option value="Overhead">Overhead Flatlay</option>
                        <option value="Low-Angle">Low-Angle Hero Stance</option>
                        <option value="Wide Shot">Wide Shot Ambient Context</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>{lang === 'id' ? 'Pengisi Suara (VO)' : 'Voice Over Setup'}</label>
                      <select
                        value={inputs.voVoice}
                        onChange={(e) => setInputs({ ...inputs, voVoice: e.target.value as VOVoice })}
                        className={selectClass}
                      >
                        <option value="User">Voice Record Pribadi</option>
                        <option value="Male">TTS Pria Maskulin</option>
                        <option value="Female">TTS Wanita Feminin</option>
                        <option value="Elder">TTS Suara Orangtua</option>
                        <option value="Teenager">TTS Suara Remaja Gaul</option>
                        <option value="Child">TTS Suara Anak-anak</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>{lang === 'id' ? 'Intonasi TTS' : 'TTS Intonation'}</label>
                      <select
                        value={inputs.voIntonation}
                        onChange={(e) => setInputs({ ...inputs, voIntonation: e.target.value as VOIntonation })}
                        className={selectClass}
                      >
                        <option value="Ceria">Ceria / Semangat Jualan</option>
                        <option value="Elegan">Elegan / Mewah Lembut</option>
                        <option value="Misterius">Misterius / Berkelanjutan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MAIN RUN DECK GENERATOR */}
                <div className="pt-2 text-center">
                  <button
                    onClick={handleGeneratePrompt}
                    className="relative w-full group cursor-pointer focus:outline-none"
                    id="execute-generation"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 rounded-2xl animate-pulse"></div>
                    <div className="relative w-full bg-gradient-to-r from-orange-500 to-red-600 text-black font-black text-base sm:text-lg uppercase tracking-tighter py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transform active:scale-[0.98] transition-all">
                      <Flame className="w-5 h-5 animate-bounce" />
                      {t.generateButton}
                    </div>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Loading Screen and Generation System (FASE 3 & FASE 4) */}
        {appState === 'result' && (
          <div className="space-y-10 max-w-5xl mx-auto animate-fade-in" id="workspace-rendering">
            {isGenerating ? (
              /* High aesthetics render load state */
              <div className="py-24 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-orange-600 animate-spin" />
                  <Flame className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-widest uppercase italic">{lang === 'id' ? 'RENDERING PROMPT...' : 'GENERATING EXPERT PROMPTS...'}</h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    {lang === 'id'
                      ? 'AI sedang memproses naskah, sudut kamera, deskripsi Midjourney/Flux, serta tautan affiliate Anda.'
                      : 'Integrating camera frames, Midjourney tokens, affiliate tags, and optimized VO pacing scripts.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Execution results showing complete tables */
              <div className="space-y-10 text-left">
                
                {/* Generation Output Header banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl bg-gradient-to-r from-amber-950/20 to-zinc-900 border border-amber-500/20 gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                      COMPLETED SUCCESS
                    </span>
                    <h2 className="text-2xl font-black text-white italic tracking-tight">
                      {lang === 'id' ? 'HASIL GENERATOR PROMPT SINEMATIK' : 'CINEMATIC GENERATED CAMPAIGN'}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      {lang === 'id' 
                        ? 'Gunakan prompt di bawah langsung ke generator AI gambar/video favorit Anda.' 
                        : 'Deploy the prompt tokens directly within Midjourney, Leonardo, or Kling.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAppState('dashboard')}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 transition-colors cursor-pointer"
                    >
                      ← {lang === 'id' ? 'Buat Iklan Baru' : 'Create Another Ad'}
                    </button>
                    {currentUser?.isGuest && (
                      <div className="px-3 py-2 bg-red-950/30 border border-red-500/20 rounded-xl text-center">
                        <span className="text-[10px] text-red-400 font-bold font-mono">Guest limit: 1/1</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* IF API KEY WARNING, SHOW EXPLANATORY SYSTEM INSIGHT MESSAGE */}
                {generationResult?.apiWarning && (
                  <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-950/15 text-xs text-orange-400 flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded bg-orange-500 text-black font-extrabold text-[10px] animate-pulse">🔑</span>
                    <div>
                      <span className="font-bold block uppercase">{lang === 'id' ? 'STUDIO MANDIRI PORTAL PREMIUM AKTIF' : 'LOCAL HI-FI RENDER ENGINE ACTIVE'}</span>
                      <p className="mt-1 leading-relaxed text-zinc-300">
                        {lang === 'id'
                          ? `Info Studio: API Key dibatasi oleh server (${generationResult.apiWarning}). Sistem otomatis beralih menggunakan basis data narasi visual offline performa tinggi kami.`
                          : `Notice: External prompt key reports permissions issues (${generationResult.apiWarning}). System automatically switched to high-fidelity offline prompt database.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* IF GUEST, SHOW NOTIFICATION HEADER ON TRUNCATION */}
                {generationResult?.isTruncated && (
                  <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/10 text-xs text-yellow-500 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-500" />
                    <div>
                      <span className="font-bold block uppercase">{lang === 'id' ? 'MODE TAMU / GUEST MODE ACTIVE' : 'GUEST MODE TRIAL ACTIVE'}</span>
                      <p className="mt-1 leading-relaxed">
                        {lang === 'id'
                          ? 'Anda hanya mendapatkan 1 adegan (Adegan 1: The Viral Hook) karena berstatus Tamu. Daftar akun baru secara gratis untuk membuka 5 adegan bersunyi berkesinambungan serta fitur upload foto karakter.'
                          : 'You only generated Act 1 due to guest status limitations. Connect with a Gmail account to generate full 5 acts workflows and unlock custom models.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* TABEL 1: IMAGE PROMPTS (5 ACTS OR 1 ACT) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-orange-500 font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
                    {lang === 'id' ? 'Tabel 1: Prompt Gambar & Teks Caption' : 'Table 1: Image Prompts & Captions'}
                  </h3>

                  <div className={`overflow-x-auto rounded-xl border font-sans text-sm ${
                    theme === 'cosmic' ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-200 bg-white shadow-xs'
                  }`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs font-mono uppercase tracking-widest ${
                          theme === 'cosmic' ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600 font-bold'
                        }`}>
                          <th className="p-4 w-28">{lang === 'id' ? 'Tahap' : 'Stage'}</th>
                          <th className="p-4 min-w-[300px]">{lang === 'id' ? 'Prompt Gambar Lengkap (Artist Token)' : 'Complete Image Prompt (Art Token)'}</th>
                          <th className="p-4 w-80">{lang === 'id' ? 'Caption & Tautan Affiliate' : 'Caption & Affiliate Link'}</th>
                          <th className="p-4 w-24 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'cosmic' ? 'divide-zinc-900' : 'divide-zinc-200'}`}>
                        {generationResult?.steps.map((step, idx) => {
                          const copyIdImgPath = `img-prompt-${idx}`;
                          const copyIdCapPath = `cap-prompt-${idx}`;
                          return (
                            <tr key={`tr-img-${idx}`} className={`transition-colors ${theme === 'cosmic' ? 'hover:bg-zinc-900/15' : 'hover:bg-zinc-100/40'}`}>
                              <td className="p-4 align-top">
                                <span className={`block font-bold text-xs font-mono leading-none ${theme === 'cosmic' ? 'text-amber-500' : 'text-orange-600'}`}>
                                  {step.stageName}
                                </span>
                              </td>
                              <td className={`p-4 align-top text-xs font-mono leading-relaxed ${theme === 'cosmic' ? 'text-zinc-300 bg-zinc-950/20' : 'text-zinc-800 bg-zinc-50'}`}>
                                {step.imagePrompt}
                              </td>
                              <td className="p-4 align-top text-xs space-y-2">
                                <p className={`font-sans leading-relaxed italic ${theme === 'cosmic' ? 'text-zinc-400' : 'text-zinc-650'}`}>
                                  "{step.caption}"
                                </p>
                                <div className={`p-2 rounded border text-[10px] font-mono select-all text-amber-500 break-all leading-tight ${
                                  theme === 'cosmic' ? 'bg-zinc-900 border-zinc-800' : 'bg-amber-50 border-amber-250 text-amber-700 font-semibold'
                                }`}>
                                  🔗 {step.affiliateLink}
                                </div>
                              </td>
                              <td className="p-4 align-top text-center space-y-2">
                                <button
                                  onClick={() => triggerCopyToClipboard(step.imagePrompt, copyIdImgPath)}
                                  className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors border cursor-pointer select-none ${
                                    theme === 'cosmic'
                                      ? 'bg-zinc-900 hover:bg-orange-600 hover:text-black hover:font-bold border-zinc-800 text-zinc-400'
                                      : 'bg-zinc-100 hover:bg-orange-600 hover:text-white hover:font-bold border-zinc-300 text-zinc-700'
                                  }`}
                                  title="Copy Image Prompt"
                                >
                                  {copiedIndex[copyIdImgPath] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedIndex[copyIdImgPath] ? 'Copied' : 'Prompt'}</span>
                                </button>
                                <button
                                  onClick={() => triggerCopyToClipboard(`${step.caption}\n\nBelinya disini: ${step.affiliateLink}`, copyIdCapPath)}
                                  className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors border cursor-pointer select-none ${
                                    theme === 'cosmic'
                                      ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                                      : 'bg-zinc-150 hover:bg-zinc-200 border-zinc-300 text-zinc-700 font-semibold'
                                  }`}
                                  title="Copy Caption & Affiliate Link"
                                >
                                  {copiedIndex[copyIdCapPath] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedIndex[copyIdCapPath] ? 'Copied' : 'Caption'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TABEL 2: VIDEO SHORT PROMPTS & TTS (5 ACTS OR 1 ACT) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#2463EB] font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    {lang === 'id' ? 'Tabel 2: Prompt Video & Skrip Voice-Over' : 'Table 2: Video Prompts & Voice-Over Audio Scripts'}
                  </h3>

                  <div className={`overflow-x-auto rounded-xl border font-sans text-sm ${
                    theme === 'cosmic' ? 'border-zinc-800 bg-zinc-950/60' : 'border-zinc-200 bg-white shadow-xs'
                  }`}>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs font-mono uppercase tracking-widest ${
                          theme === 'cosmic' ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-650 font-bold'
                        }`}>
                          <th className="p-4 w-28">{lang === 'id' ? 'Tahap' : 'Stage'}</th>
                          <th className="p-4 min-w-[300px]">{lang === 'id' ? 'Prompt Visual Gerak Kamera (Sora/Runway/Kling)' : 'Camera Movement Prompt (Sora/Runway/Kling)'}</th>
                          <th className="p-4 w-80">{lang === 'id' ? 'Skrip VO & Pengaturan TTS' : 'VO Script & TTS Preset'}</th>
                          <th className="p-4 w-24 text-center font-mono">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'cosmic' ? 'divide-zinc-900' : 'divide-zinc-200'}`}>
                        {generationResult?.steps.map((step, idx) => {
                          const copyIdVidPath = `vid-prompt-${idx}`;
                          const copyIdVoPath = `vo-prompt-${idx}`;
                          return (
                            <tr key={`tr-vid-${idx}`} className={`transition-colors ${theme === 'cosmic' ? 'hover:bg-zinc-900/15' : 'hover:bg-zinc-100/40'}`}>
                              <td className="p-4 align-top">
                                <span className={`block font-bold text-xs font-mono leading-none ${theme === 'cosmic' ? 'text-blue-500' : 'text-blue-600'}`}>
                                  {step.stageName}
                                </span>
                              </td>
                              <td className={`p-4 align-top text-xs font-mono leading-relaxed ${theme === 'cosmic' ? 'text-zinc-300 bg-zinc-950/20' : 'text-zinc-800 bg-zinc-50'}`}>
                                {step.videoPrompt}
                              </td>
                              <td className="p-4 align-top text-xs space-y-2">
                                <p className={`font-sans leading-relaxed font-semibold ${theme === 'cosmic' ? 'text-zinc-300' : 'text-zinc-855'}`}>
                                  🎙️ "{step.voScript}"
                                </p>
                                <div className={`p-2 rounded border text-[10px] font-mono leading-tight ${
                                  theme === 'cosmic' ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-650'
                                }`}>
                                  🎛️ {step.ttsSetting}
                                </div>
                              </td>
                              <td className="p-4 align-top text-center space-y-2">
                                <button
                                  onClick={() => triggerCopyToClipboard(step.videoPrompt, copyIdVidPath)}
                                  className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors border cursor-pointer select-none ${
                                    theme === 'cosmic'
                                      ? 'bg-zinc-900 hover:bg-blue-600 hover:text-white border-zinc-800 text-zinc-400'
                                      : 'bg-zinc-100 hover:bg-blue-600 hover:text-white hover:font-bold border-zinc-300 text-zinc-700'
                                  }`}
                                  title="Copy Video Prompt"
                                >
                                  {copiedIndex[copyIdVidPath] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedIndex[copyIdVidPath] ? 'Copied' : 'Video'}</span>
                                </button>
                                <button
                                  onClick={() => triggerCopyToClipboard(step.voScript, copyIdVoPath)}
                                  className={`w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono transition-colors border cursor-pointer select-none ${
                                    theme === 'cosmic'
                                      ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'
                                      : 'bg-zinc-150 hover:bg-zinc-200 border-zinc-300 text-zinc-700 font-semibold'
                                  }`}
                                  title="Copy VO Script"
                                >
                                  {copiedIndex[copyIdVoPath] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedIndex[copyIdVoPath] ? 'Copied' : 'VO Script'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FASE 4: FOOTER REKOMENDASI PLATFORM AI */}
                <div className="space-y-4 pt-6 border-t border-zinc-900">
                  <div className="text-center md:text-left">
                    <h4 className="text-sm font-extrabold uppercase tracking-widest text-[#EA580C] font-mono">
                      📚 {lang === 'id' ? 'REKOMENDASI PLATFORM AI GRATIS' : 'RECOMMENDED FREE PRODUCTION SUITES'}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {lang === 'id'
                        ? 'Salin prompt di atas lalu gunakan di platform gratis di bawah ini untuk memulai rendering karya final.'
                        : 'Deploy prompt outputs inside any free engine listed below to build absolute masterpieces.'}
                    </p>
                  </div>

                  <div className={`overflow-x-auto rounded-xl border ${
                    theme === 'cosmic' ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-white shadow-xs'
                  }`}>
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className={`border-b font-mono uppercase tracking-widest text-[10px] ${
                          theme === 'cosmic' ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-650 font-bold'
                        }`}>
                          <th className="p-3">Nama Platform</th>
                          <th className="p-3">Kemampuan Utama</th>
                          <th className="p-3">Link Akses</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-xs ${theme === 'cosmic' ? 'divide-zinc-900 text-zinc-400' : 'divide-zinc-200 text-zinc-700'}`}>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>Google Gemini</td>
                          <td className="p-3">{lang === 'id' ? 'Image & Teks (Terhubung internet langsung)' : 'Image & Scripting (High Speed)'}</td>
                          <td className="p-3">
                            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              gemini.google.com
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>Meta AI</td>
                          <td className="p-3">{lang === 'id' ? 'Generator Gambar & Video Cepat' : 'Instant high quality Image & Video rendering'}</td>
                          <td className="p-3">
                            <a href="https://meta.ai" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              meta.ai
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>LM Arena</td>
                          <td className="p-3">{lang === 'id' ? 'Uji Coba Multi-Model secara bersamaan' : 'Run comparison testing of various LLMs'}</td>
                          <td className="p-3">
                            <a href="https://chat.lmsys.org" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              arena.ai
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>Bing Image Creator</td>
                          <td className="p-3">{lang === 'id' ? 'Generator Gambar Realistis DALL-E 3' : 'DALL-E 3 based realistic text-to-image'}</td>
                          <td className="p-3">
                            <a href="https://bing.com/create" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              bing.com/create
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>Leonardo AI</td>
                          <td className="p-3">{lang === 'id' ? 'Visualisasi Karakter, Produk & Animasi 3D' : 'Finely-tuned character & high control visual generation'}</td>
                          <td className="p-3">
                            <a href="https://leonardo.ai" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              leonardo.ai
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className={`p-3 font-bold ${theme === 'cosmic' ? 'text-white' : 'text-zinc-950'}`}>Hugging Face</td>
                          <td className="p-3">{lang === 'id' ? 'Kumpulan Model Eksperimental & Open-Source' : 'Thousands of community demo visual models (Flux.1 / SD)'}</td>
                          <td className="p-3">
                            <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-mono">
                              huggingface.co
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ADMIN BACKDOOR AREA */}
        {appState === 'admin' && currentUser?.isAdmin && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
            <div className="p-6 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">🛡️ Admin Command Deck (Simulated DB Overview)</h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">Viewing raw registered user accounts. Restricted sandbox telemetry.</p>
              </div>
              <button
                onClick={() => setAppState('dashboard')}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-orange-600 hover:text-black hover:font-bold text-xs rounded-xl font-mono text-zinc-300 transition-all cursor-pointer"
              >
                Go to App Dashboard
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Registered Resident Logs</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-500 text-[10px] font-mono border border-zinc-800">
                  {registeredUsers.length} Users Active
                </span>
              </div>
              <div className="divide-y divide-zinc-900">
                {registeredUsers.map((usr: any, i) => (
                  <div key={i} className="p-4 font-mono text-xs flex justify-between items-center hover:bg-zinc-900/10 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">@{usr.username}</span>
                        {usr.username === 'dev_admin' && (
                          <span className="bg-red-500/10 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded">ADMIN DECK</span>
                        )}
                      </div>
                      <span className="text-zinc-500 block">Registered Email: {usr.email}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="block text-amber-500">Virtual Client IP: <span className="font-bold underline">{usr.simulatedIp}</span></span>
                      <span className="text-[10px] text-zinc-600 block">Security Lock Binding Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* POP-UP GUEST ACCORDION ALERT DIALOG FASE 3 (RESTRICTION BLOCK) */}
      {showGuestLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full rounded-2xl border-2 border-red-500 bg-[#050505] p-8 text-center space-y-6 shadow-2xl shadow-red-950/20">
            
            <div className="w-14 h-14 bg-red-500/15 border border-red-500 rounded-full flex items-center justify-center mx-auto text-red-500 animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase text-red-500">
                ⚠️ AKSES DIBATASI ⚠️
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-semibold">
                {lang === 'id'
                  ? 'Batas percobaan Tamu (Guest) telah habis.'
                  : 'Your complimentary Guest trial request limit is exhausted.'}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {lang === 'id'
                  ? 'HARUS registrasi menggunakan Gmail untuk membuka semua akses pembuatan, 5 babak narasi sinematik bersilang utuh, serta mengaktifkan upload foto model karakter pribadi.'
                  : 'You must register immediately with any valid Google account to resolve access walls, activate character pose processing, and export five-act cinematic continuity.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowGuestLimitModal(false);
                  setAppState('auth');
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-tighter text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer focus:outline-none"
              >
                👉 {lang === 'id' ? 'KLIK DI SINI UNTUK REGISTRASI MENGGUNAKAN GMAIL' : 'CLICK HERE TO SECURE REGISTRATION WITH GMAIL'}
              </button>
            </div>

            <button
              onClick={() => setShowGuestLimitModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer font-mono font-bold focus:outline-none"
            >
              [ {lang === 'id' ? 'Tutup Peringatan' : 'Close Alert'} ]
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL FOOTER (Fase 0 - 4 mandated standard exact text output matching) */}
      <footer className="py-8 flex flex-col items-center justify-center border-t border-white/10 bg-[#080808] mt-12 max-w-full relative z-10" id="global-footer">
        <p className="text-xs tracking-widest text-zinc-400 mb-2 uppercase">
          by <span className="font-bold text-zinc-300">Te_eR™ Inovative</span>
        </p>
        <a
          href="mailto:hijr.time+ads@gmail.com"
          className="text-[11px] text-orange-600 font-bold tracking-widest hover:underline hover:text-orange-500 transition-colors font-mono uppercase"
        >
          📧 CONTACT US
        </a>
      </footer>
    </div>
  );
}
