/**
 * MEDLINK — Premium Cinematic Landing Page
 * Five full-screen editorial slides with Framer Motion animations.
 * Fonts: Instrument Serif (headings) + Barlow (body/labels) — loaded in index.html.
 * Colours: exact MEDLINK palette (#F7F8F4 ivory, #087F73 teal, #9B8AFB lavender, #172321 text).
 * Assets: /assets/medpredict-logo.png, /assets/login-pharmacy-bg.jpg (public/).
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Props ────────────────────────────────────────────────────── */
interface LandingPageProps {
  onEnter: () => void; // navigates to Login
}

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
  ivory: '#F7F8F4',
  ivoryAlt: '#EEF3F0',
  white: '#FFFFFF',
  teal: '#087F73',
  tealLight: '#5BAFA3',
  lavender: '#9B8AFB',
  lavenderBg: '#EEEAFE',
  text: '#172321',
  textSoft: '#667572',
  success: '#3FA66B',
  warning: '#E9A23B',
  risk: '#E56B6F',
  border: '#DCE5E1',
};

const F = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Barlow', system-ui, sans-serif",
};

/* ─── Shared animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: d, ease: 'easeOut' as const } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (d = 0) => ({ opacity: 1, transition: { duration: 0.6, delay: d, ease: 'easeOut' as const } }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (d = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.8, delay: d, ease: 'easeOut' as const } }),
};

/* ─── Hook: in-view with once:true ──────────────────────────────── */
function useSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return { ref, inView };
}

/* ─── Connecting SVG line ────────────────────────────────────────── */
const DrawLine: React.FC<{
  d: string;
  color?: string;
  delay?: number;
  inView: boolean;
  strokeWidth?: number;
}> = ({ d, color = C.tealLight, delay = 0, inView, strokeWidth = 1 }) => (
  <motion.path
    d={d}
    stroke={color}
    strokeWidth={strokeWidth}
    fill="none"
    strokeLinecap="round"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
    transition={{ duration: 1, delay, ease: 'easeInOut' }}
  />
);

/* ─── Small annotation node ──────────────────────────────────────── */
const Node: React.FC<{
  label: string;
  x: number;
  y: number;
  color?: string;
  inView: boolean;
  delay?: number;
  textAnchor?: 'start' | 'middle' | 'end';
}> = ({ label, x, y, color = C.teal, inView, delay = 0, textAnchor = 'start' }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0 }}
    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
    transition={{ duration: 0.4, delay, ease: 'backOut' }}
  >
    <circle cx={x} cy={y} r={4} fill={color} />
    <text
      x={textAnchor === 'end' ? x - 10 : x + 10}
      y={y + 4}
      fontSize={9}
      fontFamily={F.sans}
      fontWeight={600}
      letterSpacing={1.5}
      fill={C.textSoft}
      textAnchor={textAnchor === 'end' ? 'end' : 'start'}
      style={{ userSelect: 'none' }}
    >
      {label}
    </text>
  </motion.g>
);

/* ─── Vertical slide indicator ───────────────────────────────────── */
const SlideIndicator: React.FC<{ total: number; active: number }> = ({ total, active }) => (
  <div
    style={{
      position: 'fixed',
      right: 24,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}
    className="hidden lg:flex"
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 6,
          height: i === active ? 20 : 6,
          borderRadius: 99,
          background: i === active ? C.teal : C.border,
          transition: 'all 0.35s ease',
        }}
      />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════ */
