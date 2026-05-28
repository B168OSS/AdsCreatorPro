import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import PortfolioShowcase from './PortfolioShowcase';

interface LandingPageProps {
  lang: 'id' | 'en';
  onGetStarted: () => void;
}

export default function LandingPage({ lang, onGetStarted }: LandingPageProps) {
  const isIndo = lang === 'id';
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: isIndo ? 'Apa manfaat menggunakan AdsCreator Pro?' : 'What are the benefits of using AdsCreator Pro?',
      a: isIndo
        ? 'Membantu Anda memproduksi ide promosi visual (prompt gambar dan video) secara bersambung dan terstruktur serta menyesuaikan skrip tontonan berdurasi short (5-10 detik) lengkap dengan ID Affiliate Anda.'
        : 'It helps you produce structured visual promo concepts (sequential image & video prompts) tailored instantly into high-retention short clips (5-10s) synced with your Affiliate ID.'
    },
    {
      q: isIndo ? 'Bagaimana cara penggunaannya?' : 'How do I use it?',
      a: isIndo
        ? 'Cukup unggah foto produk Anda atau masukkan link marketplace, tentukan model dan preferensi visual & audio, lalu tekan tombol Generate. AI akan menyusun skenario sinematik promosi Anda secara instan.'
        : 'Simply upload your product photos or insert marketplace links, setup model choices, define visual & voice over presets, and click Generate. The AI instantly weaves a five-stage cinematic storyline.'
    },
    {
      q: isIndo ? 'Bagaimana dengan kebijakan privasi data saya?' : 'What is your user privacy policy?',
      a: isIndo
        ? 'Sangat aman. Kami tidak menyebarkan atau menyalahgunakan foto produk, foto model, atau ID Affiliate Anda ke publik. Data diolah aman sesuai standar enkripsi terkini.'
        : 'Completely secure. We do not distribute or misuse your product images, model photos, or Affiliate IDs. All interactions are processed using strict internal security baselines.'
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-fade-in" id="landing-page">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-4 h-4" />
          {isIndo ? 'DILENGKAPI GEMINI AI COGNITIVE MODEL' : 'POWERED BY GEMINI COGNITIVE DESIGN'}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-white leading-tight">
          {isIndo
            ? 'Ubah Foto Produk Biasa Menjadi Iklan Sinematik Kelas Dunia!'
            : 'Transform Generic Product Photos Into World-Class Cinematic Ads!'}
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isIndo
            ? 'Maksimalkan komisi affiliate Shopee, Tokopedia, & TikTok Shop dengan skrip visual berkualitas studio Hollywood yang langsung memicu pembelian dalam sekali tayang.'
            : 'Multiply your Shopee, Tokopedia, & TikTok Shop affiliate commissions utilizing professional studio-grade visual scripts constructed to trigger immediate buyer action.'}
        </p>

        {/* Massive Call To Action Button */}
        <div className="pt-4">
          <button
            onClick={onGetStarted}
            className="relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 group cursor-pointer focus:outline-none"
            id="cta-start-ads"
          >
            <span>🚀 {isIndo ? 'MULAI BUAT IKLAN SEKARANG - GRATIS!' : 'START CREATING ADS NOW - FREE!'}</span>
          </button>
        </div>
      </div>

      {/* Feature Badges Accent Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4 text-center">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center space-y-2">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            {isIndo ? 'Proses Instan' : 'Instant Process'}
          </h4>
          <p className="text-xs text-zinc-500">
            {isIndo ? 'Render prompt sinematik hanya dalam 3 detik.' : 'Generate ultra-rich cinematic prompts in under 3 seconds.'}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center space-y-2">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            {isIndo ? 'Audio Terstruktur' : 'Structured VO Setup'}
          </h4>
          <p className="text-xs text-zinc-500">
            {isIndo ? 'Skrip Voice Over terkalibrasi durasi Short.' : 'Optimized VO speech matches exact short video limits.'}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 flex flex-col items-center space-y-2">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            {isIndo ? 'Keamanan IP & GDPR' : 'IP & GDPR Firewalled'}
          </h4>
          <p className="text-xs text-zinc-500">
            {isIndo ? 'Validasi IP login ganda guna mencegah kebocoran.' : 'Dual IP checks block credential hijacking attempts.'}
          </p>
        </div>
      </div>

      {/* Showcase Section */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-sans text-center text-white tracking-tight">
          {isIndo ? 'Hasil Produksi Studio Iklan Kami' : 'Explore Our Specialized Ad Renditions'}
        </h2>
        <PortfolioShowcase lang={lang} />
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6" id="faq-section">
        <div className="flex items-center gap-2 justify-center">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isIndo ? 'Pertanyaan Sering Diajukan (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h2>
        </div>

        <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-zinc-950/40 overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="transition-colors duration-200 hover:bg-zinc-900/10">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium text-white focus:outline-none"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`}
                  />
                </button>
                <div
                  className={`px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-40 block opacity-100' : 'max-h-0 hidden opacity-0'
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
