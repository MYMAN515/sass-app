import React, { useEffect, useId, useRef, useState, memo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";

/**
 * Ultra Landing v2 — JSX
 * - DPR-correct canvas drawing & clearing
 * - No TS types, pure JSX
 * - SSR-safe (no document/window at module scope)
 * - A11y: keyboard & screen reader support
 * - Performance: throttled resize, offscreen pause, reduced-motion friendly
 */

const LOGOS = Object.freeze(["Shopify", "WooCommerce", "Etsy", "Amazon", "eBay", "BigCommerce"]);
const METRICS = Object.freeze([
  { value: 43, suffix: "%", label: "Higher conversions", color: "from-green-400 to-emerald-600" },
  { value: 94, suffix: "%", label: "Time saved", color: "from-violet-400 to-purple-600" },
  { value: 12, suffix: "s", label: "Avg render time", color: "from-blue-400 to-cyan-600" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "from-fuchsia-400 to-pink-600" },
]);
const FEATURE_LIST = Object.freeze([
  {
    title: "AI Image Enhancement",
    description:
      "Transform amateur shots into studio-quality masterpieces with one click. Advanced AI removes backgrounds, adjusts lighting, and perfects every pixel.",
    icon: "🎨",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Virtual Try-On",
    description:
      "Let customers see products on real models instantly. Boost confidence, reduce returns, and watch conversions skyrocket.",
    icon: "👕",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    title: "Smart Copy Generation",
    description:
      "AI-powered descriptions that sell. Get compelling, SEO-optimized product copy in seconds—no copywriter needed.",
    icon: "✍️",
    gradient: "from-blue-500 to-cyan-600",
  },
]);
const PROCESS_STEPS = Object.freeze([
  { title: "Upload", description: "Drop your product photo—any format, any quality", icon: "📤" },
  { title: "Enhance", description: "AI works its magic in seconds", icon: "✨" },
  { title: "Export", description: "Download or publish directly to your store", icon: "🚀" },
]);
const TESTIMONIALS = Object.freeze([
  '"Conversion rate jumped 47% in our first month."',
  '"We ditched our $8K/month photo team."',
  '"ROI positive in 72 hours. Unreal."',
  '"My competitor asked what agency we hired. LOL."',
  '"Product returns down 34% with try-on."',
]);

export default function HeroSection() {
  return (
    <main className="relative w-full overflow-hidden bg-[#0a0a0f] font-sans text-white">
      <BackgroundCanvas />
      <HeroContent />
      <LogoOrbit />
      <MetricsSection />
      <FeatureShowcase />
      <InteractiveDemo />
      <ProcessTimeline />
      <SocialProof />
      <FinalCTA />
      <FloatingCTA />
    </main>
  );
}

/* ============================= Background Canvas ============================= */

function BackgroundCanvas() {
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let wCss = window.innerWidth;
    let hCss = window.innerHeight;

    const setSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      wCss = window.innerWidth;
      hCss = window.innerHeight;
      canvas.width = Math.floor(wCss * dpr);
      canvas.height = Math.floor(hCss * dpr);
      canvas.style.width = `${wCss}px`;
      canvas.style.height = `${hCss}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw/clear in CSS px
    };
    setSize();

    const rand = (a, b) => a + Math.random() * (b - a);
    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rand(0, wCss),
      y: rand(0, hCss),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      size: rand(0.6, 2.4),
      opacity: rand(0.25, 0.65),
    }));

    let rafId = 0;
    let running = true;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, wCss, hCss);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > wCss) p.vx *= -1;
        if (p.y < 0 || p.y > hCss) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    // Throttled resize
    let resizeTimer;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setSize();
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Pause when tab hidden
    const onVisibility = () => {
      const wasRunning = running;
      running = !document.hidden;
      if (running && !wasRunning) rafId = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReducedMotion]);

  // Inject gradient keyframes SSR-safely
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes gradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      .animate-gradient { background-size:200% 200%; animation:gradient 3s ease infinite; }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-fuchsia-950/20 to-indigo-950/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" aria-hidden="true" />
      <AnimatedGrid />
      <GlowOrbs />
    </>
  );
}

const AnimatedGrid = memo(function AnimatedGrid() {
  return (
    <div className="absolute inset-0 opacity-20" aria-hidden="true">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(139, 92, 246, 0.08) 1px, transparent 1px),linear-gradient(to bottom, rgba(139, 92, 246, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
});

function GlowOrbs() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-48 top-0 h-96 w-96 rounded-full bg-violet-600/30 blur-[100px]"
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, -80, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-48 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-[120px]"
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 60, 0], y: [0, -80, 0], scale: [1.2, 1, 1.2] }}
        transition={prefersReducedMotion ? {} : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]"
      />
    </div>
  );
}

/* ================================ Hero Content ================================ */

function HeroContent() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const router = useRouter();
  const [showProductHuntHello, setShowProductHuntHello] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const refParam = router.query.ref;
    const referral = Array.isArray(refParam) ? refParam[0] : refParam;
    if (typeof referral === "string" && referral.toLowerCase() === "producthunt") {
      setShowProductHuntHello(true);
    } else {
      setShowProductHuntHello(false);
    }
  }, [router.isReady, router.query.ref]);

  return (
    <motion.section style={{ y, opacity }} className="relative z-10 px-6 pt-28 pb-24 md:px-12 lg:px-20 lg:pt-36">
      <div className="mx-auto max-w-7xl">
        {showProductHuntHello && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 rounded-2xl border border-violet-500/40 bg-violet-900/60 px-6 py-5 text-base text-violet-100 shadow-[0_10px_40px_-20px_rgba(168,85,247,0.8)] backdrop-blur"
          >
            <p className="flex flex-col gap-1 text-center font-semibold sm:flex-row sm:items-center sm:justify-center sm:gap-3">
              <span className="text-2xl" aria-hidden>
                🚀
              </span>
              <span>
                Hey Product Hunters! You just unlocked the AI photo studio that works harder than your third espresso.
                Grab your free renders and let&apos;s make your launch page jealous.
              </span>
            </p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center gap-3"
        >
          <Badge text="AI-Powered Studio" icon="✨" />
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-sm text-violet-300">
            Trusted by 2,400+ brands
          </motion.span>
        </motion.div>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight"
            >
              Transform products into
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                unforgettable visuals
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-zinc-300 leading-relaxed max-w-xl"
            >
              Studio-quality photos, AI try-on, and marketing magic—delivered in seconds.
              <span className="text-violet-300 font-medium"> No photographer required.</span>
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-8 flex flex-wrap gap-3">
              <FeaturePill text="No credit card" />
              <FeaturePill text="3 free renders" />
              <FeaturePill text="60-second setup" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-10 flex flex-col sm:flex-row gap-4">
              <MagneticButton href="#demo" primary>
                Start creating free
                <ArrowIcon />
              </MagneticButton>
              <MagneticButton href="#how">See how it works</MagneticButton>
            </motion.div>

            <EmailCapture />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <TiltCard>
              <CompareSlider />
            </TiltCard>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="mt-16 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>↓</motion.div>
            Scroll to explore
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ================================ Components ================================ */

const Badge = memo(function Badge({ text, icon }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/50 px-4 py-2 text-sm font-medium backdrop-blur-xl">
      <span aria-hidden>{icon}</span>
      <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">{text}</span>
    </motion.div>
  );
});

const FeaturePill = memo(function FeaturePill({ text }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm">
      <span className="mr-2 text-green-400" aria-hidden>✓</span>
      {text}
    </div>
  );
});

function MagneticButton({ href, children, primary = false }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 8;
    const y = (e.clientY - rect.top - rect.height / 2) / 8;
    setPosition({ x, y });
  };
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const base = "group relative inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";
  const variant = primary
    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60"
    : "border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm";

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      className={`${base} ${variant}`}
    >
      {children}
    </motion.a>
  );
}

const ArrowIcon = memo(function ArrowIcon() {
  return (
    <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
});

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const fieldId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      // TODO: call your API here
      await new Promise((r) => setTimeout(r, 700));
      setStatus("success");
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = `/dashboard?email=${encodeURIComponent(email)}`;
        }
      }, 700);
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
      noValidate
      aria-describedby={`${fieldId}-desc`}
    >
      <div className="relative flex-1">
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 outline-none backdrop-blur-sm transition focus:border-violet-500/50 focus:bg-white/10"
          disabled={status === "loading" || status === "success"}
          autoComplete="email"
          aria-invalid={status === "error"}
        />
        <p id={`${fieldId}-desc`} className="sr-only">
          Enter your email to get early access.
        </p>
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={status === "loading" || status === "success"}
        className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50 backdrop-blur-sm"
        aria-live="polite"
      >
        {status === "loading" ? "Sending…" : status === "success" ? "Sent! ✓" : "Get Early Access"}
      </motion.button>
      {status === "error" && <p className="text-sm text-red-400">Please enter a valid email</p>}
    </motion.form>
  );
}

function TiltCard({ children }) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setRotateY((x - cx) / 20);
    setRotateX((cy - y) / 20);
  };
  const onLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: "transform 0.1s ease-out" }}
      className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-2 shadow-2xl backdrop-blur-xl"
    >
      {children}
    </motion.div>
  );
}

/* ============================== Compare Slider ============================== */

function CompareSlider() {
  const [position, setPosition] = useState(50); // percent
  const trackRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const clampPct = (v) => Math.max(0, Math.min(100, v));

  const updateFromClientX = (clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clampPct(pct));
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    if (!el) return;
    if (!(e.buttons & 1)) return; // only while primary button down
    updateFromClientX(e.clientX);
  };

  const onPointerUpOrCancel = (e) => {
    const el = trackRef.current;
    if (el && el.releasePointerCapture) el.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") setPosition((p) => clampPct(p - 2));
    if (e.key === "ArrowRight") setPosition((p) => clampPct(p + 2));
    if (e.key === "Home") setPosition(0);
    if (e.key === "End") setPosition(100);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl" aria-label="Before and after comparison">
      <div
        ref={trackRef}
        className="relative aspect-[4/5] w-full cursor-ew-resize select-none touch-none"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
      >
        {/* After layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 to-fuchsia-900" aria-hidden="true">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4" aria-hidden="true">✨</div>
              <div className="text-white font-bold text-lg">Enhanced</div>
            </div>
          </div>
        </div>

        {/* Before clipped */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" aria-hidden="true">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-50" aria-hidden="true">📷</div>
                <div className="text-zinc-400 font-bold text-lg">Original</div>
              </div>
            </div>
          </div>
        </div>

        {/* Handle */}
        <div className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-lg" style={{ left: `${position}%` }} aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 4l-4 8 4 8M16 4l4 8-4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm" aria-hidden="true">
          Before
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white" aria-hidden="true">
          After
        </div>
      </div>
      {prefersReducedMotion && (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Tip: animations are minimized to respect your settings.
        </p>
      )}
    </div>
  );
}

/* =============================== Logo Orbit =============================== */

const LogoOrbit = memo(function LogoOrbit() {
  return (
    <section className="relative z-10 py-20 px-6 md:px-12" aria-label="Integrations">
      <div className="mx-auto max-w-7xl text-center">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 text-sm uppercase tracking-widest text-zinc-500">
          Seamlessly integrates with
        </motion.p>
        <div className="relative h-20 overflow-hidden">
          <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-16 absolute">
            {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <div key={i} className="flex items-center justify-center min-w-[150px]">
                <span className="text-2xl font-bold text-zinc-600 hover:text-white transition">{logo}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

/* ============================== Metrics Section ============================== */

const MetricsSection = memo(function MetricsSection() {
  return (
    <section className="relative z-10 px-6 py-24 md:px-12" aria-label="Key metrics">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
});

function MetricCard({ value, suffix, label, color, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1600;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(eased * value);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const decimals = suffix === "s" || (suffix === "%" && value > 90) ? 1 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-violet-500/20"
    >
      <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {count.toFixed(decimals)}{suffix}
      </div>
      <div className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-300 transition">{label}</div>
      <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-0 blur-xl transition-opacity group-hover:opacity-10`} />
    </motion.div>
  );
}

