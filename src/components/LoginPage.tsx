import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, AlertCircle, Loader2 } from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
export type UserRole = 'HOSPITAL_ADMIN' | 'PHARMACY_MANAGER' | 'PHARMACIST';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

interface LoginError {
  field?: 'email' | 'password' | 'general';
  message: string;
}

/* ─── Connecting-node label positions (relative to image) ────────── */
const NODES = [
  { id: 'inventory',    label: 'INVENTORY',    top: '12%',  left: '-22%', lineX2: 0,   lineY2: 36 },
  { id: 'demand',       label: 'DEMAND',       top: '38%',  left: '-26%', lineX2: 0,   lineY2: 100 },
  { id: 'expiry',       label: 'EXPIRY',       top: '68%',  right: '-24%', lineX2: 100, lineY2: 140 },
  { id: 'intelligence', label: 'INTELLIGENCE', top: '88%',  left: '18%',  lineX2: 40,  lineY2: 220 },
] as const;

/* ─── Email validation ───────────────────────────────────────────── */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ─── Login API call ─────────────────────────────────────────────── */
async function attemptLogin(
  email: string,
  password: string
): Promise<{ role: UserRole; token: string }> {
  const res = await fetch(
    (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail || 'Invalid email or password.');
  }
  return res.json();
}

