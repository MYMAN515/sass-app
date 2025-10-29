import React, { useEffect, useId, useRef, useState, memo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRouter } from "next/router";

/**
 * Ultra Landing v3 — Clean White Edition
 * - Professional white theme with subtle accents
 * - Real, trustworthy design language
 * - Fun SVG animations
 * - Enhanced credibility
 */

const LOGOS = Object.freeze(["Shopify", "WooCommerce", "Etsy", "Amazon", "eBay", "BigCommerce"]);
const METRICS = Object.freeze([
  { value: 43, suffix: "%", label: "Higher conversions", color: "from-blue-600 to-cyan-600" },
  { value: 94, suffix: "%", label: "Time saved", color: "from-purple-600 to-indigo-600" },
  { value: 12, suffix: "s", label: "Avg render time", color: "from-green-600 to-emerald-600" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", color: "from-orange-600 to-red-600" },
]);
const FEATURE_LIST = Object.freeze([
  {
    title: "AI Image Enhancement",
    description:
      "Transform product photos into studio-quality images. Our AI handles background removal, lighting adjustments, and professional retouching automatically.",
    icon: "🎨",
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Virtual Try-On",
    description:
      "Let customers visualize products before buying. Reduce returns by 34% and increase purchase confidence with realistic AR try-on.",
    icon: "👕",
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Smart Copy Generation",
    description:
      "Generate SEO-optimized product descriptions instantly. Our AI writes compelling copy that converts, saving you hours of work.",
    icon: "✍️",
    color: "bg-blue-100 text-blue-600",
  },
]);
const PROCESS_STEPS = Object.freeze([
  { title: "Upload", description: "Drop your product photo in any format", icon: "📤" },
  { title: "Enhance", description: "AI processes your image in seconds", icon: "✨" },
  { title: "Export", description: "Download or publish to your store", icon: "🚀" },
]);
const TESTIMONIALS = Object.freeze([
  { text: "Conversion rate jumped 47% in our first month.", author: "Sarah Chen", role: "E-commerce Manager" },
  { text: "Saved $8K/month on photography costs.", author: "Mike Peterson", role: "Store Owner" },
  { text: "ROI positive in 72 hours. Game changer.", author: "Lisa Rodriguez", role: "Marketing Director" },
  { text: "Product returns down 34% with try-on.", author: "James Kim", role: "Operations Lead" },
]);

export default function HeroSection() {
  return (
    <main className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white font-sans text-gray-900">
      <BackgroundElements />
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

/* ============================= Background Elements ============================= */

function BackgroundElements() {
  return (
    <>
      <AnimatedGrid />
      <FloatingShapes />
    </>
  );
}

const AnimatedGrid = memo(function AnimatedGrid() {
  return (
    <div className="absolute inset-0 opacity-30" aria-hidden="true">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
});

function FloatingShapes() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Floating Circle */}
      <motion.div
        animate={prefersReducedMotion ? {} : { 
          y: [0, -30, 0], 
          x: [0, 20, 0],
          rotate: [0, 180, 360] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-60 blur-3xl"
      />
      
      {/* Floating Square */}
      <motion.div
        animate={prefersReducedMotion ? {} : { 
          y: [0, 40, 0], 
          x: [0, -30, 0],
          rotate: [0, -90, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 opacity-50 blur-3xl"
      />
      
      {/* Small accent */}
      <motion.div
        animate={prefersReducedMotion ? {} : { 
          y: [0, -20, 0], 
          scale: [1, 1.2, 1] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-green-100 to-cyan-100 opacity-40 blur-2xl"
      />
    </div>
  );
}

/* ================================ Hero Content ================================ */

function HeroContent() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const router = useRouter();
  const [showProductHuntHello, setShowProductHuntHello] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const refParam = router.query.ref;
    const referral = Array.isArray(refParam) ? refParam[0] : refParam;
    if (typeof referral === "string" && referral.toLowerCase() === "producthunt") {
      setShowProductHuntHello(true);
    }
  }, [router.isReady, router.query.ref]);

  return (
    <motion.section style={{ y }} className="relative z-10 px-6 pt-20 pb-20 md:px-12 lg:px-20 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        {showProductHuntHello && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50 px-6 py-4 shadow-sm"
          >
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
              <span className="text-2xl">🎉</span>
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">
                  Hey Product Hunters! Welcome to the AI photo studio that actually delivers results. 
                  <span className="font-bold text-orange-600"> Get 3 free renders on us!</span>
                </p>
                <a
                  href="https://www.producthunt.com/products/ai-store-assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-90 transition"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1030324&theme=light"
                    alt="AI Store Assistant on Product Hunt"
                    width="250"
                    height="54"
                  />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
            >
              <TrustBadge />
              <span>Trusted by 2,400+ brands worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-gray-900"
            >
              Professional product photos
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                in seconds, not hours
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-xl text-gray-600 leading-relaxed max-w-xl"
            >
              Transform amateur photos into studio-quality visuals with AI. 
              <span className="font-semibold text-gray-900"> No expensive equipment. No photo skills needed.</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }} 
              className="mt-8 flex flex-wrap gap-3"
            >
              <FeaturePill text="Free 3 renders" icon="🎁" />
              <FeaturePill text="No credit card" icon="💳" />
              <FeaturePill text="60-sec setup" icon="⚡" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }} 
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <PrimaryButton href="#demo">
                Start creating free
                <ArrowIcon />
              </PrimaryButton>
              <SecondaryButton href="#how">
                See how it works
              </SecondaryButton>
            </motion.div>

            <EmailCapture />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-4 text-sm text-gray-500"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white" />
                ))}
              </div>
              <span>Join 2,400+ happy merchants</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <ProductShowcaseSVG />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* ================================ SVG Animations ================================ */

