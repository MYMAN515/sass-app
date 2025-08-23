// components/HeroSection.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * HeroSection — Improved Performance & Accessibility
 * - Optimized animations and reduced motion support
 * - Better component organization and reusability
 * - Enhanced accessibility features
 * - Performance optimizations
 */

// Animation variants for consistency
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HeroSection() {
  return (
    <section 
      className="relative w-full overflow-hidden font-sans text-black dark:text-white"
      role="main"
      aria-label="Hero section"
    >
      <BackgroundFX />
      <TopHero />
      <LogoMarquee />
      <ProofMetrics />
      <ValueProps />
      <HowItWorks />
      <HumorBreak />
      <TestimonialsTicker />
      <BottomCTA />
      <StickyMobileCTA />
    </section>
  );
}

/* ------------------------------ Top Section -------------------------------- */

function TopHero() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div 
      ref={ref}
      className="relative z-10 px-6 md:px-12 lg:px-20 pt-24 pb-16 lg:pt-28 lg:pb-24"
      variants={prefersReducedMotion ? {} : staggerContainer}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
    >
      <div className="mx-auto max-w-6xl">
        {/* Badge + micro subtext */}
        <motion.div 
          className="mb-6 flex flex-wrap items-center gap-2"
          variants={prefersReducedMotion ? {} : fadeInUp}
        >
          <Badge>STARTUP SERIOUS • TASTEFULLY FUN</Badge>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-300">
            Clarity • Speed • Conversion-first
          </span>
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left copy */}
          <motion.div variants={prefersReducedMotion ? {} : fadeInUp}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Turn{' '}
              <GradientText>product photos</GradientText>{' '}
              into sales—<span className="whitespace-nowrap">no studio needed.</span>
            </h1>

            <p className="mt-4 max-w-xl text-lg md:text-xl text-zinc-700 dark:text-zinc-300">
              Upload a photo → get on-brand, studio-grade shots and AI try-ons in seconds.
              It's like hiring a photo team—minus the coffee drama.
            </p>

            {/* Micro commitments */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <Chip>No credit card</Chip>
              <Chip>Free starter credits</Chip>
              <Chip>Cancel anytime</Chip>
            </div>

            {/* CTAs + Email capture */}
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <MagneticCTA href="/dashboard" ariaLabel="Get started for free">
                Get started free
              </MagneticCTA>
              <SecondaryButton href="#demo">
                Watch 30s demo
              </SecondaryButton>
            </div>

            <EarlyEmailCapture />
            <TrustBar />
          </motion.div>

          {/* Right: Interactive Compare */}
          <motion.div
            id="demo"
            variants={prefersReducedMotion ? {} : {
              initial: { opacity: 0, scale: 0.97 },
              animate: { opacity: 1, scale: 1 },
              transition: { duration: 0.6, delay: 0.2 }
            }}
            className="relative isolate mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-violet-200/70 bg-white/85 shadow-[0_18px_80px_-18px_rgba(109,40,217,.28),0_2px_0_0_rgba(124,58,237,.08)_inset] ring-1 ring-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            aria-label="Before and after preview"
          >
            <GradientRing />
            <CompareSlider
              before={{ src: '/demo-before.jpg', alt: 'Original product photo before enhancement' }}
              after={{ src: '/demo-after.jpg', alt: 'Enhanced product photo after AI processing' }}
              defaultPercent={62}
              showLabels
            />
            <CornerBadge />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <ScrollHint />
      </div>
    </motion.div>
  );
}

/* -------------------------------- Reusable Components -------------------------------- */

const Badge = ({ children, className = "" }) => (
  <span className={`rounded-full border border-violet-200/60 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-1 text-[11px] font-medium shadow-[0_1px_0_0_rgba(109,40,217,.10)] backdrop-blur-md ${className}`}>
    {children}
  </span>
);

