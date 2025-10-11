import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  return (
    <main className="relative w-full overflow-hidden bg-[#070711] font-sans text-white">
      <LandingBackground />
      <Hero />
      <LogosMarquee />
      <Highlights />
      <ProductShowcase />
      <Workflow />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <FloatingCTA />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Background layer                             */
/* -------------------------------------------------------------------------- */

function LandingBackground() {
  return (
    <>
      <ParticleCanvas />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.22),_transparent_55%)]" aria-hidden />
      <div className="absolute inset-0 opacity-40">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>
      <AuroraGlow />
    </>
  );
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const PARTICLES = Array.from({ length: 70 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      hue: 0,
      alpha: 0,
    }));

    const randomBetween = (min, max) => min + Math.random() * (max - min);

    const configure = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight + 200;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      PARTICLES.forEach((particle) => {
        particle.x = randomBetween(0, width);
        particle.y = randomBetween(0, height);
        particle.vx = randomBetween(-0.15, 0.15);
        particle.vy = randomBetween(-0.25, 0.25);
        particle.size = randomBetween(0.6, 1.8);
        particle.hue = randomBetween(255, 320);
        particle.alpha = randomBetween(0.2, 0.5);
      });
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const particle of PARTICLES) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `hsla(${particle.hue}, 90%, 65%, ${particle.alpha})`;
        context.fill();
      }
      animationId = window.requestAnimationFrame(draw);
    };

    configure();
    draw();

    let resizeTimer = 0;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        configure();
      }, 200);
    };

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [prefersReducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-30" aria-hidden />;
}

