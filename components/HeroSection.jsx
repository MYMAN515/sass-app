import React, { useMemo } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggered = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const stats = [
  { label: "Avg. conversion lift", value: "+28%" },
  { label: "Photos generated", value: "12M" },
  { label: "Campaign launch time", value: "2hrs" },
];

const features = [
  {
    title: "AI Product Studio",
    description: "Generate lifestyle-ready imagery that adapts to every audience and platform in seconds.",
    icon: "🎨",
    accent: "from-violet-500/80 to-fuchsia-500/80",
  },
  {
    title: "Smart Brand Controls",
    description: "Upload brand kits once and let our guardrails keep every asset perfectly on-brand.",
    icon: "🛡️",
    accent: "from-blue-500/80 to-indigo-500/80",
  },
  {
    title: "Omnichannel Delivery",
    description: "Push finished assets directly to Shopify, Klaviyo, Meta, and more with one click.",
    icon: "🚀",
    accent: "from-emerald-500/80 to-teal-500/80",
  },
];

const workflow = [
  {
    step: "01",
    title: "Drop in a product",
    description: "Upload a photo or pull from your catalog. Our background removal and lighting engine handle the rest.",
  },
  {
    step: "02",
    title: "Choose your moment",
    description: "Select from curated scenes, AI try-on, or instantly brief a new concept in natural language.",
  },
  {
    step: "03",
    title: "Publish everywhere",
    description: "Approve, resize, and publish across ads, PDPs, emails, and social without leaving the studio.",
  },
];

const testimonials = [
  {
    quote:
      "We shipped our summer collection with 70% fewer reshoots. The campaign paid for the platform in the first week.",
    name: "Alexa Moore",
    role: "VP Marketing, Northwind",
    avatar: "/models/m02.webp",
  },
  {
    quote:
      "Try-on finally looks believable. Our customers spend longer on page and we cut our returns by double digits.",
    name: "Priya Patel",
    role: "Head of E-commerce, Lumen",
    avatar: "/models/m05.webp",
  },
];

const faqs = [
  {
    question: "Can I keep my brand safe?",
    answer:
      "Absolutely. Upload fonts, colors, and usage rules once. Every render respects your guardrails, and approvals are logged for compliance.",
  },
  {
    question: "What platforms do you integrate with?",
    answer:
      "We connect with Shopify, WooCommerce, Klaviyo, Meta Ads, Google Ads, TikTok, and can export to any custom DAM via API.",
  },
  {
    question: "How does billing work?",
    answer:
      "Start free with 30 renders. Upgrade to scale with unlimited seats, collaborative workspaces, and enterprise support.",
  },
];

const logos = [
  "Acme", "Northwind", "Lumina", "Vertex", "Harbor", "Nova",
];

const gallery = [
  { title: "Lifestyle Scenes", description: "Curated, on-trend backgrounds tailored to your brand voice." },
  { title: "AI Model Try-On", description: "See every fit on inclusive body types with one upload." },
  { title: "Campaign Composer", description: "Launch on-brand ads and emails in the same workspace." },
];

export default function HeroSection() {
  const renderLogos = useMemo(
    () =>
      logos.map((logo) => (
        <motion.li
          key={logo}
          variants={fadeUp}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-300 shadow-sm shadow-black/5"
        >
          {logo}
        </motion.li>
      )),
    []
  );

  return (
    <main className="relative w-full overflow-hidden bg-[#06050d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.4),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(6,182,212,0.35),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-24 px-6 pb-32 pt-24 md:px-10 lg:pt-32">
        <HeroHeader />
        <SocialProof logos={renderLogos} />
        <Stats />
        <FeatureGrid />
        <Workflow />
        <Gallery />
        <Testimonials />
        <FAQ />
        <CTA />
      </div>
    </main>
  );
}

function HeroHeader() {
  return (
    <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
        <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-violet-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          Launch faster with the Adaptive Content Engine
        </motion.div>
        <motion.h1
          variants={fadeUp}
          custom={0.1}
          className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl"
        >
          The new standard for product storytelling
        </motion.h1>
        <motion.p
          variants={fadeUp}
          custom={0.2}
          className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300 md:text-xl"
        >
          Generate high-converting visuals, AI try-on experiences, and launch-ready campaigns from a single collaborative studio.
        </motion.p>
        <motion.div
          variants={fadeUp}
          custom={0.3}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-95"
          >
            Start creating free
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            Explore the interactive demo
          </a>
        </motion.div>
        <motion.div variants={fadeUp} custom={0.4} className="mt-8 flex items-center gap-4 text-sm text-zinc-400">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((index) => (
              <span
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white"
              >
                {index}
              </span>
            ))}
          </div>
          <p>
            Join 2,400+ teams accelerating launches with adaptive product storytelling.
          </p>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, rotateX: -15 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-1 shadow-2xl shadow-black/40">
          <div className="relative rounded-[28px] bg-[#0b0a18]/95 p-8">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span className="font-semibold text-violet-200">Live campaign</span>
              <span>Syncing…</span>
            </div>
            <div className="mt-6 space-y-6">
              {gallery.map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>{item.title}</span>
                    <span className="text-xs text-emerald-300">Synced</span>
                  </div>
                  <p className="mt-3 text-base font-medium text-white">{item.description}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 p-5 text-sm text-zinc-300">
              <p className="font-semibold text-white">Adaptive insights</p>
              <p className="mt-2 leading-relaxed">
                AI recommends new creative concepts based on channel performance. Approve with a tap to launch.
              </p>
            </div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#0b0a18]/90 px-5 py-3 text-sm text-zinc-300 shadow-xl"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Automations active · 12 destinations synced
        </motion.div>
      </motion.div>
    </div>
  );
}

