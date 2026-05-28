import React from 'react';
import { Camera, Image as ImageIcon, Film, Play, Eye } from 'lucide-react';

interface PortfolioShowcaseProps {
  lang: 'id' | 'en';
}

export default function PortfolioShowcase({ lang }: PortfolioShowcaseProps) {
  const isIndo = lang === 'id';

  const items = [
    {
      title: 'Style: Photographic Realistic',
      desc: isIndo
        ? 'Visualisasi ultra-detail dengan pencahayaan studio 8K, menonjolkan keaslian produk fisik.'
        : 'Ultra-detailed visualization with 8K studio lighting, highlighting physical product authenticity.',
      tag: 'Realistic',
      bgGradient: 'from-amber-950 via-zinc-900 to-black',
      icon: ImageIcon,
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
    },
    {
      title: 'Style: Studio Ghibli',
      desc: isIndo
        ? 'Visual lukisan cat air hangat yang estetik dan emosional, sangat viral di kalangan milenial.'
        : 'Warm watercolor visual aesthetic, deeply emotive and highly viral among millennials.',
      tag: 'Ghibli Anime',
      bgGradient: 'from-emerald-950 via-zinc-900 to-black',
      icon: Camera,
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Style: Cinematic Hollywood',
      desc: isIndo
        ? 'Dramatisir produk dengan flare cahaya anamorfik, kabut halus, dan kontras warna sinema.'
        : 'Dramatic product dramatization with anamorphic lens flares, soft haze, and cinematic color contrast.',
      tag: 'Cinematic',
      bgGradient: 'from-violet-950 via-zinc-900 to-black',
      icon: Film,
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400',
    },
  ];

  return (
    <div className="space-y-8" id="portfolio-showcase">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.bgGradient} p-6 transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 group`}
            >
              {/* Decorative light beam */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-xl rounded-full group-hover:bg-white/10 transition-colors" />

              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 ${item.textColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {item.tag}
                </span>
                <span className="text-white/30 text-xs font-mono">{`0${i + 1}`}</span>
              </div>

              <h4 className="text-lg font-sans font-medium text-white group-hover:text-amber-300 transition-colors duration-200">
                {item.title}
              </h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {item.desc}
              </p>

              {/* Simulated render metrics */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Resolution: 8K UHD</span>
                <span>Render: 1.2s</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Short Preview */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />

        <div className="relative flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-2/5 flex-shrink-0">
            <div className="relative aspect-[9/16] max-w-[240px] mx-auto rounded-2xl border-4 border-zinc-800 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl overflow-hidden group">
              {/* Simulated video playback content */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 flex flex-col justify-between p-4">
                <div className="flex justify-between items-center text-[10px] bg-black/40 backdrop-blur-md py-1 px-2 rounded-full border border-white/10 text-zinc-300">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span>LIVESTREAM SIMULATOR</span>
                  </div>
                </div>

                {/* Simulated center play graphic */}
                <div className="w-12 h-12 rounded-full bg-amber-500/90 flex items-center justify-center self-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-5 h-5 text-black fill-current translate-x-0.5" />
                </div>

                <div className="space-y-2 text-left">
                  <div className="inline-block bg-amber-500 text-black font-semibold text-[9px] px-1.5 py-0.5 rounded font-mono">
                    PROMO SHOPPING
                  </div>
                  <h5 className="text-white text-xs font-semibold leading-snug drop-shadow-md line-clamp-2">
                    {isIndo
                      ? 'Capek pakai termometer dahi konvensional? Beralih ke Smart Thermometer!'
                      : 'Tired of conventional forehead thermometers? Upgrade to Smart Thermometer!'}
                  </h5>
                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div className="bg-amber-500 h-full w-2/3 rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-300 font-mono">
                    <span>0:04 / 0:10</span>
                    <span>HD 60FPS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 py-1 px-3 rounded-full text-xs font-mono">
              <Eye className="w-3.5 h-3.5" />
              {isIndo ? 'Simulasi Transisi Video Short' : 'Simulated Short-Video Transitions'}
            </div>
            <h3 className="text-2xl font-sans font-bold text-white tracking-tight">
              {isIndo
                ? 'Skenario Video Instan 10 Detik Berdaya Konversi Tinggi'
                : '10-Second High-Conversion Micro-Video Scripts'}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {isIndo
                ? 'Tidak hanya memikirkan script teks saja, AI menyusun manual dinamika transisi visual per adegan. Dapatkan instruksi sudut kamera ("camera dolly zoom", "high motion panning"), sound effect yang tepat, beserta ketukan rima Voice Over untuk menghasilkan short yang adiktif di algoritma TikTok & Reels.'
                : 'Beyond textual narrative, our AI maps exact camera mechanics for every frame. Get real directions like dolly zooms, visual pans, matched SFX patterns, and precise VO intonation pacing designed to crack the code on TikTok & Shorts algorithms.'}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Camera Direction Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Exact TTS Speech Ratios</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Marketplace URL Bindings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Audited NSFW Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