/* ============================ Feature Showcase ============================ */

const FeatureShowcase = memo(function FeatureShowcase() {
  return (
    <section id="features" className="relative z-10 px-6 py-32 md:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">
            Built for <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">conversion</span>
          </h2>
          <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto">Every feature designed to turn browsers into buyers</p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURE_LIST.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
});

function FeatureCard({ title, description, icon, gradient, delay }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8 }}
      className="group relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-2xl"
    >
      <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${gradient} text-3xl shadow-lg`} aria-hidden>
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-bold">{title}</h3>
      <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition">{description}</p>
      <div className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r ${gradient} opacity-0 blur-2xl transition-opacity group-hover:opacity-5`} />
    </motion.article>
  );
}

/* ============================ Interactive Demo ============================ */

function InteractiveDemo() {
  return (
    <section id="demo" className="relative z-10 px-6 py-32 md:px-12 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent" aria-label="Interactive demo">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">See the magic</h2>
          <p className="text-xl text-zinc-400">Drag to compare before and after</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mx-auto max-w-3xl">
          <TiltCard>
            <CompareSlider />
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ Process Timeline ============================ */

const ProcessTimeline = memo(function ProcessTimeline() {
  return (
    <section id="how" className="relative z-10 px-6 py-32 md:px-12" aria-label="How it works">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Three steps to perfect</h2>
          <p className="text-xl text-zinc-400">From upload to sale in under a minute</p>
        </motion.div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent hidden md:block" aria-hidden />
          <div className="grid gap-12 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }} className="relative text-center">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-4xl shadow-2xl shadow-violet-500/50">
                  <span aria-hidden>{step.icon}</span>
                </motion.div>
                <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
                <p className="text-zinc-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
          <MagneticButton href="#demo" primary>
            Try it yourself <ArrowIcon />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
});

/* ============================== Social Proof ============================== */

const SocialProof = memo(function SocialProof() {
  return (
    <section className="relative z-10 py-24 overflow-hidden" aria-label="Testimonials">
      <div className="relative">
        <motion.div animate={{ x: [-1000, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="flex gap-8">
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((quote, index) => (
            <blockquote key={`${quote}-${index}`} className="flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm min-w-[320px] md:min-w-[400px]">
              <p className="text-lg text-zinc-300">{quote}</p>
            </blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

/* =============================== Final CTA =============================== */

const FinalCTA = memo(function FinalCTA() {
  return (
    <section className="relative z-10 px-6 py-32 md:px-12" aria-label="Call to action">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-4xl text-center">
        <div className="relative rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 p-12 md:p-16 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-fuchsia-600/10" aria-hidden />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Your competitors aren't waiting</h2>
            <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
              Join 2,400+ brands creating product visuals that convert. Start free—no credit card, no commitment, no BS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MagneticButton href="#demo" primary>
                Start creating free <ArrowIcon />
              </MagneticButton>
              <MagneticButton href="#features">Explore features</MagneticButton>
            </div>
            <ul className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
              <li>✓ 3 free renders</li>
              <li>✓ No credit card</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Setup in 60s</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
});

/* ============================ Floating CTA ============================ */

function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 100 }} className="fixed bottom-6 right-6 z-50 md:hidden">
      <motion.a href="#demo" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-bold text-white shadow-2xl shadow-violet-500/50">
        Start free <ArrowIcon />
      </motion.a>
    </motion.div>
  );
}
