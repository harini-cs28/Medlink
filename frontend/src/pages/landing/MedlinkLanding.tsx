import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';

/**
 * MEDLINK Landing Page
 * Single full-screen hero with automatic background image slider,
 * slim top navigation, and left-aligned text overlay.
 */
export const MedlinkLanding: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#071714] text-white selection:bg-[#4EE3CE]/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Immersive Full-Screen Hero Background Slider */}
      <main className="w-full h-full">
        <HeroCarousel />
      </main>
    </div>
  );
};

export default MedlinkLanding;
