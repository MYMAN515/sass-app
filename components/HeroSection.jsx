import React from "react";

const HONEST_NUMBERS = [
  {
    value: "0",
    label: "Paying customers",
    description: "Yes, zero. Be the legendary first one and brag forever.",
  },
  {
    value: "1",
    label: "Sleep-deprived developer",
    description: "That's me. Hi. I promise to answer your emails faster than coffee kicks in.",
  },
  {
    value: "3",
    label: "Working demos",
    description: "Enhance images, rewrite listings, try on outfits. All real, all live, all over-caffeinated.",
  },
];

const FEATURES = [
  {
    icon: "🧠",
    title: "AI that admits it's AI",
    description:
      "No mysterious buzzwords. Click a button, get prettier product photos. It's like a ring light, minus the ring light.",
  },
  {
    icon: "🛒",
    title: "Storefront superpowers",
    description:
      "Rewrite descriptions, remove backgrounds, test outfits—all from one dashboard that doesn't judge your midnight uploads.",
  },
  {
    icon: "😂",
    title: "Comedy-as-a-service",
    description:
      "Built-in microcopy that actually sounds human. Your customers chuckle, you look clever, everyone wins (eventually).",
  },
];

const ROADMAP = [
  {
    status: "available now",
    title: "AI Photo Enhancer",
    description: "Upload. Wait a few seconds. Whisper \"whoa\" to yourself. Repeat.",
  },
  {
    status: "shipping soon",
    title: "Batch background zapping",
    description: "Because removing backgrounds one-by-one is a villain origin story.",
  },
  {
    status: "dreaming",
    title: "Voice-controlled listings",
    description: "Shout a product idea into your laptop. Watch it generate a listing before the neighbors complain.",
  },
];

const FAQ = [
  {
    question: "Is this legit or another vaporware demo?",
    answer:
      "It's legit. Screenshots are from the real product. The only imaginary thing is our marketing budget.",
  },
  {
    question: "Why brag about zero users?",
    answer:
      "Because honesty ages better than fake hockey-stick graphs. Also, you get VIP treatment when you're user #1.",
  },
  {
    question: "What's it cost?",
    answer:
      "Right now? Nothing. Free beta access while we collect feedback (and hopefully sleep).",
  },
];

export default function HeroSection() {
  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.2),_transparent_60%)]" />

      <Hero />
      <NumbersSection />
      <FeaturesSection />
      <RoadmapSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative z-10 px-6 pb-24 pt-24 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm uppercase tracking-[0.2em] text-cyan-200">
          <span className="text-lg">🤖</span>
          <span>AI STORE ASSISTANT 100% HONEST MODE</span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-8">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              The funniest way to glow-up your product photos without pretending we have 20k customers.
            </h1>
            <p className="text-lg text-slate-200 sm:text-xl">
              Welcome to AI Store Assistant, the scrappy tool built in a caffeine-fueled apartment. It removes backgrounds,
              rewrites listings, tries outfits on ghost mannequins, and refuses to fabricate vanity metrics. Laugh now, convert later.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <Badge>🚫 No fake testimonials</Badge>
              <Badge>⚡ Real working demos</Badge>
              <Badge>📣 Founder support via frantic voice notes</Badge>
            </div>
            <div className="flex flex-col gap-4 pt-6 sm:flex-row">
              <a
                href="/tryon"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-cyan-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-[0_10px_35px_rgba(34,211,238,0.4)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Launch the demo
                <span aria-hidden>→</span>
              </a>
              <a
                href="#faq"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-400/40 px-8 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-50"
              >
                Why so honest?
              </a>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-700/60 bg-slate-900/60 p-8 shadow-[0_25px_70px_rgba(15,23,42,0.55)]">
            <div className="absolute -top-6 right-6 inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg">
              <span className="text-xl">✨</span>
              <span>Actual screenshot</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-50">Glow-up product preview</h2>
              <p className="text-slate-300">
                Drag in a photo, select an aesthetic, and watch the AI sprinkle tasteful chaos. The interface is minimal on purpose:
                fewer knobs, more magic.
              </p>
              <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-6">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                  <span>before</span>
                  <span>after</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80')] bg-cover bg-center" />
                  <div className="aspect-square rounded-2xl bg-[url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80')] bg-cover bg-center" />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Yep, these are stock photos. That's because your products aren't here yet. Let's fix that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumbersSection() {
  return (
    <section className="relative z-10 border-y border-slate-800/70 bg-slate-950/80 px-6 py-16 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3">
        {HONEST_NUMBERS.map(({ value, label, description }) => (
          <div key={label} className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-inner">
            <div className="text-4xl font-black text-cyan-300">{value}</div>
            <div className="text-sm uppercase tracking-wide text-slate-400">{label}</div>
            <p className="text-sm text-slate-300">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="relative z-10 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Feature tour with zero fluff</h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          These are the things working right now. No roadmap smoke, no stealth beta. Click around the dashboard and you'll find them
          behaving exactly like we claim here.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon, title, description }) => (
            <div key={title} className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 transition">
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-6 text-xl font-semibold text-slate-50">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
              <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_65%)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section className="relative z-10 border-y border-slate-800/70 bg-slate-950/80 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Roadmap without the corporate shrug</h2>
          <p className="max-w-xl text-base text-slate-300">
            The plan is public because accountability keeps me from procrastinating with 17th-century sea shanties on YouTube.
          </p>
        </div>
        <div className="mt-12 space-y-6">
          {ROADMAP.map(({ status, title, description }) => (
            <div key={title} className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {status}
                </span>
                <h3 className="text-2xl font-semibold text-slate-50">{title}</h3>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="relative z-10 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Radically honest FAQ</h2>
        <p className="mt-4 text-lg text-slate-300">
          Ask anything. If the answer sounds suspiciously polished, assume I typed it at 3 a.m. and send help.
        </p>
        <div className="mt-10 space-y-6">
          {FAQ.map(({ question, answer }) => (
            <div key={question} className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold text-slate-50">{question}</h3>
              <p className="mt-3 text-sm text-slate-300">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative z-10 px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-cyan-400/40 bg-gradient-to-br from-cyan-400 via-slate-900 to-violet-500 p-1 shadow-[0_25px_70px_rgba(14,116,144,0.5)]">
        <div className="rounded-[30px] bg-slate-950/90 p-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">This is your sign</p>
          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Be the hero who makes our "0 users" stat obsolete.
          </h2>
          <p className="mt-4 text-base text-slate-200">
            Jump into the beta, send brutally honest feedback, and watch features roll out at cartoonish speed. Worst case scenario:
            you get prettier photos for free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3 text-base font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02]"
            >
              Sign up (free beta)
              <span aria-hidden>🚀</span>
            </a>
            <a
              href="mailto:founder@aistoreassistant.com"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 px-8 py-3 text-base font-semibold text-white transition hover:border-white"
            >
              Pitch me your wild ideas
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Built with love, sarcasm, and Tailwind. No venture capitalists were harmed in the making of this landing page.
          </p>
        </div>
      </div>
    </section>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-slate-900/70 px-4 py-1">
      {children}
    </span>
  );
}
