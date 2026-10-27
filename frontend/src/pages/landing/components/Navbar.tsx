import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 h-20 px-6 sm:px-12 lg:px-16 flex items-center justify-between transition-all duration-300 bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white">
      {/* Left: Brand logo and wordmark */}
      <button
        onClick={() => navigate('/')}
        className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        aria-label="MEDLINK Home"
      >
        <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/15 backdrop-blur-xs transition-transform group-hover:scale-105">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4EE3CE]"></span>
        </div>
        <div className="flex flex-col">
          <span className="font-instrument italic text-2xl font-medium tracking-tight text-white leading-none">
            MEDLINK
          </span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-[#A2B7B2] font-semibold mt-0.5">
            INTELLIGENT INVENTORY
          </span>
        </div>
      </button>

      {/* Right: Get Started CTA */}
      <button
        onClick={() => navigate('/login')}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#087F73] hover:bg-[#06655C] text-white transition-all shadow-md hover:shadow-[#087F73]/30 cursor-pointer"
      >
        <span>Get Started</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </header>
  );
};

export default Navbar;