function SocialProof({ logos }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggered}
      className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur"
    >
      <motion.p variants={fadeUp} className="text-center text-xs uppercase tracking-[0.3em] text-zinc-400">
        powering launches for
      </motion.p>
      <motion.ul
        variants={staggered}
        className="mt-6 flex flex-wrap items-center justify-center gap-4"
      >
        {logos}
      </motion.ul>
    </motion.section>
  );
}

function Stats() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggered}
      className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/0 p-8 md:grid-cols-3"
    >
      {stats.map((item, index) => (
        <motion.div key={item.label} variants={fadeUp} custom={index * 0.1} className="rounded-2xl border border-white/5 bg-[#0d0c1d]/80 p-6 shadow-inner shadow-black/40">
          <p className="text-sm uppercase tracking-widest text-zinc-400">{item.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white md:text-4xl">{item.value}</p>
        </motion.div>
      ))}
    </motion.section>
  );
}

function FeatureGrid() {
  return (
    <motion.section
      id="features"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggered}
      className="grid gap-6 lg:grid-cols-3"
    >
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0a18]/90 p-8 shadow-lg shadow-black/30"
        >
          <div className={`absolute -right-20 -top-20 h-52 w-52 rounded-full bg-gradient-to-br ${feature.accent} blur-3xl opacity-60`} aria-hidden />
          <div className="relative z-10">
            <span className="text-3xl" role="img" aria-hidden>
              {feature.icon}
            </span>
            <h3 className="mt-5 text-2xl font-semibold">{feature.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-zinc-300">{feature.description}</p>
            <a
              href="#"
              className="mt-8 inline-flex items-center text-sm font-semibold text-violet-200"
            >
              Learn more →
            </a>
          </div>
        </motion.div>
      ))}
    </motion.section>
  );
}

function Workflow() {
  return (
    <motion.section
      id="workflow"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="rounded-[40px] border border-white/10 bg-gradient-to-br from-violet-600/10 via-transparent to-sky-500/10 p-10"
    >
      <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-200">workflow</p>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            Brief. Approve. Publish. In one canvas.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            Collaborate with merchandisers, creatives, and growth teams inside a shared timeline. Every change is versioned with instant approvals.
          </p>
        </div>
        <div className="grid flex-1 gap-6 md:grid-cols-3">
          {workflow.map((item) => (
            <div key={item.step} className="rounded-3xl border border-white/10 bg-[#080717]/80 p-6">
              <p className="text-sm font-semibold text-violet-300">{item.step}</p>
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function Gallery() {
  return (
    <motion.section
      id="demo"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="rounded-[36px] border border-white/10 bg-[#080717]/90 p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-200">interactive demo</p>
        <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
          Preview every channel before you publish
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          View creative across PDPs, ads, email blocks, and social in a single adaptive preview. Adjust copy, aspect ratio, and overlays instantly.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {gallery.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent p-1">
        <div className="rounded-[32px] bg-[#0b0a18]/95 p-8 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Performance lift</span>
            <span>Last 30 days</span>
          </div>
          <div className="mt-8 grid gap-4">
            {[18, 24, 31].map((value, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>{["PDP", "Paid Social", "Email" ][index]}</span>
                  <span className="text-emerald-300">+{value}%</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
            <p className="font-semibold text-white">Autopilot</p>
            <p className="mt-2 leading-relaxed">
              Let AI adjust offers, copy, and creative per channel. Approvals stay in your control with shared team notes.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Testimonials() {
  return (
    <motion.section
      id="stories"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggered}
      className="grid gap-6 md:grid-cols-2"
    >
      {testimonials.map((testimonial) => (
        <motion.article
          key={testimonial.name}
          variants={fadeUp}
          className="flex h-full flex-col gap-6 rounded-[32px] border border-white/10 bg-[#080717]/85 p-8 shadow-xl"
        >
          <p className="text-lg leading-relaxed text-zinc-200">“{testimonial.quote}”</p>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-white/10">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-base font-semibold text-white">{testimonial.name}</p>
              <p className="text-sm text-zinc-400">{testimonial.role}</p>
            </div>
          </div>
        </motion.article>
      ))}
    </motion.section>
  );
}

function FAQ() {
  return (
    <motion.section
      id="how"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      variants={fadeUp}
      className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-violet-200">FAQ</p>
        <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Everything you need to launch with confidence</h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Transparent pricing, enterprise-ready security, and 24/7 creative support built for teams that ship fast.
        </p>
      </div>
      <div className="space-y-6">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-3xl border border-white/10 bg-[#080717]/85 p-6"
            open={faq.question === faqs[0].question}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold text-white">
              {faq.question}
              <span className="text-xl transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 text-base leading-relaxed text-zinc-300">{faq.answer}</p>
          </details>
        ))}
      </div>
    </motion.section>
  );
}

function CTA() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-140px" }}
      variants={fadeUp}
      className="overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-sky-500/10 p-12 text-center"
    >
      <motion.h2 variants={fadeUp} className="text-3xl font-semibold md:text-4xl">
        Ready to design the future of your product storytelling?
      </motion.h2>
      <motion.p variants={fadeUp} custom={0.1} className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-200">
        Get full access to the Adaptive Content Engine for 14 days. Import your catalog, collaborate with your team, and launch your next campaign in record time.
      </motion.p>
      <motion.div variants={fadeUp} custom={0.2} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="/signup"
          className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#06050d] shadow-xl shadow-black/10 transition hover:bg-zinc-100"
        >
          Create your workspace
        </a>
        <a
          href="/pricing"
          className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          Compare plans
        </a>
      </motion.div>
      <motion.p variants={fadeUp} custom={0.3} className="mt-6 text-sm text-zinc-300">
        No credit card required · Cancel anytime · SOC 2 Type II compliant
      </motion.p>
    </motion.section>
  );
}