function ProductShowcaseSVG() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
        {/* Background */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="productGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main container */}
        <motion.rect
          x="50"
          y="50"
          width="400"
          height="400"
          rx="24"
          fill="url(#bgGradient)"
          stroke="#C7D2FE"
          strokeWidth="3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Product mockup - Phone */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <rect x="150" y="120" width="200" height="280" rx="20" fill="white" stroke="#6366F1" strokeWidth="4" filter="url(#glow)" />
          
          {/* Screen */}
          <rect x="165" y="145" width="170" height="230" rx="8" fill="url(#productGradient)" />
          
          {/* Camera notch */}
          <rect x="215" y="130" width="70" height="8" rx="4" fill="#1F2937" />
        </motion.g>

        {/* Floating sparkles */}
        {!prefersReducedMotion && (
          <>
            <motion.circle
              cx="120"
              cy="150"
              r="6"
              fill="#FBBF24"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
                y: [0, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="380"
              cy="200"
              r="8"
              fill="#F472B6"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
                y: [0, -15, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="100"
              cy="350"
              r="5"
              fill="#60A5FA"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
                x: [0, 10, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* AI badge */}
        <motion.g
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        >
          <circle cx="370" cy="120" r="30" fill="#10B981" stroke="white" strokeWidth="4" />
          <text x="370" y="130" textAnchor="middle" fontSize="32" fill="white">✨</text>
        </motion.g>

        {/* Quality badge */}
        <motion.g
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <rect x="70" y="240" width="100" height="40" rx="20" fill="white" stroke="#3B82F6" strokeWidth="2" />
          <text x="120" y="266" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#3B82F6">4K</text>
        </motion.g>

        {/* Speed indicator */}
        <motion.g
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <rect x="330" y="340" width="100" height="40" rx="20" fill="white" stroke="#8B5CF6" strokeWidth="2" />
          <text x="380" y="366" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#8B5CF6">⚡ 12s</text>
        </motion.g>

        {/* Checkmark animation */}
        {!prefersReducedMotion && (
          <motion.path
            d="M 200 320 L 220 340 L 260 300"
            stroke="#10B981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          />
        )}
      </svg>
    </div>
  );
}

function TrustBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ================================ Components ================================ */

const FeaturePill = memo(function FeaturePill({ text, icon }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
      <span aria-hidden>{icon}</span>
      {text}
    </div>
  );
});

function PrimaryButton({ href, children }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      {children}
    </motion.a>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 bg-white px-8 py-4 text-base font-bold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
    >
      {children}
    </motion.a>
  );
}

const ArrowIcon = memo(function ArrowIcon() {
  return (
    <motion.svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="transition-transform group-hover:translate-x-1"
    >
      <path 
        d="M5 12h14M12 5l7 7-7 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </motion.svg>
  );
});

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const fieldId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
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
      transition={{ delay: 0.5 }}
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
      noValidate
    >
      <div className="relative flex-1">
        <label htmlFor={fieldId} className="sr-only">Email address</label>
        <input
          id={fieldId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
          disabled={status === "loading" || status === "success"}
          autoComplete="email"
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={status === "loading" || status === "success"}
        className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {status === "loading" ? "Sending..." : status === "success" ? "Sent! ✓" : "Get Early Access"}
      </motion.button>
      {status === "error" && <p className="text-sm text-red-600">Please enter a valid email</p>}
    </motion.form>
  );
}

/* =============================== Logo Orbit =============================== */