const GradientText = ({ children, className = "" }) => (
  <span className={`bg-[linear-gradient(120deg,#7c3aed_0%,#a855f7_35%,#c084fc_65%,#e879f9_100%)] bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

const Chip = ({ children, className = "" }) => (
  <span className={`rounded-full border border-violet-200/60 bg-white/85 px-3 py-1 text-zinc-700 shadow-[0_1px_0_0_rgba(109,40,217,.08)] dark:border-white/15 dark:bg-white/10 dark:text-zinc-300 ${className}`}>
    {children}
  </span>
);

const SecondaryButton = ({ href, children, className = "", ...props }) => (
  <Link
    href={href}
    className={`inline-flex items-center justify-center rounded-xl border border-violet-200/70 bg-white/80 px-5 py-3 text-base font-semibold text-zinc-900 shadow-[0_6px_28px_-12px_rgba(109,40,217,.18)] backdrop-blur-md transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-white/15 dark:bg-white/10 dark:text-white ${className}`}
    {...props}
  >
    {children}
  </Link>
);

const ScrollHint = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="pointer-events-none mt-10 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
      <span className={prefersReducedMotion ? '' : 'motion-safe:animate-bounce'}>
        Scroll to see the magic ↓
      </span>
    </div>
  );
};

/* -------------------------------- Background -------------------------------- */

function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-20">
      {/* Light theme background */}
      <div className="h-full w-full bg-[radial-gradient(75%_100%_at_50%_0%,#f8f6ff_0%,#ffffff_38%,#fbf7ff_100%)] dark:hidden" />
      <GridPattern className="dark:hidden opacity-[0.12]" />
      
      {/* Dark theme background */}
      <div className="hidden h-full w-full dark:block bg-[radial-gradient(120%_80%_at_60%_-10%,#2a115b_0%,#0b0519_60%,#070312_100%)]" />
      <GridPattern className="hidden dark:block opacity-[0.20]" isDark />
      
      <NoiseTexture />
      <AuroraBlobs />
      <FloatingShapes />
    </div>
  );
}

const GridPattern = ({ className = "", isDark = false }) => (
  <div 
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage: `linear-gradient(to right, ${isDark ? 'rgba(255,255,255,.05)' : 'rgba(109,40,217,.08)'} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? 'rgba(255,255,255,.05)' : 'rgba(109,40,217,.08)'} 1px, transparent 1px)`,
      backgroundSize: isDark ? '24px 24px' : '22px 22px'
    }}
  />
);

const NoiseTexture = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
    style={{
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.4'/></svg>")`,
    }}
  />
);

function AuroraBlobs() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const blobVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 0.55, scale: 1 },
    transition: { duration: 1.0 }
  };

  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        variants={prefersReducedMotion ? {} : blobVariants}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        className="absolute -top-24 left-[-12%] h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background: 'conic-gradient(from 90deg, rgba(124,58,237,.28), rgba(168,85,247,.26), rgba(192,132,252,.24))',
          filter: 'blur(80px)',
        }}
      />
      <motion.div
        variants={prefersReducedMotion ? {} : {
          ...blobVariants,
          transition: { duration: 1.0, delay: 0.1 }
        }}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        className="absolute -bottom-24 right-[-12%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background: 'conic-gradient(from 210deg, rgba(99,102,241,.22), rgba(124,58,237,.26), rgba(232,121,249,.22))',
          filter: 'blur(90px)',
        }}
      />
      
      {/* Rotating ring - only if motion is enabled */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 dark:border-white/5"
        />
      )}
    </div>
  );
}

function FloatingShapes() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const shapes = useMemo(() => [
    { cx: 40, cy: 30, r: 14, opacity: 0.5 },
    { cx: 85, cy: 65, r: 10, opacity: 0.35 },
    { cx: 15, cy: 75, r: 8, opacity: 0.4 },
  ], []);

  return (
    <svg 
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none" 
      aria-hidden
    >
      {shapes.map((shape, i) => (
        <motion.circle
          key={i}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill="url(#grad)"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: shape.opacity, scale: 1 } : {}}
          transition={{ duration: 1, delay: i * 0.2 }}
        />
      ))}
      <defs>
        <radialGradient id="grad">
          <stop offset="0%" stopColor="#cfb6ff" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ---------------------------------- CTAs ------------------------------------ */