const Navbar: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: scrolled ? 'rgba(247,248,244,0.92)' : 'rgba(247,248,244,0.5)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/assets/medpredict-logo.png" alt="MEDLINK" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ fontFamily: F.serif, fontSize: 17, color: C.text, lineHeight: 1 }}>MEDLINK</div>
            <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: C.teal }}>INTELLIGENT INVENTORY</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ gap: 32, alignItems: 'center' }}>
          {[['Platform', 'slide-1'], ['Intelligence', 'slide-4'], ['How It Works', 'slide-3'], ['About', 'slide-5']].map(([label, id]) => (
            <button
              key={label}
              onClick={() => scrollTo(id)}
              style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 500, color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.teal)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textSoft)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onLogin}
            className="hidden md:block"
            style={{ fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.teal)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textSoft)}
          >
            Login
          </button>
          <button
            onClick={onLogin}
            style={{
              fontFamily: F.sans,
              fontSize: 13,
              fontWeight: 700,
              color: C.white,
              background: C.teal,
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#065f56'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.teal; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            Get Started →
          </button>
          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ height: 2, background: C.text, borderRadius: 2, display: 'block', transition: 'all 0.2s' }} />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ background: C.ivory, borderTop: `1px solid ${C.border}`, padding: '16px 32px 24px' }}
          >
            {[['Platform', 'slide-1'], ['Intelligence', 'slide-4'], ['How It Works', 'slide-3'], ['About', 'slide-5'], ['Login', 'login']].map(([label, id]) => (
              <button
                key={label}
                onClick={() => id === 'login' ? onLogin() : scrollTo(id)}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: F.sans, fontSize: 15, fontWeight: 500, color: C.text, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SLIDE 01 — BRAND INTRODUCTION
══════════════════════════════════════════════════════════════════ */
const Slide01: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const { ref, inView } = useSection();

  return (
    <section
      id="slide-1"
      ref={ref}
      style={{
        minHeight: '100vh',
        background: C.ivory,
        display: 'flex',
        alignItems: 'center',
        padding: '100px 32px 60px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${C.border} 1px, transparent 0)`, backgroundSize: '48px 48px', opacity: 0.25, pointerEvents: 'none' }} />
      {/* Sage shape accent */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, rgba(8,127,115,0.06) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="md:grid-cols-2 grid-cols-1">
        {/* LEFT — copy */}
        <div>
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
            <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: C.teal, marginBottom: 28, textTransform: 'uppercase' }}>
              Intelligent Hospital Inventory
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1}
            style={{ fontFamily: F.serif, fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 1.08, color: C.text, margin: '0 0 8px' }}>
            Smarter medicine.
          </motion.h1>
          <motion.h1 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.2}
            style={{ fontFamily: F.serif, fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 1.08, color: C.text, fontStyle: 'italic', margin: '0 0 28px' }}>
            Better prepared.
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.32}
            style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 1.75, color: C.textSoft, maxWidth: 420, marginBottom: 44 }}>
            MEDLINK connects hospital medicine inventory, demand intelligence, risk prediction and smarter decisions in one system.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.42} style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <button
              onClick={onEnter}
              style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 14, color: C.white, background: C.teal, border: 'none', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#065f56'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(8,127,115,0.22)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.teal; (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
            >
              Explore MEDLINK →
            </button>
            <button
              onClick={() => document.getElementById('slide-2')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 14, color: C.teal, background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '14px 24px', cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.teal; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}
            >
              Discover Intelligence
            </button>
          </motion.div>
        </div>

        {/* RIGHT — pharmacy image + connecting nodes */}
        <motion.div variants={scaleIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.15}
          style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
          {/* SVG annotations layer */}
          <svg
            viewBox="0 0 480 520"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 2 }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* connecting lines */}
            <DrawLine d="M 60 80  L 20 80"  inView={inView} delay={0.6} />
            <DrawLine d="M 60 200 L 20 200" inView={inView} delay={0.72} />
            <DrawLine d="M 420 300 L 460 300" inView={inView} delay={0.84} />
            <DrawLine d="M 240 460 L 240 500" inView={inView} delay={0.96} />
            <DrawLine d="M 420 120 L 460 120" inView={inView} delay={1.08} />
            {/* lavender AI accent */}
            <DrawLine d="M 200 240 Q 280 200 360 260" color={C.lavender} inView={inView} delay={1.2} />
            <Node label="INVENTORY" x={14} y={80} inView={inView} delay={0.65} textAnchor="end" />
            <Node label="DEMAND"    x={14} y={200} inView={inView} delay={0.77} textAnchor="end" />
            <Node label="EXPIRY"    x={466} y={300} inView={inView} delay={0.89} />
            <Node label="RISK"      x={466} y={120} inView={inView} delay={1.01} />
            <Node label="ACTION"   x={240} y={510} inView={inView} delay={1.1} textAnchor="middle" />
          </svg>

          {/* The image */}
          <div style={{ position: 'relative', width: '88%', borderRadius: '24px 24px 64px 24px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(23,35,33,0.13)', zIndex: 1 }}>
            <img
              src="/assets/login-pharmacy-bg.jpg"
              alt="Hospital pharmacy"
              style={{ width: '100%', height: 480, objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            {/* Subtle ivory gradient overlay at bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${C.ivory}55, transparent)` }} />
          </div>

          {/* AI lavender accent badge */}
          <motion.div
            variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.9}
            style={{
              position: 'absolute',
              top: -16,
              right: '4%',
              background: C.lavenderBg,
              border: `1px solid #C4B8FC`,
              borderRadius: 20,
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.lavender, display: 'inline-block' }} />
            <span style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#6B5CEA' }}>AI POWERED</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}
      >
        <div style={{ width: 1, height: 40, background: C.teal }} />
        <div style={{ fontFamily: F.sans, fontSize: 9, letterSpacing: '0.18em', color: C.textSoft }}>SCROLL</div>
      </motion.div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SLIDE 02 — THE REAL-WORLD PROBLEM
══════════════════════════════════════════════════════════════════ */
const Slide02: React.FC = () => {
  const { ref, inView } = useSection();

  return (
    <section
      id="slide-2"
      ref={ref}
      style={{
        minHeight: '100vh',
        background: C.ivoryAlt,
        display: 'flex',
        alignItems: 'center',
        padding: '100px 32px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '55% 1fr', gap: 60, alignItems: 'center' }}>
        {/* LEFT — image with annotations */}
        <motion.div variants={scaleIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1} style={{ position: 'relative' }}>
          <div style={{ position: 'relative', borderRadius: '64px 24px 24px 24px', overflow: 'hidden', boxShadow: '0 20px 56px rgba(23,35,33,0.12)' }}>
            <img
              src="/assets/login-pharmacy-bg.jpg"
              alt="Hospital pharmacy inventory"
              style={{ width: '100%', height: 540, objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 60%, ${C.ivoryAlt}88)` }} />
          </div>

          {/* Annotation 1 — Stock warning */}
          <motion.div
            variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.5}
            style={{
              position: 'absolute',
              top: '18%',
              right: '-24px',
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(23,35,33,0.08)',
              minWidth: 180,
            }}
          >
            <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.warning, marginBottom: 4 }}>STOCK ↓</div>
            <div style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: C.text }}>Paracetamol 500mg</div>
            <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textSoft }}>Demand increasing</div>
            {/* connecting dot */}
            <div style={{ position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: C.warning }} />
          </motion.div>

          {/* Annotation 2 — Expiry warning */}
          <motion.div
            variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.65}
            style={{
              position: 'absolute',
              bottom: '18%',
              right: '-24px',
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(23,35,33,0.08)',
              minWidth: 180,
            }}
          >
            <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.risk, marginBottom: 4 }}>EXPIRY ↑</div>
            <div style={{ fontFamily: F.sans, fontSize: 12, fontWeight: 600, color: C.text }}>Amoxicillin 500mg</div>
            <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textSoft }}>Shelf life decreasing</div>
            <div style={{ position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: C.risk }} />
          </motion.div>
        </motion.div>

        {/* RIGHT — copy */}
        <div>
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
            <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: C.teal, marginBottom: 28, textTransform: 'uppercase' }}>
              The Problem
            </div>
          </motion.div>

          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1}
            style={{ fontFamily: F.serif, fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.1, color: C.text, margin: '0 0 8px' }}>
            When medicine runs out,
          </motion.h2>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.2}
            style={{ fontFamily: F.serif, fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.1, color: C.text, fontStyle: 'italic', margin: '0 0 36px' }}>
            every second matters.
          </motion.h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { color: C.warning, label: 'Shortage Risk', desc: 'Low stock combined with high demand creates critical shortage risk for patients who need these medicines most.' },
              { color: C.risk,    label: 'Expiry Risk',   desc: 'Excess stock with insufficient demand leads to medicine expiry — financial waste and patient safety risk.' },
            ].map(({ color, label, desc }) => (
              <motion.div key={label} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.35}
                style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 3, minHeight: 52, background: color, borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <div style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: F.sans, fontSize: 14, color: C.textSoft, lineHeight: 1.7 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SLIDE 03 — ONE CONNECTED VIEW
══════════════════════════════════════════════════════════════════ */
const Slide03: React.FC = () => {
  const { ref, inView } = useSection();

  const medicines = [
    { name: 'Paracetamol 500mg', stock: 'IN STOCK', stockColor: C.success, demand: 'HIGH DEMAND' },
    { name: 'Amoxicillin 500mg', stock: 'LOW STOCK', stockColor: C.warning, demand: 'MEDIUM DEMAND' },
    { name: 'Ibuprofen 400mg',   stock: 'IN STOCK', stockColor: C.success, demand: 'MEDIUM DEMAND' },
    { name: 'Cefixime 200mg',    stock: 'CRITICAL',  stockColor: C.risk,    demand: 'HIGH DEMAND' },
  ];

  const flowSteps = ['PURCHASE', 'STOCK', 'SALES', 'DEMAND', 'INTELLIGENCE'];

  return (
    <section
      id="slide-3"
      ref={ref}
      style={{ minHeight: '100vh', background: C.ivory, display: 'flex', alignItems: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 64, maxWidth: 600 }}>
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
            <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: C.teal, marginBottom: 24, textTransform: 'uppercase' }}>Connected View</div>
          </motion.div>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 54px)', lineHeight: 1.1, color: C.text, margin: '0 0 8px' }}>
            Every medicine.
          </motion.h2>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.2}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 54px)', lineHeight: 1.1, color: C.text, fontStyle: 'italic', margin: 0 }}>
            One connected view.
          </motion.h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 60, alignItems: 'start' }}>
          {/* Medicine list */}
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.3}
            style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(23,35,33,0.06)' }}>
            {/* List header */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16 }}>
              {['Medicine', 'Stock', 'Demand'].map(h => (
                <div key={h} style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.textSoft, textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {medicines.map((m, i) => (
              <motion.div key={m.name}
                variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.35 + i * 0.08}
                style={{ padding: '18px 24px', borderBottom: i < medicines.length - 1 ? `1px solid ${C.border}` : 'none', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'center' }}>
                <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 500, color: C.text }}>{m.name}</div>
                <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: m.stockColor }}>{m.stock}</div>
                <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: C.textSoft }}>{m.demand}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Flow diagram */}
          <div style={{ paddingTop: 8 }}>
            {flowSteps.map((step, i) => (
              <React.Fragment key={step}>
                <motion.div
                  variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.4 + i * 0.1}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: step === 'INTELLIGENCE' ? C.lavender : C.teal, flexShrink: 0 }} />
                  <div style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: step === 'INTELLIGENCE' ? C.lavender : C.teal }}>
                    {step}
                  </div>
                </motion.div>
                {i < flowSteps.length - 1 && (
                  <motion.div
                    variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.45 + i * 0.1}
                    style={{ width: 1, height: 28, background: i === flowSteps.length - 2 ? C.lavender : C.tealLight, marginLeft: 3.5, opacity: 0.5 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SLIDE 04 — PREDICTIVE INTELLIGENCE
══════════════════════════════════════════════════════════════════ */
const Slide04: React.FC = () => {
  const { ref, inView } = useSection();

  return (
    <section
      id="slide-4"
      ref={ref}
      style={{ minHeight: '100vh', background: C.ivoryAlt, display: 'flex', alignItems: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Lavender background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, rgba(155,138,251,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
            <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: C.lavender, marginBottom: 24, textTransform: 'uppercase' }}>Predictive Intelligence</div>
          </motion.div>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, color: C.text, margin: '0 0 8px' }}>
            It doesn't just track.
          </motion.h2>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.2}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, color: C.text, fontStyle: 'italic', margin: 0 }}>
            It predicts.
          </motion.h2>
        </div>

        {/* Intelligence diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Central AI node */}
          <motion.div variants={scaleIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.3}
            style={{ background: C.white, border: `1.5px solid ${C.teal}`, borderRadius: 16, padding: '16px 32px', textAlign: 'center', boxShadow: '0 8px 32px rgba(8,127,115,0.1)', marginBottom: 0, position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.lavender, marginBottom: 4 }}>MEDLINK AI</div>
            <div style={{ fontFamily: F.serif, fontSize: 18, color: C.text }}>Intelligence Engine</div>
          </motion.div>

          {/* Branching lines */}
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.45}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%', maxWidth: 780, position: 'relative', marginTop: -1 }}>
            <svg viewBox="0 0 780 60" style={{ width: '100%', height: 60, overflow: 'visible' }}>
              <DrawLine d="M 390 0 L 195 58" color={C.teal}    inView={inView} delay={0.5} strokeWidth={1.5} />
              <DrawLine d="M 390 0 L 585 58" color={C.lavender} inView={inView} delay={0.5} strokeWidth={1.5} />
            </svg>
          </motion.div>

          {/* Two branches */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, width: '100%', maxWidth: 780, marginTop: -8 }}>
            {/* Shortage risk */}
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.6}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(23,35,33,0.06)' }}>
              <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.risk, marginBottom: 12, textTransform: 'uppercase' }}>Shortage Risk</div>
              <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Paracetamol 500mg</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ fontFamily: F.sans, fontSize: 22, fontWeight: 800, color: C.risk }}>87%</div>
                <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.white, background: C.risk, borderRadius: 6, padding: '3px 8px' }}>HIGH</div>
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 10, color: C.textSoft, marginBottom: 6, fontStyle: 'italic' }}>Illustrative scenario</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['LOW STOCK', 'HIGH DEMAND', 'LONG LEAD TIME'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.risk }} />
                    <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.textSoft }}>{f}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Expiry risk */}
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.7}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(23,35,33,0.06)' }}>
              <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.warning, marginBottom: 12, textTransform: 'uppercase' }}>Expiry Risk</div>
              <div style={{ fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>Amoxicillin 500mg</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ fontFamily: F.sans, fontSize: 22, fontWeight: 800, color: C.warning }}>62%</div>
                <div style={{ fontFamily: F.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: C.white, background: C.warning, borderRadius: 6, padding: '3px 8px' }}>MEDIUM</div>
              </div>
              <div style={{ fontFamily: F.sans, fontSize: 10, color: C.textSoft, marginBottom: 6, fontStyle: 'italic' }}>Illustrative scenario</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['LOW DEMAND', 'HIGH STOCK', '34 DAYS TO EXPIRY'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.warning }} />
                    <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: C.textSoft }}>{f}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SLIDE 05 — FROM PREDICTION TO ACTION
══════════════════════════════════════════════════════════════════ */
const Slide05: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const { ref, inView } = useSection();

  const branch1 = ['MEDLINK INTELLIGENCE', 'SHORTAGE RISK: HIGH', 'DEMAND INCREASING', 'RECOMMENDATION', 'INCREASE REORDER'];
  const branch2 = ['EXPIRY RISK: HIGH', 'DEMAND DECREASING', 'RECOMMENDATION', 'PRIORITIZE FEFO'];

  const stepColor = (step: string) => {
    if (step.includes('RISK')) return C.risk;
    if (step.includes('RECOMMENDATION')) return C.teal;
    if (step.includes('INTELLIGENCE')) return C.lavender;
    if (step.includes('REORDER') || step.includes('FEFO')) return C.success;
    return C.textSoft;
  };

  return (
    <section
      id="slide-5"
      ref={ref}
      style={{ minHeight: '100vh', background: C.ivory, display: 'flex', alignItems: 'center', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <motion.div variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0}>
            <div style={{ fontFamily: F.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: C.teal, marginBottom: 24, textTransform: 'uppercase' }}>From Prediction to Action</div>
          </motion.div>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.1}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, color: C.text, margin: '0 0 8px' }}>
            From prediction.
          </motion.h2>
          <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.2}
            style={{ fontFamily: F.serif, fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1, color: C.text, fontStyle: 'italic', margin: 0 }}>
            To action.
          </motion.h2>
        </div>

        {/* Two branches */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 900, margin: '0 auto 72px' }}>
          {[{ steps: branch1, delay: 0.3 }, { steps: branch2, delay: 0.45 }].map(({ steps, delay }, bi) => (
            <div key={bi}>
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <motion.div
                    variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={delay + i * 0.08}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: delay + i * 0.08 + 0.1, duration: 0.3, ease: 'backOut' }}
                      style={{ width: 10, height: 10, borderRadius: '50%', background: stepColor(step), flexShrink: 0 }}
                    />
                    <div style={{ fontFamily: F.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: stepColor(step) }}>
                      {step}
                    </div>
                  </motion.div>
                  {i < steps.length - 1 && (
                    <motion.div
                      variants={fadeIn} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={delay + i * 0.08 + 0.05}
                      style={{ width: 1, height: 32, background: C.border, marginLeft: 4.5, opacity: 0.7 }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>

        {/* Closing statement + CTA */}
        <div style={{ textAlign: 'center' }}>
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.8}
            style={{ fontFamily: F.serif, fontSize: 'clamp(24px, 3vw, 38px)', color: C.text, marginBottom: 16 }}>
            "Know before it becomes a problem."
          </motion.div>
          <motion.p variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={0.9}
            style={{ fontFamily: F.sans, fontSize: 15, color: C.textSoft, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.75 }}>
            MEDLINK transforms hospital inventory data into proactive decisions.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={1.0}>
            <button
              onClick={onEnter}
              style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 14, color: C.white, background: C.teal, border: 'none', borderRadius: 12, padding: '16px 36px', cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#065f56'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(8,127,115,0.22)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.teal; (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
            >
              Explore MEDLINK →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════════ */
const Footer: React.FC = () => (
  <footer style={{ borderTop: `1px solid ${C.border}`, background: C.white, padding: '28px 32px' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/assets/medpredict-logo.png" alt="MEDLINK" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
        <span style={{ fontFamily: F.serif, fontSize: 14, color: C.text }}>MEDLINK</span>
        <span style={{ fontFamily: F.sans, fontSize: 11, color: C.textSoft }}>— Intelligent Hospital Medicine Inventory</span>
      </div>
      <span style={{ fontFamily: F.sans, fontSize: 11, color: C.textSoft }}>React 18 · FastAPI · Python · Tailwind CSS</span>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════════ */
export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Track active slide for indicator
  useEffect(() => {
    const slides = [1, 2, 3, 4, 5].map(n => document.getElementById(`slide-${n}`));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            const idx = parseInt(id.replace('slide-', '')) - 1;
            setActiveSlide(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    slides.forEach(s => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Global landing-page styles */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        html { scroll-behavior: smooth; }
        #slide-1, #slide-2, #slide-3, #slide-4, #slide-5 {
          scroll-snap-align: start;
        }
        .medlink-landing { scroll-snap-type: y proximity; }
        /* Make two-column grids stack on mobile */
        @media (max-width: 767px) {
          #slide-1 > div > div,
          #slide-2 > div > div,
          #slide-3 > div > div,
          #slide-4 > div > div { grid-template-columns: 1fr !important; }
          #slide-2 > div > div > div:first-child { order: 2; }
        }
      `}</style>

      <div ref={containerRef} className="medlink-landing" style={{ fontFamily: F.sans, background: C.ivory }}>
        <Navbar onLogin={onEnter} />
        <SlideIndicator total={5} active={activeSlide} />
        <Slide01 onEnter={onEnter} />
        <Slide02 />
        <Slide03 />
        <Slide04 />
        <Slide05 onEnter={onEnter} />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