function AuroraGlow() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, -80, 0], scale: [1, 1.1, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-16 h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-[120px]"
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 90, 0], y: [0, -70, 0], scale: [1.05, 1.2, 1.05] }}
        transition={prefersReducedMotion ? {} : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/25 blur-[140px]"
      />
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 60, 0], y: [0, 50, 0], scale: [1, 0.9, 1] }}
        transition={prefersReducedMotion ? {} : { duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-12rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-600/20 blur-[140px]"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Hero                                     */
/* -------------------------------------------------------------------------- */

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <motion.section
      style={{ y, opacity }}
      className="relative z-10 px-6 pt-28 pb-32 md:px-12 lg:px-20 lg:pb-40"
      aria-label="Hero"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 text-sm text-violet-200/90"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/50 px-3 py-1 font-semibold">
            ✨ All-in-one AI studio
          </span>
          <span className="hidden md:inline">Rated 4.9/5 by creative teams</span>
        </motion.div>

        <div className="mt-10 grid items-start gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              Design captivating product stories in minutes—not weeks.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl"
            >
              Elevate product launches, campaign visuals, and shoppable try-ons with a collaborative workspace powered by reliable AI. No retouching marathon. No agency back-and-forth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <PrimaryButton href="#get-started">
                Start free trial
                <ArrowIcon />
              </PrimaryButton>
              <SecondaryButton href="#tour">Take the product tour</SecondaryButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-12 flex flex-wrap items-center gap-8 text-sm text-zinc-400"
            >
              <Stat label="Assets exported" value="32k" />
              <Stat label="Avg. turnaround" value="4.5 min" />
              <Stat label="ROI in 30 days" value="212%" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -12 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:col-span-5"
            aria-hidden
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
              <div className="rounded-[2.3rem] bg-[#0b0b15] p-8">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <span>Launch plan</span>
                  <span>Live preview</span>
                </div>
                <div className="mt-6 space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-violet-300/80">Campaign 01</p>
                        <h3 className="mt-2 text-2xl font-bold">Glow serum drop</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Ready
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-zinc-400">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Background</p>
                        <p className="mt-1 text-white">Liquid neon</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Export</p>
                        <p className="mt-1 text-white">4K PNG + PSD</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Channel</p>
                        <p className="mt-1 text-white">Paid social</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500">Motion</p>
                        <p className="mt-1 text-white">6-sec loop</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-600/20 via-transparent to-fuchsia-500/20 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-violet-200/80">Smart recommendations</p>
                    <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                      <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-lg">⚡</span>
                        Auto-generated banner set for BFCM
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-lg">🎨</span>
                        Suggested brand palette refresh
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-lg">🛍️</span>
                        Deploy try-on to Shopify in one click
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pointer-events-none absolute -bottom-10 left-6 hidden w-48 rounded-2xl border border-white/10 bg-[#0c0c18]/90 p-4 text-xs text-zinc-300 shadow-2xl backdrop-blur md:block"
            >
              "Every drop campaign goes from idea to production in 45 minutes. Our designers just drag, approve, ship." — Hannah, VP Growth
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.35em] text-zinc-500">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Buttons / UI                                */
/* -------------------------------------------------------------------------- */

function PrimaryButton({ href, children }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold shadow-lg shadow-violet-500/50 transition hover:shadow-xl"
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
      className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
    >
      {children}
    </motion.a>
  );
}

function ArrowIcon() {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="transition-transform group-hover:translate-x-1"
      aria-hidden
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
}

/* -------------------------------------------------------------------------- */
/*                                Logos marquee                               */
/* -------------------------------------------------------------------------- */

function LogosMarquee() {
  const brands = [
    "Lumen", "Nordhaus", "Zephyr", "Kindred", "Orbiton", "Aster", "Fifth & Pine", "Volt Labs",
  ];

  return (
    <section className="relative z-10 border-y border-white/5 bg-[#0b0b16]/80 px-6 py-10 backdrop-blur md:px-12" aria-label="Logos">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 text-sm uppercase tracking-[0.4em] text-zinc-500">
        {brands.map((brand) => (
          <span key={brand} className="whitespace-nowrap opacity-70 hover:opacity-100 transition">
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Highlight grid                               */
/* -------------------------------------------------------------------------- */

function Highlights() {
  const cards = [
    {
      title: "Product visuals, perfected",
      description: "Create hero shots, bundles, and motion loops with stylist-trained models and precise lighting controls.",
      icon: "🎯",
      gradient: "from-violet-600/40 via-violet-500/10 to-transparent",
    },
    {
      title: "AI try-on that actually converts",
      description: "Deliver ultra-realistic try-ons across skin tones and body types with auto-fit garments and sizing notes.",
      icon: "🧪",
      gradient: "from-fuchsia-500/40 via-fuchsia-500/10 to-transparent",
    },
    {
      title: "Collaborate in real time",
      description: "Comment, version, and ship assets with brand, growth, and merchandising teams in one workspace.",
      icon: "🤝",
      gradient: "from-blue-500/40 via-blue-500/10 to-transparent",
    },
    {
      title: "Exports built for every channel",
      description: "Push to Shopify, Klaviyo, Meta, Amazon, and OOH formats without leaving the canvas.",
      icon: "🚀",
      gradient: "from-emerald-500/40 via-emerald-500/10 to-transparent",
    },
  ];

  return (
    <section id="tour" className="relative z-10 px-6 py-32 md:px-12" aria-label="Highlights">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black md:text-5xl">Craft every touchpoint with confidence</h2>
          <p className="mt-4 text-lg text-zinc-400 md:text-xl">
            Your creative pipeline, automated and brand-safe from concept to launch.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-60`} aria-hidden />
              <div className="relative">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-zinc-300">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Product showcase                              */
/* -------------------------------------------------------------------------- */

function ProductShowcase() {
  const scenarios = useMemo(
    () => [
      {
        title: "Launch kit",
        description: "Generate product storyboards, hero renders, and marketing copy for upcoming drops.",
        metric: "+63% CTR",
        tag: "Campaign",
      },
      {
        title: "Retail refresh",
        description: "Localize packaging shots and shelf mockups per region without manual retouching.",
        metric: "5x faster",
        tag: "Packaging",
      },
      {
        title: "Try-on hub",
        description: "Deploy ultra-realistic virtual try-ons and sync inventory to PDPs instantly.",
        metric: "-34% returns",
        tag: "Ecommerce",
      },
    ],
    []
  );
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="get-started" className="relative z-10 px-6 pb-28 md:px-12" aria-label="Product showcase">
      <div className="mx-auto max-w-7xl rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-12 backdrop-blur-xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-black md:text-4xl">Choose a mission, let Flowforge handle the rest</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 md:text-lg">
              Mix-and-match AI skills, automation, and brand guardrails to ship on-brand creative at scale. Tap a scenario to explore the workflow.
            </p>
            <div className="mt-8 space-y-4">
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    activeIndex === index
                      ? "border-violet-500/60 bg-violet-600/20 text-white"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                    <span>{scenario.tag}</span>
                    <span className="text-violet-200">{scenario.metric}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold">{scenario.title}</p>
                  <p className="mt-2 text-sm text-zinc-300">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080812] p-10 shadow-2xl lg:col-span-7"
          >
            <ShowcaseContent scenario={scenarios[activeIndex]} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseContent({ scenario }) {
  const fieldId = useId();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-violet-200/70">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 text-lg">⚙️</span>
        {scenario.tag} workflow
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Steps</p>
          <ol className="mt-3 space-y-3 text-sm text-zinc-300">
            <li>1. Ingest assets & moodboard references.</li>
            <li>2. Flowforge suggests lighting, styling, and copy.</li>
            <li>3. Approve variants, publish to channels instantly.</li>
          </ol>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Impact</p>
          <p className="mt-3 text-lg font-semibold text-white">{scenario.metric} over legacy tools</p>
          <p className="mt-2 text-sm text-zinc-300">
            Teams highlight faster approvals, consistent brand guardrails, and predictable campaign velocity.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500" id={fieldId}>
          Instant export setup
        </p>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" aria-labelledby={fieldId}>
          <label className="sr-only" htmlFor={`${fieldId}-input`}>
            Email address
          </label>
          <input
            id={`${fieldId}-input`}
            type="email"
            placeholder="your@brand.com"
            className="flex-1 rounded-xl border border-white/10 bg-[#0b0b15] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
            autoComplete="email"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold"
          >
            Send me the launch kit
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Workflow                                 */
/* -------------------------------------------------------------------------- */

function Workflow() {
  const steps = [
    {
      title: "Import",
      body: "Drag in raw assets, choose tone, and lock your brand kit in seconds.",
      icon: "📥",
    },
    {
      title: "Collaborate",
      body: "Invite growth, merchandising, and legal to comment directly on assets.",
      icon: "🧑‍🤝‍🧑",
    },
    {
      title: "Launch",
      body: "Approve versions, route to channels, and measure performance in real time.",
      icon: "🚀",
    },
  ];

  return (
    <section className="relative z-10 px-6 py-32 md:px-12" aria-label="Workflow">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black md:text-5xl">A platform your entire team loves</h2>
          <p className="mt-4 text-lg text-zinc-400">
            Every plan includes granular permissions, brand guardrails, and performance insights.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20 text-2xl">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-zinc-300">{step.body}</p>
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5 opacity-0 transition group-hover:opacity-100" aria-hidden />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Social proof                              */
/* -------------------------------------------------------------------------- */

function SocialProof() {
  const quotes = [
    {
      quote: "Flowforge let us ship a full skincare launch with 18 SKUs in 3 weeks. Unreal velocity.",
      author: "Morgan Lee",
      role: "Director of Creative, Halo Labs",
    },
    {
      quote: "Our PDP conversion jumped 52% after rolling out AI try-on. Customers finally see themselves in the brand.",
      author: "Priya Patel",
      role: "VP Ecommerce, Antheia",
    },
    {
      quote: "We sunset two agencies and still ship more campaigns. The approvals dashboard is a dream.",
      author: "Jamal Rivers",
      role: "Head of Growth, Northwind",
    },
  ];

  return (
    <section className="relative z-10 px-6 py-28 md:px-12" aria-label="Testimonials">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black md:text-5xl">Trusted by modern commerce teams</h2>
          <p className="mt-4 text-lg text-zinc-400">
            Built for brands scaling from launch to category leader.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {quotes.map((item, index) => (
            <motion.figure
              key={item.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 text-left"
            >
              <blockquote className="text-lg leading-relaxed text-zinc-200">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm text-zinc-400">
                <span className="font-semibold text-white">{item.author}</span>
                <span className="block text-xs uppercase tracking-[0.3em] text-zinc-500">{item.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                     FAQ                                    */
/* -------------------------------------------------------------------------- */

function FAQ() {
  const items = [
    {
      question: "How fast can we launch our first campaign?",
      answer:
        "Teams typically ship their first automated campaign within 48 hours. Import assets, lock your guardrails, invite reviewers, and you’re live.",
    },
    {
      question: "Does Flowforge replace our designers?",
      answer:
        "No—Flowforge removes repetitive production tasks so designers focus on storytelling, motion, and experimentation. You stay in control of every asset before publish.",
    },
    {
      question: "Which integrations are included?",
      answer:
        "Shopify, Salesforce Commerce, Klaviyo, Meta Ads Manager, Google Merchant Center, TikTok, Amazon Advertising, and direct S3 exports are available on all plans.",
    },
    {
      question: "Is the platform secure and brand safe?",
      answer:
        "Yes. SOC 2 Type II compliance, SSO, granular permissions, and watermarking ensure assets stay compliant across regions and teams.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative z-10 px-6 py-28 md:px-12" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-black md:text-5xl">Answers for your procurement team</h2>
          <p className="mt-4 text-lg text-zinc-400">Everything you need to evaluate Flowforge for your organization.</p>
        </motion.div>

        <div className="mt-12 space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.details
                key={item.question}
                open={isOpen}
                onClick={(event) => {
                  event.preventDefault();
                  setOpenIndex(isOpen ? -1 : index);
                }}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-lg font-medium">
                  {item.question}
                  <span className="text-sm text-violet-200">{isOpen ? "−" : "+"}</span>
                </summary>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                  className="px-6 pb-6 text-base leading-relaxed text-zinc-300"
                >
                  {item.answer}
                </motion.div>
              </motion.details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Final CTA                                */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="relative z-10 px-6 pb-32 md:px-12" aria-label="Call to action">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-5xl"
      >
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-violet-700/25 via-[#0b0b16] to-fuchsia-700/25 p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_60%)]" aria-hidden />
          <div className="relative">
            <h2 className="text-4xl font-black md:text-5xl">Ready to ship your next launch in record time?</h2>
            <p className="mt-4 text-lg text-zinc-200">
              Join 2,400+ brands using Flowforge to design, collaborate, and publish unforgettable product experiences.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PrimaryButton href="#get-started">
                Claim your onboarding session
                <ArrowIcon />
              </PrimaryButton>
              <SecondaryButton href="/pricing">Compare plans</SecondaryButton>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500">
              No credit card • SOC 2 Type II • Global CDN
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Floating CTA                              */
/* -------------------------------------------------------------------------- */

function FloatingCTA() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      setVisible(window.scrollY > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 100 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-6 right-6 z-50 md:hidden"
    >
      <motion.a
        href="#get-started"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 font-semibold shadow-2xl"
      >
        Start now <ArrowIcon />
      </motion.a>
    </motion.div>
  );
}