function MagneticCTA({ href, children, ariaLabel, className = "" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setMousePos({
      x: (e.clientX - centerX) * 0.15,
      y: (e.clientY - centerY) * 0.15,
    });
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-base font-semibold text-white shadow-[0_10px_40px_-12px_rgba(124,58,237,.45)] transition-all duration-300 hover:from-fuchsia-600 hover:to-violet-600 hover:shadow-[0_15px_50px_-10px_rgba(124,58,237,.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${className}`}
      style={{ 
        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        transition: isHovered ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {children}
      <motion.svg 
        className="ml-2 h-4 w-4" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        animate={{ x: isHovered ? 2 : 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </motion.svg>
    </Link>
  );
}

function EarlyEmailCapture() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!email.match(/.+@.+\..+/)) {
      setState('error');
      setMessage('Please enter a valid email.');
      return;
    }

    setState('loading');
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setState('success');
      setMessage('Invite reserved! Redirecting…');
      
      setTimeout(() => {
        window.location.href = `/dashboard?email=${encodeURIComponent(email)}&source=hero-email`;
      }, 1000);
    } catch (error) {
      setState('error');
      setMessage('Something went wrong. Please try again.');
    }
  }, [email]);

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex w-full max-w-xl gap-2">
      <div className="relative grow">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          disabled={state === 'loading' || state === 'success'}
          className="w-full rounded-xl border border-violet-200/70 bg-white/85 px-4 py-3 pr-10 text-sm outline-none shadow-[0_6px_28px_-14px_rgba(124,58,237,.18)] backdrop-blur placeholder:text-zinc-500 focus:ring-2 focus:ring-fuchsia-400 disabled:opacity-50 dark:border-white/15 dark:bg-white/10"
          aria-label="Work email"
        />
        <MailIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-70" />
      </div>
      
      <motion.button
        type="submit"
        disabled={state === 'loading' || state === 'success'}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      >
        {state === 'loading' ? (
          <>
            <Spinner className="mr-2" />
            Reserving…
          </>
        ) : (
          'Get beta invite'
        )}
      </motion.button>
      
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-full mt-2 text-xs ${
            state === 'error' ? 'text-rose-600' : 'text-emerald-600'
          }`}
          role="alert"
          aria-live="polite"
        >
          {message}
        </motion.div>
      )}
    </form>
  );
}

