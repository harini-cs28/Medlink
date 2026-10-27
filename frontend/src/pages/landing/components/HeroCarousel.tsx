import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  eyebrow: string;
  headline1: string;
  headline2: string;
  description: string;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: 'SHORTAGE INTELLIGENCE',
    headline1: 'See the shortage.',
    headline2: 'Before it happens.',
    description:
      'Identify potential medicine shortage risks and make more informed inventory decisions.',
    image: '/assets/pharmacy-shelves.jpg',
    alt: 'Modern hospital pharmacy medicine shelves',
  },
  {
    id: 2,
    eyebrow: 'INVENTORY VISIBILITY',
    headline1: 'Every medicine.',
    headline2: 'In clear view.',
    description:
      'Understand stock availability, monitor inventory, and keep essential medicines visible.',
    image: '/assets/pharmacist-inventory.jpg',
    alt: 'Pharmacist checking medicine inventory balances',
  },
  {
    id: 3,
    eyebrow: 'EXPIRY INTELLIGENCE',
    headline1: 'Stay ahead',
    headline2: 'of expiry.',
    description:
      'Identify at-risk batches and support smarter stock rotation and replenishment.',
    image: '/assets/hospital-vault.jpg',
    alt: 'Clean hospital pharmacy vault and medicine storage',
  },
];

export const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    const handleVisibility = () => {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stopAutoPlay();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [startAutoPlay, stopAutoPlay]);

  const goToSlide = (idx: number) => {
    setCurrent(idx);
    startAutoPlay();
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startAutoPlay();
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  };

  const activeSlide = slides[current];

  return (
    <section
      className="relative w-full h-screen min-h-[600px] max-h-screen overflow-hidden flex flex-col justify-between"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      aria-roledescription="carousel"
      aria-label="MEDLINK Intelligence Showcase"
    >
      {/* =========================================================================
          BACKGROUND IMAGES WITH CROSSFADE
          ========================================================================= */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.alt}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[10000ms] ease-out"
              onError={(e) => {
                // Fallback to local login pharmacy image
                (e.target as HTMLImageElement).src = '/assets/login-pharmacy-bg.jpg';
              }}
            />
          </div>
        ))}

        {/* Gradient Overlay: Deep clinical teal/black vignette for maximum text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071714]/95 via-[#0A221E]/80 via-45% to-[#071714]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071714]/90 via-transparent to-[#071714]/40" />
      </div>

      {/* Spacer for header */}
      <div className="h-20 shrink-0" />

      {/* =========================================================================
          HERO TEXT: LEFT-ALIGNED OVERLAY (VERTICALLY CENTERED)
          ========================================================================= */}
      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 max-w-4xl py-6 my-auto">
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 key={current}">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#087F73]/30 border border-[#4EE3CE]/40 text-[#4EE3CE] text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4EE3CE] animate-pulse" />
            <span>{activeSlide.eyebrow}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-normal leading-[1.08] tracking-tight text-balance">
            {activeSlide.headline1}
            <br />
            <span className="text-white/95">{activeSlide.headline2}</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base md:text-lg text-[#C8D6D2] max-w-xl leading-relaxed">
            {activeSlide.description}
          </p>

          {/* Primary CTA */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#087F73] hover:bg-[#06655C] text-white font-semibold text-sm sm:text-base shadow-xl hover:shadow-[#087F73]/40 transition-all cursor-pointer group"
            >
              <span>Explore MEDLINK</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SLIDER CONTROLS & INDICATORS
          ========================================================================= */}
      <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-8 pt-4 flex items-center justify-between">
        {/* Slide Indicators & Navigation Arrows */}
        <div className="flex items-center gap-4">
          {/* Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === current
                    ? 'w-7 sm:w-8 h-2 bg-[#4EE3CE] shadow-[0_0_10px_rgba(78,227,206,0.6)]'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}: ${s.eyebrow}`}
                aria-current={idx === current ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>

        {/* Subtle Brand Telemetry Tag */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#A2B7B2] font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087F73]" />
          <span>Hospital Medicine Inventory Optimization &bull; FEFO Protocol</span>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