const LogoOrbit = memo(function LogoOrbit() {
  return (
    <section className="relative z-10 py-16 px-6 md:px-12 border-y border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl text-center">
        <motion.p 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          className="mb-10 text-sm font-semibold uppercase tracking-widest text-gray-500"
        >
          Works seamlessly with
        </motion.p>
        <div className="relative h-16 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }} 
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }} 
            className="flex gap-16 absolute"
          >
            {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <div key={i} className="flex items-center justify-center min-w-[180px]">
                <span className="text-xl font-bold text-gray-400 hover:text-gray-900 transition">{logo}</span>
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
    <section className="relative z-10 px-6 py-20 md:px-12 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Real results from real businesses
          </h2>
          <p className="text-lg text-gray-600">Measurable impact on your bottom line</p>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((metric, index) => (
            <MetricCard key={metric.label} {...metric} delay={index * 0.1} />
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
      whileHover={{ y: -5 }}
      className="group relative rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-gray-300"
    >
      <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>
        {count.toFixed(decimals)}{suffix}
      </div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
    </motion.div>
  );
}

/* ============================ Feature Showcase ============================ */

const FeatureShowcase = memo(function FeatureShowcase() {
  return (
    <section id="features" className="relative z-10 px-6 py-24 md:px-12 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Everything you need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">sell more</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional tools designed to increase conversions and save you time
          </p>
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

function FeatureCard({ title, description, icon, color, delay }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8 }}
      className="group relative rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-gray-300"
    >
      <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-4xl shadow-sm`}>
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.article>
  );
}

/* ============================ Interactive Demo ============================ */

function InteractiveDemo() {
  const [position, setPosition] = useState(50);
  const trackRef = useRef(null);

  const updateFromClientX = (clientX) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  };

  return (
    <section id="demo" className="relative z-10 px-6 py-24 md:px-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">See the difference</h2>
          <p className="text-xl text-gray-600">Drag the slider to compare before and after</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: true }} 
          className="mx-auto max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border-2 border-gray-200 shadow-2xl bg-white">
            <div
              ref={trackRef}
              className="relative aspect-[4/3] w-full cursor-ew-resize select-none"
              onPointerDown={(e) => {
                trackRef.current?.setPointerCapture?.(e.pointerId);
                updateFromClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (e.buttons & 1) updateFromClientX(e.clientX);
              }}
              onPointerUp={(e) => trackRef.current?.releasePointerCapture?.(e.pointerId)}
            >
              {/* After image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">✨</div>
                  <div className="text-2xl font-bold text-gray-900">AI Enhanced</div>
                  <div className="text-gray-600">Studio Quality</div>
                </div>
              </div>

              {/* Before image (clipped) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4 opacity-50">📷</div>
                    <div className="text-2xl font-bold text-gray-700">Original Photo</div>
                    <div className="text-gray-500">Amateur Quality</div>
                  </div>
                </div>
              </div>

              {/* Slider handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" 
                style={{ left: `${position}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl border-2 border-blue-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 4l-4 8 4 8M16 4l4 8-4 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute left-4 top-4 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white">
                Before
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                After
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================ Process Timeline ============================ */

const ProcessTimeline = memo(function ProcessTimeline() {
  return (
    <section id="how" className="relative z-10 px-6 py-24 md:px-12 bg-white">
      <div className="mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600">Get professional results in three simple steps</p>
        </motion.div>
        
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent hidden md:block" />
          
          <div className="grid gap-12 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-5xl shadow-lg"
                >
                  {step.icon}
                </motion.div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl font-black text-gray-100 -z-10">
                  {index + 1}
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="mt-16 text-center"
        >
          <PrimaryButton href="#demo">
            Try it yourself <ArrowIcon />
          </PrimaryButton>
        </motion.div>
      </div>
    </section>
  );
});

/* ============================== Social Proof ============================== */

const SocialProof = memo(function SocialProof() {
  return (
    <section className="relative z-10 py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          Loved by merchants everywhere
        </h2>
      </div>
      
      <div className="relative">
        <motion.div 
          animate={{ x: [-1000, 0] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
          className="flex gap-6"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, index) => (
            <blockquote 
              key={index} 
              className="flex-shrink-0 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm min-w-[340px] md:min-w-[420px]"
            >
              <div className="flex items-start gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-lg text-gray-900 mb-4 font-medium">{testimonial.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
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
    <section className="relative z-10 px-6 py-24 md:px-12 bg-gradient-to-b from-white to-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="mx-auto max-w-4xl text-center"
      >
        <div className="relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-12 md:p-16 shadow-xl">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Ready to transform your store?
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Join 2,400+ successful merchants using AI to create stunning product visuals. 
            <span className="font-bold text-blue-600"> Start free today.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <PrimaryButton href="#demo">
              Start creating free <ArrowIcon />
            </PrimaryButton>
            <SecondaryButton href="#features">
              Explore features
            </SecondaryButton>
          </div>
          
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              3 free renders
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </li>
          </ul>
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
    <motion.div 
      initial={{ opacity: 0, y: 100 }} 
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 100 }} 
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.a 
        href="#demo" 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-bold text-white shadow-2xl shadow-blue-500/50"
      >
        Start free <ArrowIcon />
      </motion.a>
    </motion.div>
  );
}