// Icon Components
const MailIcon = ({ className = "", ...props }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} {...props} aria-hidden>
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Spinner = ({ className = "" }) => (
  <motion.div
    className={`h-4 w-4 rounded-full border-2 border-white/30 border-t-white ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path 
      d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      fill="currentColor" 
      opacity="0.9" 
    />
  </svg>
);

function CornerBadge() {
  return (
    <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
      <SparkleIcon /> AI Enhanced
    </div>
  );
}

function GradientRing() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.55), 0 0 0 1px rgba(124,58,237,.18)',
        maskImage: 'radial-gradient(120% 120% at 50% 0%, rgba(0,0,0,.85), transparent 62%)',
      }}
    />
  );
}

/* --------------------------------- Trust Bar -------------------------------- */

function TrustBar() {
  const items = [
    'Trusted by 1,200+ stores',
    'GDPR-friendly', 
    'Secure uploads'
  ];
  
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-4">
          <span className={index === 0 ? 'font-medium' : ''}>{item}</span>
          {index < items.length - 1 && <Dot />}
        </div>
      ))}
    </div>
  );
}

const Dot = () => <span className="inline-block h-1 w-1 rounded-full bg-zinc-400" />;

/* ----------------------------- Compare Slider ------------------------------- */

function CompareSlider({ before, after, defaultPercent = 60, showLabels = true }) {
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const [position, setPosition] = useState(defaultPercent);
  const [isDragging, setIsDragging] = useState(false);

  const clampPosition = useCallback((value) => Math.max(0, Math.min(100, value)), []);

  const updatePositionFromClientX = useCallback((clientX) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const newPosition = clampPosition(((clientX - rect.left) / rect.width) * 100);
    setPosition(newPosition);
  }, [clampPosition]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleRef.current?.setPointerCapture?.(e.pointerId);
    updatePositionFromClientX(e.clientX);
  }, [updatePositionFromClientX]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || e.buttons !== 1) return;
    updatePositionFromClientX(e.clientX);
  }, [isDragging, updatePositionFromClientX]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((e) => {
    const step = e.shiftKey ? 10 : 5;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setPosition(prev => clampPosition(prev - step));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPosition(prev => clampPosition(prev + step));
        break;
      case 'Home':
        e.preventDefault();
        setPosition(0);
        break;
      case 'End':
        e.preventDefault();
        setPosition(100);
        break;
    }
  }, [clampPosition]);

  return (
    <div 
      ref={trackRef} 
      className="relative w-full overflow-hidden"
      role="img"
      aria-label="Before and after comparison"
    >
      {/* After image (base layer) */}
      <Image 
        src={after.src} 
        alt={after.alt} 
        width={900} 
        height={1200} 
        priority 
        className="h-auto w-full select-none object-cover" 
        sizes="(max-width: 1024px) 100vw, 50vw" 
      />
      
      {/* Before image (clipped overlay) */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden transition-all duration-100"
        style={{ width: `${position}%` }}
      >
        <Image 
          src={before.src} 
          alt={before.alt} 
          width={900} 
          height={1200} 
          className="h-full w-full object-cover" 
          loading="lazy" 
          sizes="(max-width: 1024px) 100vw, 50vw" 
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-zinc-800 shadow-sm dark:bg-black/60 dark:text-white">
            Before
          </div>
          <div className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-fuchsia-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            After
          </div>
        </>
      )}

      {/* Interactive handle */}
      <div
        ref={handleRef}
        role="slider"
        aria-label="Compare before and after images"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% before image visible`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`absolute top-0 cursor-ew-resize touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-2 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ 
          left: `calc(${position}% - 1px)`, 
          height: '100%',
          width: '2px'
        }}
      >
        <div className="h-full w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,.2)] mix-blend-difference" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2 py-1 text-xs text-white pointer-events-none">
          {isDragging ? 'Dragging' : 'Drag'}
        </div>
      </div>

      {/* Fallback range input for better accessibility */}
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-x-0 bottom-4 z-10 mx-4 h-1 cursor-ew-resize appearance-none rounded-full bg-zinc-300/50 opacity-0 outline-none accent-fuchsia-600 hover:opacity-100 focus:opacity-100 dark:bg-zinc-700/50"
        aria-label="Compare slider fallback control"
      />
    </div>
  );
}

// ... Rest of the components would follow the same improvement patterns
// (LogoMarquee, ProofMetrics, ValueProps, etc. with better accessibility, performance, and code organization)

/* ----------------------------- Logos Marquee -------------------------------- */

function LogoMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const logos = useMemo(() => [
    'brand-1.svg', 'brand-2.svg', 'brand-3.svg', 'brand-4.svg', 'brand-5.svg'
  ], []);

  return (
    <div className="relative z-10 mx-auto mt-6 w-full max-w-7xl overflow-hidden px-6 py-6 md:px-12">
      <div className="mb-3 text-center text-[11px] uppercase tracking-widest text-zinc-500">
        POWERING TEAMS AT
      </div>
      
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div 
          className="flex min-w-full items-center gap-10 opacity-80"
          animate={prefersReducedMotion ? {} : { x: [0, -50] }}
          transition={prefersReducedMotion ? {} : {
            x: { repeat: Infinity, repeatType: "loop", duration: 26, ease: "linear" }
          }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {logos.concat(logos).map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-8 w-28 flex-shrink-0">
              <Image 
                src={`/${src}`} 
                alt={`Partner brand ${i % logos.length + 1}`} 
                fill 
                className="object-contain opacity-60 hover:opacity-100 transition-opacity" 
                sizes="112px" 
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Additional performance optimization: Memoize expensive components
export const MemoizedHeroSection = React.memo(HeroSection);