/* ─── NODE LABEL COMPONENT ──────────────────────────────────────── */
const NodeLabel: React.FC<{
  label: string;
  style: React.CSSProperties;
  delay: number;
}> = ({ label, style, delay }) => (
  <div
    className="medlink-node-label"
    style={{ ...style, animationDelay: `${delay}ms` }}
  >
    <span className="medlink-node-dot" />
    <span className="medlink-node-text">{label}</span>
  </div>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginError[]>([]);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  /* Trigger entrance animations */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* Focus email on mount */
  useEffect(() => {
    if (mounted) emailRef.current?.focus();
  }, [mounted]);

  /* ── Validation ── */
  function validate(): LoginError[] {
    const errs: LoginError[] = [];
    if (!email.trim()) {
      errs.push({ field: 'email', message: 'Email address is required.' });
    } else if (!isValidEmail(email)) {
      errs.push({ field: 'email', message: 'Please enter a valid email address.' });
    }
    if (!password) {
      errs.push({ field: 'password', message: 'Password is required.' });
    } else if (password.length < 6) {
      errs.push({ field: 'password', message: 'Password must be at least 6 characters.' });
    }
    return errs;
  }

  function fieldError(field: 'email' | 'password'): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function generalError(): string | undefined {
    return errors.find((e) => e.field === 'general')?.message;
  }

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setLoading(true);

    try {
      const { role } = await attemptLogin(email, password);
      onLoginSuccess(role);
    } catch (err: any) {
      setErrors([
        {
          field: 'general',
          message: err?.message || 'Authentication failed. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Scoped styles (no Framer Motion, pure CSS) ── */}
      <style>{`
        /* ── Reduced-motion preference ── */
        @media (prefers-reduced-motion: reduce) {
          .ml-fade-up, .ml-fade-in, .ml-scale-in,
          .medlink-node-label, .ml-field { animation: none !important; opacity: 1 !important; transform: none !important; }
        }

        /* ── Entrance animations ── */
        @keyframes ml-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ml-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ml-scaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ml-nodeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ml-lineDraw {
          from { stroke-dashoffset: 80; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }

        .ml-fade-up  { animation: ml-fadeUp  0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .ml-fade-in  { animation: ml-fadeIn  0.55s ease both; }
        .ml-scale-in { animation: ml-scaleIn 0.7s  cubic-bezier(0.22,1,0.36,1) both; }
        .ml-field    { animation: ml-fadeUp  0.5s  cubic-bezier(0.22,1,0.36,1) both; }

        /* ── Node labels ── */
        .medlink-node-label {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: ml-nodeIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .medlink-node-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #087F73;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(8,127,115,0.15);
        }
        .medlink-node-text {
          font-family: 'Barlow', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #667572;
          white-space: nowrap;
        }

        /* ── SVG connecting lines ── */
        .medlink-line {
          stroke: #5BAFA3;
          stroke-width: 1;
          fill: none;
          stroke-dasharray: 80;
          animation: ml-lineDraw 0.9s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Input focus ring ── */
        .medlink-input:focus {
          outline: none;
          border-color: #087F73;
          box-shadow: 0 0 0 3px rgba(8,127,115,0.12);
        }
        .medlink-input.has-error {
          border-color: #E56B6F;
        }
        .medlink-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(229,107,111,0.12);
        }

        /* ── Sign-in button hover ── */
        .medlink-btn {
          transition: background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }
        .medlink-btn:hover:not(:disabled) {
          background-color: #06655B;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(8,127,115,0.25);
        }
        .medlink-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .medlink-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ── Lavender AI accent node ── */
        .medlink-ai-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9B8AFB;
          box-shadow: 0 0 0 3px rgba(155,138,251,0.15);
        }

        /* ── Checkbox custom ── */
        .medlink-checkbox {
          accent-color: #087F73;
          width: 16px;
          height: 16px;
          cursor: pointer;
          border-radius: 4px;
        }
      `}</style>

      <div
        className="min-h-screen flex"
        style={{ background: '#F7F8F4', fontFamily: "'Barlow', sans-serif" }}
      >
        {/* ════════════════════════════════════════════════════════════
            LEFT — BRAND VISUAL  (~42%)
        ════════════════════════════════════════════════════════════ */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: '42%',
            minWidth: 360,
            background: '#F7F8F4',
            borderRight: '1px solid #DCE5E1',
            padding: '40px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* ── Logo & wordmark ── */}
          <div
            className={`flex items-center gap-3 ${mounted ? 'ml-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0ms' }}
          >
            <img
              src="/assets/medpredict-logo.png"
              alt="MEDLINK"
              style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 18,
                  color: '#172321',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                MEDLINK
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#087F73',
                }}
              >
                WORKSPACE
              </div>
            </div>
          </div>

          {/* ── Editorial heading ── */}
          <div
            className={mounted ? 'ml-fade-up' : 'opacity-0'}
            style={{ animationDelay: '100ms', marginTop: 52 }}
          >
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(32px, 3.5vw, 46px)',
                lineHeight: 1.12,
                color: '#172321',
                margin: 0,
              }}
            >
              Smarter medicine.
            </h1>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(32px, 3.5vw, 46px)',
                lineHeight: 1.12,
                color: '#172321',
                fontStyle: 'italic',
                margin: '4px 0 0',
              }}
            >
              Better prepared.
            </h1>
            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                color: '#667572',
                lineHeight: 1.65,
                maxWidth: 300,
              }}
            >
              Connecting hospital inventory to smarter decisions.
            </p>
          </div>

          {/* ── Pharmacy image with connecting nodes ── */}
          <div
            className={mounted ? 'ml-scale-in' : 'opacity-0'}
            style={{
              animationDelay: '200ms',
              position: 'relative',
              marginTop: 40,
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            {/* Image container */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 340,
                marginLeft: 24,
              }}
            >
              {/* SVG connecting lines — drawn behind image */}
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                  overflow: 'visible',
                }}
                viewBox="0 0 340 300"
                preserveAspectRatio="none"
              >
                {/* INVENTORY line */}
                <line
                  className="medlink-line"
                  x1="30" y1="36" x2="-28" y2="36"
                  style={{ animationDelay: '500ms' }}
                />
                {/* DEMAND line */}
                <line
                  className="medlink-line"
                  x1="30" y1="114" x2="-32" y2="114"
                  style={{ animationDelay: '620ms' }}
                />
                {/* EXPIRY line */}
                <line
                  className="medlink-line"
                  x1="310" y1="204" x2="368" y2="204"
                  style={{ animationDelay: '740ms' }}
                />
                {/* INTELLIGENCE line (angled) */}
                <line
                  className="medlink-line"
                  x1="100" y1="264" x2="100" y2="310"
                  style={{ animationDelay: '860ms' }}
                />
                {/* Lavender AI accent */}
                <circle cx="170" cy="144" r="4" fill="#9B8AFB" opacity="0.35"
                  style={{ animationDelay: '900ms' }} />
                <circle cx="280" cy="60" r="3" fill="#9B8AFB" opacity="0.25"
                  style={{ animationDelay: '950ms' }} />
              </svg>

              {/* The pharmacy image */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 300,
                  backgroundImage: 'url("https://i.pinimg.com/236x/cc/a3/15/cca3151fe08b628b77d6b83fd58a70b0.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '20px 20px 60px 20px',
                  boxShadow: '0 16px 40px rgba(23,35,33,0.12)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(247, 248, 244, 0.25)',
                  }}
                />
              </div>

              {/* ── Node labels ── */}
              {/* INVENTORY — top-left outside */}
              <NodeLabel
                label="INVENTORY"
                style={{ top: '8%', left: '-108px', animationDelay: '500ms', zIndex: 3 }}
                delay={500}
              />
              {/* DEMAND — mid-left outside */}
              <NodeLabel
                label="DEMAND"
                style={{ top: '35%', left: '-104px', animationDelay: '620ms', zIndex: 3 }}
                delay={620}
              />
              {/* EXPIRY — mid-right outside */}
              <NodeLabel
                label="EXPIRY"
                style={{ top: '65%', right: '-90px', flexDirection: 'row-reverse', animationDelay: '740ms', zIndex: 3 }}
                delay={740}
              />
              {/* INTELLIGENCE — bottom inside */}
              <NodeLabel
                label="INTELLIGENCE"
                style={{ bottom: '-38px', left: '12%', animationDelay: '860ms', zIndex: 3 }}
                delay={860}
              />

              {/* Lavender AI accent badge */}
              <div
                style={{
                  position: 'absolute',
                  top: -14,
                  right: -14,
                  background: '#EEEAFE',
                  border: '1px solid #C4B8FC',
                  borderRadius: 20,
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  zIndex: 4,
                  opacity: mounted ? 1 : 0,
                  transition: 'opacity 0.5s ease 0.8s',
                }}
              >
                <span className="medlink-ai-dot" />
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#6B5CEA' }}>
                  AI POWERED
                </span>
              </div>
            </div>
          </div>

          {/* ── Bottom caption ── */}
          <div
            className={mounted ? 'ml-fade-in' : 'opacity-0'}
            style={{
              animationDelay: '400ms',
              marginTop: 56,
              paddingTop: 20,
              borderTop: '1px solid #DCE5E1',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FA66B', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: '#667572', fontWeight: 500 }}>
              Serving hospitals across India &mdash; Real-time inventory intelligence
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT — LOGIN FORM  (~58%)
        ════════════════════════════════════════════════════════════ */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(32px, 6vw, 80px) clamp(24px, 7vw, 88px)',
            minHeight: '100vh',
          }}
        >
          {/* Mobile-only logo */}
          <div
            className={`flex md:hidden items-center gap-3 mb-8 ${mounted ? 'ml-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0ms' }}
          >
            <img
              src="/assets/medpredict-logo.png"
              alt="MEDLINK"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }}
            />
            <div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: '#172321' }}>
                MEDLINK
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#087F73' }}>
                WORKSPACE
              </div>
            </div>
          </div>

          {/* ── WORKSPACE label ── */}
          <div
            className={mounted ? 'ml-fade-in' : 'opacity-0'}
            style={{
              animationDelay: '80ms',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#087F73',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            MEDLINK WORKSPACE
          </div>

          {/* ── Heading ── */}
          <div
            className={mounted ? 'ml-fade-up' : 'opacity-0'}
            style={{ animationDelay: '140ms' }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(32px, 4vw, 48px)',
                lineHeight: 1.1,
                color: '#172321',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Welcome back.
            </h2>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: '#667572',
                lineHeight: 1.65,
                maxWidth: 380,
              }}
            >
              Sign in to continue managing smarter hospital inventory.
            </p>
          </div>

          {/* ── Divider ── */}
          <div
            className={mounted ? 'ml-fade-in' : 'opacity-0'}
            style={{
              animationDelay: '200ms',
              height: 1,
              background: '#DCE5E1',
              margin: '28px 0',
              maxWidth: 480,
            }}
          />

          {/* ── General error banner ── */}
          {generalError() && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 16px',
                background: '#FFF5F5',
                border: '1px solid #FCA5A5',
                borderRadius: 10,
                marginBottom: 20,
                maxWidth: 480,
              }}
              role="alert"
            >
              <AlertCircle style={{ width: 16, height: 16, color: '#E56B6F', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#C53030', lineHeight: 1.5 }}>
                {generalError()}
              </span>
            </div>
          )}

          {/* ── Form ── */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ maxWidth: 480, width: '100%' }}
            aria-label="MEDLINK sign-in form"
          >
            {/* Email */}
            <div
              className={mounted ? 'ml-field' : 'opacity-0'}
              style={{ animationDelay: '260ms', marginBottom: 20 }}
            >
              <label
                htmlFor="medlink-email"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#172321',
                  letterSpacing: '0.02em',
                  marginBottom: 8,
                }}
              >
                Email address
              </label>
              <input
                id="medlink-email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.some((er) => er.field === 'email')) {
                    setErrors((prev) => prev.filter((er) => er.field !== 'email'));
                  }
                }}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                aria-invalid={!!fieldError('email')}
                aria-describedby={fieldError('email') ? 'medlink-email-err' : undefined}
                className={`medlink-input ${fieldError('email') ? 'has-error' : ''}`}
                style={{
                  width: '100%',
                  height: 54,
                  padding: '0 16px',
                  fontSize: 14,
                  color: '#172321',
                  background: '#FFFFFF',
                  border: `1.5px solid ${fieldError('email') ? '#E56B6F' : '#DCE5E1'}`,
                  borderRadius: 12,
                  fontFamily: "'Barlow', sans-serif",
                  boxSizing: 'border-box',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                }}
              />
              {fieldError('email') && (
                <p
                  id="medlink-email-err"
                  role="alert"
                  style={{ marginTop: 6, fontSize: 12, color: '#E56B6F', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <AlertCircle style={{ width: 13, height: 13 }} />
                  {fieldError('email')}
                </p>
              )}
            </div>

            {/* Password */}
            <div
              className={mounted ? 'ml-field' : 'opacity-0'}
              style={{ animationDelay: '320ms', marginBottom: 20 }}
            >
              <label
                htmlFor="medlink-password"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#172321',
                  letterSpacing: '0.02em',
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="medlink-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.some((er) => er.field === 'password')) {
                      setErrors((prev) => prev.filter((er) => er.field !== 'password'));
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  aria-invalid={!!fieldError('password')}
                  aria-describedby={fieldError('password') ? 'medlink-pw-err' : undefined}
                  className={`medlink-input ${fieldError('password') ? 'has-error' : ''}`}
                  style={{
                    width: '100%',
                    height: 54,
                    padding: '0 48px 0 16px',
                    fontSize: 14,
                    color: '#172321',
                    background: '#FFFFFF',
                    border: `1.5px solid ${fieldError('password') ? '#E56B6F' : '#DCE5E1'}`,
                    borderRadius: 12,
                    fontFamily: "'Barlow', sans-serif",
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: '#667572',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 17, height: 17 }} />
                  ) : (
                    <Eye style={{ width: 17, height: 17 }} />
                  )}
                </button>
              </div>
              {fieldError('password') && (
                <p
                  id="medlink-pw-err"
                  role="alert"
                  style={{ marginTop: 6, fontSize: 12, color: '#E56B6F', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <AlertCircle style={{ width: 13, height: 13 }} />
                  {fieldError('password')}
                </p>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div
              className={mounted ? 'ml-field' : 'opacity-0'}
              style={{
                animationDelay: '360ms',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="medlink-checkbox"
                />
                <span style={{ fontSize: 13, color: '#667572' }}>Remember me</span>
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#087F73',
                  fontFamily: "'Barlow', sans-serif",
                  padding: 0,
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign-in button */}
            <div
              className={mounted ? 'ml-field' : 'opacity-0'}
              style={{ animationDelay: '420ms' }}
            >
              <button
                id="medlink-signin-btn"
                type="submit"
                disabled={loading}
                className="medlink-btn"
                style={{
                  width: '100%',
                  height: 56,
                  background: '#087F73',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  fontFamily: "'Barlow', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
                aria-live="polite"
              >
                {loading ? (
                  <>
                    <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} />
                    SIGNING IN...
                  </>
                ) : (
                  'SIGN IN →'
                )}
              </button>
            </div>
          </form>

          {/* ── Secure access caption ── */}
          <div
            className={mounted ? 'ml-fade-in' : 'opacity-0'}
            style={{
              animationDelay: '500ms',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 20,
              maxWidth: 480,
            }}
          >
            <Lock style={{ width: 13, height: 13, color: '#667572', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#667572' }}>
              Secure access to your MEDLINK workspace.
            </span>
          </div>

          {/* ── Auth note ── */}
          <div
            className={mounted ? 'ml-fade-in' : 'opacity-0'}
            style={{
              animationDelay: '560ms',
              marginTop: 40,
              maxWidth: 480,
              padding: '12px 16px',
              background: '#F7F8F4',
              border: '1px solid #DCE5E1',
              borderRadius: 10,
            }}
          >
            <p style={{ fontSize: 12, color: '#667572', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#172321' }}>Backend note:</strong> Authentication requires the
              FastAPI backend running at{' '}
              <code style={{ fontSize: 11, background: '#EEEAFE', padding: '1px 5px', borderRadius: 4, color: '#6B5CEA' }}>
                /api/auth/login
              </code>
              . Start the backend to enable sign-in.
            </p>
          </div>
        </div>
      </div>

      {/* Spin keyframe for Loader icon */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default LoginPage;
