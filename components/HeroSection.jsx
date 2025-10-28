import React from "react";
import Link from "next/link";

const FEATURE_CARDS = [
  {
    title: "Background Houdini",
    description:
      "Our AI banishes messy laundry piles faster than you can say \"oops\".",
    punchline: "Abraca-drip-bruh.",
    color: "from-sky-200/80 to-white",
  },
  {
    title: "Lighting Therapist",
    description:
      "Turns gloomy basement shots into sun-kissed masterpieces without the sunburn.",
    punchline: "Vitamin D(igital) included.",
    color: "from-amber-200/80 to-white",
  },
  {
    title: "Copy Hype Machine",
    description:
      "Writes product descriptions so charming your products will start blushing.",
    punchline: "Side effects: increased add-to-cart giggles.",
    color: "from-rose-200/80 to-white",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Drop it like it's lukewarm",
    text: "Upload any photo. Yes, even the one with the cat photobombing in the back.",
  },
  {
    number: "02",
    title: "Let the bots flex",
    text: "AI polishes, brightens, and removes chaos. You get the credit. Naturally.",
  },
  {
    number: "03",
    title: "Ship it with swagger",
    text: "Export everywhere. Bask in the sales. Practice your humble-brag.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "\"We swapped our photo studio for this app and nobody noticed. Except our accountant, who cried happy tears.\"",
    name: "Jamie, CFO-ish",
  },
  {
    quote:
      "\"Our conversion rate jumped so high the graph now needs a seatbelt.\"",
    name: "Priya, Head of Chaos Control",
  },
  {
    quote:
      "\"Customers keep asking what sorcery we're using. We just wink and send them memes.\"",
    name: "Alex, Professional Wink-er",
  },
];

export default function HeroSection() {
  return (
    <main className="relative min-h-screen bg-[#f6f8fb] text-slate-900">
      <DecorativeBlur />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-28 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:pt-32">
      <div className="space-y-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-500 shadow-sm backdrop-blur">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          <span>New look. Same unreasonably good product photos.</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Product photos so fresh your mom will frame them.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Give your catalog a glow-up in seconds. Our AI erases clutter, adds perfect lighting, and writes punchy copy—all while cracking the occasional dad joke.
          </p>
          <ul className="grid gap-3 text-base text-slate-600 sm:grid-cols-2">
            <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
              <span className="mt-1 text-xl" aria-hidden>✨</span>
              <span>Polish 50 images before your latte gets lukewarm.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
              <span className="mt-1 text-xl" aria-hidden>🧼</span>
              <span>No more rogue socks in the background. Unless that's your brand.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
              <span className="mt-1 text-xl" aria-hidden>📝</span>
              <span>AI copy that sells without sounding like a robot trying too hard.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
              <span className="mt-1 text-xl" aria-hidden>🤣</span>
              <span>Bonus: built-in quips to keep your team awake in meetings.</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20"
          >
            Watch the 62-second demo
            <span aria-hidden>▶️</span>
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Trusted by 12,491 merchants who like nice photos and terrible puns.
        </p>
      </div>
      <div className="relative mt-16 flex items-center justify-center lg:mt-0">
        <div className="relative grid w-full max-w-md gap-6 rounded-3xl bg-white p-8 text-slate-700 shadow-xl shadow-slate-300/40">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Before ➡️ After</p>
            <div className="grid grid-cols-2 gap-4">
              <MockImage variant="before" />
              <MockImage variant="after" />
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Caption rewrite</p>
            <p className="mt-2 text-lg font-medium text-slate-800">
              "Meet the Cozy Cloud Hoodie: softer than your cat and 42% less judgy."
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Export ETA</p>
              <p className="text-lg font-semibold text-slate-900">07 seconds</p>
            </div>
            <span className="text-2xl" aria-hidden>🚀</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockImage({ variant }) {
  const isBefore = variant === "before";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-200/60" aria-hidden />
      <div className="relative flex h-32 items-center justify-center text-sm font-semibold text-slate-500">
        {isBefore ? "Before: basement vibes" : "After: magazine ready"}
      </div>
      <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {isBefore ? "Before" : "After"}
      </div>
    </div>
  );
}

function FeatureGrid() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why your product photos deserve a standing ovation</h2>
        <p className="mt-4 text-lg text-slate-600">
          Every feature is designed to make your team look genius-level brilliant without the caffeine jitters.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className={`group relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${card.color} p-7 shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="relative space-y-3">
              <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="text-base text-slate-600">{card.description}</p>
              <p className="text-sm font-medium text-slate-500">{card.punchline}</p>
            </div>
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl transition group-hover:scale-125" aria-hidden />
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="relative z-10 bg-white/80 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How it works (aka The Glow-Up Express)</h2>
          <p className="mt-4 text-lg text-slate-600">
            Three steps. Zero stress. 87% chance of celebratory chair dancing.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.number} className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-7 text-left shadow-sm">
              <span className="text-sm font-semibold uppercase tracking-widest text-slate-400">{step.number}</span>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-base text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Merchants who can now retire their ring lights</h2>
        <p className="mt-4 text-lg text-slate-600">
          Spoiler: they are very into what the AI is doing. Possibly too into it.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <figure key={testimonial.name} className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
            <blockquote className="text-base text-slate-600">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-auto pt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {testimonial.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="relative z-10 pb-32">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[3rem] border border-white/70 bg-white px-10 py-16 text-center shadow-2xl shadow-slate-300/50">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Ready to give your catalog a personality? (A good one!)</h2>
          <p className="text-lg text-slate-600">
            Start today and spend your saved photo-editing hours on hobbies. We recommend naps, croissants, or learning the kazoo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Jump in now
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20"
            >
              Compare plans
            </Link>
          </div>
          <p className="text-sm text-slate-500">Cancel anytime. Keep the jokes forever.</p>
        </div>
      </div>
    </section>
  );
}

function DecorativeBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-white opacity-60 blur-3xl" aria-hidden />
      <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-white opacity-60 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/90 via-white/40 to-transparent" aria-hidden />
    </div>
  );
}
