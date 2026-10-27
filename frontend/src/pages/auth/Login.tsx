import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@medlink.health');
  const [password, setPassword] = useState('AdminPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Check stored user role to route dynamically
      const savedUser = localStorage.getItem('medpredict_auth_user');
      const userObj = savedUser ? JSON.parse(savedUser) : null;
      const role = userObj?.role || 'HOSPITAL_ADMIN';

      if (role === 'HOSPITAL_ADMIN') {
        navigate('/admin');
      } else if (role === 'PHARMACY_MANAGER') {
        navigate('/manager');
      } else {
        navigate('/pharmacist');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSelect = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#172321] selection:bg-[#5BAFA3]/20 selection:text-[#087F73] flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden font-barlow">
      {/* =========================================================================
          LEFT SECTION (approx 42% on desktop) — FULL-BLEED EDITORIAL PHARMACY BACKGROUND
          ========================================================================= */}
      <div className="w-full lg:w-[42%] relative flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden min-h-[500px] lg:min-h-full">
        {/* Layer 0: Full-Bleed Background Image covering the entire left panel */}
        <div
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage:
              "url('https://plus.unsplash.com/premium_photo-1661770294094-06167872e079?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Layer 1: Light ivory overlay (rgba(247, 248, 244, 0.25)) */}
        <div
          className="absolute inset-0 z-1 pointer-events-none"
          style={{
            backgroundColor: 'rgba(247, 248, 244, 0.25)',
          }}
        />

        {/* Layer 2: All Content above the image */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          {/* Top-Left: MEDLINK Official Logo & Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-xs hover:bg-white transition-all group focus:outline-none"
            >
              <img
                src="/assets/medpredict-logo.png"
                alt="MEDLINK Logo"
                className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-instrument italic text-xl font-medium tracking-tight text-[#172321] leading-none">
                  MEDLINK
                </span>
                <span className="text-[8.5px] uppercase tracking-[0.2em] text-[#667572] font-semibold mt-0.5">
                  Hospital Intelligence
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Spacer to push tagline to the bottom */}
          <div className="my-auto" />

          {/* Lower-Left: Editorial Brand Heading & Supporting Text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2 pt-4"
          >
            <div className="space-y-0.5">
              <h2 className="font-instrument text-4xl sm:text-5xl font-normal text-[#172321] tracking-tight leading-[1.08] drop-shadow-xs">
                Smarter <span className="italic font-normal text-[#087F73]">medicine.</span>
              </h2>
              <h2 className="font-instrument text-4xl sm:text-5xl font-normal text-[#172321] tracking-tight leading-[1.08] drop-shadow-xs">
                Better <span className="italic font-normal">prepared.</span>
              </h2>
            </div>

            <p className="text-sm font-medium text-[#172321]/90 max-w-sm pt-1 leading-relaxed">
              Connecting hospital inventory to smarter decisions.
            </p>

            <div className="text-[10px] text-[#172321]/70 font-medium pt-2 hidden sm:block">
              MEDLINK Clinical Telemetry &bull; Version 2.0 &bull; Multi-Pharmacy Engine
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SECTION (approx 58% on desktop) — CLEAN FLOATING LOGIN FORM
          ========================================================================= */}
      <div className="w-full lg:w-[58%] bg-[#F7F8F4] lg:bg-white flex flex-col justify-center items-center p-8 sm:p-14 lg:p-20 overflow-y-auto">
        <div className="max-w-md w-full my-auto space-y-8">
          {/* Header Area */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest text-[#087F73] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F73]" />
              <span>MEDLINK Workspace</span>
            </div>

            <h2 className="font-instrument text-4xl sm:text-5xl font-normal text-[#172321] tracking-tight leading-[1.1]">
              Welcome <span className="italic font-normal text-[#087F73]">back.</span>
            </h2>

            <p className="text-sm text-[#667572] font-normal leading-relaxed">
              Sign in to continue managing smarter hospital inventory.
            </p>
          </motion.div>

          {/* Error Message Box if needed */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#E56B6F]/10 border border-[#E56B6F]/25 text-[#E56B6F] text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* The Form Fields */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172321]">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-[54px] px-4 bg-white border border-[#DCE5E1] rounded-xl text-sm text-[#172321] placeholder-[#667572]/60 transition-all duration-200 focus:outline-none focus:border-[#087F73] focus:ring-3 focus:ring-[#087F73]/10"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172321]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[54px] pl-4 pr-12 bg-white border border-[#DCE5E1] rounded-xl text-sm text-[#172321] placeholder-[#667572]/60 transition-all duration-200 focus:outline-none focus:border-[#087F73] focus:ring-3 focus:ring-[#087F73]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#667572] hover:text-[#172321] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#667572] hover:text-[#172321]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DCE5E1] text-[#087F73] focus:ring-[#087F73] focus:ring-offset-0 cursor-pointer accent-[#087F73]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions have been dispatched to your verified clinical email.')}
                className="text-[#087F73] hover:underline font-medium focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button with Framer Motion hover & micro-interaction */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="w-full h-[56px] mt-2 rounded-xl bg-[#087F73] hover:bg-[#06655C] disabled:bg-[#5BAFA3]/50 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Security Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-center justify-center gap-1.5 text-xs text-[#667572] pt-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#5BAFA3]" />
            <span>Secure access to your MEDLINK workspace.</span>
          </motion.div>

          {/* Quick Demo Access Bar (Subtle & Clinical) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="pt-6 border-t border-[#172321]/8 space-y-3"
          >
            <div className="text-[11px] font-semibold text-[#667572] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#087F73]" />
              <span>Select Clinical Role for Demo:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('admin@medlink.health', 'AdminPassword123!')}
                className={`px-3 py-2 text-[11px] font-semibold rounded-xl border transition-all text-center ${email.includes('admin')
                    ? 'bg-[#EEF3F0] border-[#087F73] text-[#087F73]'
                    : 'bg-white hover:bg-[#F7F8F4] border-[#DCE5E1] text-[#172321]'
                  }`}
              >
                Hospital Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('manager@medlink.health', 'ManagerPassword123!')}
                className={`px-3 py-2 text-[11px] font-semibold rounded-xl border transition-all text-center ${email.includes('manager')
                    ? 'bg-[#EEF3F0] border-[#087F73] text-[#087F73]'
                    : 'bg-white hover:bg-[#F7F8F4] border-[#DCE5E1] text-[#172321]'
                  }`}
              >
                Pharmacy Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('pharmacist@medlink.health', 'PharmacistPassword123!')}
                className={`px-3 py-2 text-[11px] font-semibold rounded-xl border transition-all text-center ${email.includes('pharmacist')
                    ? 'bg-[#EEF3F0] border-[#087F73] text-[#087F73]'
                    : 'bg-white hover:bg-[#F7F8F4] border-[#DCE5E1] text-[#172321]'
                  }`}
              >
                Pharmacist
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;