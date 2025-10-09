import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const featureHighlights = [
  {
    title: "AI Photo Studio",
    description:
      "Upload any product shot and watch it transform into scroll-stopping, on-brand imagery in seconds.",
    icon: "✨",
  },
  {
    title: "Instant Copy Rewrite",
    description:
      "Turn rough descriptions into polished, conversion-ready copy tailored to every marketplace.",
    icon: "📝",
  },
  {
    title: "Virtual Try-On",
    description:
      "Preview apparel on diverse AI models to showcase fit, drape and styling without a photoshoot.",
    icon: "🧠",
  },
  {
    title: "Motion Templates",
    description:
      "Animate static images into short-form videos optimised for paid and organic campaigns.",
    icon: "🎬",
  },
];

const workflowSteps = [
  {
    title: "Upload",
    text: "Drop in existing product shots or raw supplier imagery — no complex setup required.",
  },
  {
    title: "Enhance",
    text: "Pick a look or prompt, then let AI remove backgrounds, add lighting and clean imperfections.",
  },
  {
    title: "Enrich",
    text: "Auto-generate compelling descriptions, social captions and bullet points with brand voice controls.",
  },
  {
    title: "Publish",
    text: "Export assets in marketplace-ready sizes or send them directly to Shopify, Klaviyo and Meta.",
  },
];

const testimonials = [
  {
    quote:
      "We replaced three different tools with AI Store Assistant. Listings go live twice as fast and look infinitely better.",
    name: "Camille Hart",
    role: "Head of E‑commerce, Lumen & Loom",
  },
  {
    quote:
      "Our creative team now spends time on strategy instead of retouching. The quality is studio-grade every time.",
    name: "Josh Patel",
    role: "Creative Director, Northwave Supply",
  },
];

const faqs = [
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Start with 3 free renders, 5 copy rewrites and 1 try-on credit to experience the full workflow before upgrading.",
  },
  {
    question: "Can I use my brand guidelines?",
    answer:
      "Upload colour palettes, typography and tone of voice preferences so every asset matches your brand system automatically.",
  },
  {
    question: "Do you support team collaboration?",
    answer:
      "Invite unlimited teammates, assign roles and keep every asset, preset and prompt synced across departments.",
  },
];

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-[#05070d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(103,58,183,0.28),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-fuchsia-500/20 to-transparent blur-3xl" aria-hidden />

      <HeroHeader />
      <FeatureOverview />
      <Workflow />
      <ExperienceShowcase />
      <TestimonialSection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}

function HeroHeader() {
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-28 sm:pt-32 md:px-10 lg:flex-row lg:items-center lg:gap-20">
      <div className="flex-1">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-fuchsia-200/90">
            <span aria-hidden>⚡</span>
            AI Store Assistant
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Give every product page a full creative team — instantly.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Generate magazine-ready visuals, compelling copy and try-on experiences for your e-commerce catalogue in one collaborative platform.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <PrimaryButton href="/login">Start free trial</PrimaryButton>
          <SecondaryButton href="#workflow">See how it works</SecondaryButton>
        </motion.div>

        <motion.dl
          className="mt-12 grid max-w-2xl grid-cols-2 gap-8 text-left sm:grid-cols-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Stat label="Avg. time saved" value="2.3 hrs" />
          <Stat label="Assets exported" value="4.8M" />
          <Stat label="Teams onboarded" value="2.4k" />
          <Stat label="NPS" value="68" />
        </motion.dl>
      </div>

      <motion.div
        className="relative flex flex-1 justify-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#070a16]/70 shadow-[0_30px_80px_rgba(123,97,255,0.35)] backdrop-blur">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-fuchsia-500/40 to-transparent" aria-hidden />
          <Image
            src="/hero-image.png"
            alt="AI Store Assistant dashboard"
            width={880}
            height={740}
            className="h-auto w-full"
            priority
          />
          <div className="border-t border-white/10 bg-black/20 px-6 py-5 text-sm text-slate-300">
            Smart presets, prompt history and seamless exports for every channel.
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function FeatureOverview() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Everything you need to launch beautiful listings</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {featureHighlights.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/5 bg-[#05070d]/70 p-6">
              <div className="flex items-center gap-3 text-fuchsia-200">
                <span className="text-2xl" aria-hidden>
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ship a full marketplace listing in under five minutes.</h2>
          <p className="mt-4 text-base text-slate-300">
            AI Store Assistant is built for e-commerce operators that need to move fast without compromising quality. Bring assets, prompts and teams together so campaigns launch on time.
          </p>
          <div className="mt-10 space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/5 bg-[#070a16]/70 p-6">
                <span className="text-sm font-semibold uppercase tracking-wide text-fuchsia-200/90">Step {index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -left-10 hidden h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl lg:block" aria-hidden />
          <div className="rounded-3xl border border-white/10 bg-[#05070d]/80 p-6 backdrop-blur">
            <div className="grid gap-6">
              <MediaCard
                title="Background Enhancer"
                description="Remove distractions, balance lighting and add branded colour stories in one click."
                image="/clean-studio.webp"
              />
              <MediaCard
                title="Try-On Preview"
                description="Swap models to reflect your audience, adjust poses and export lifestyle-ready photography."
                image="/lifestyle.webp"
              />
              <MediaCard
                title="Copy Composer"
                description="Generate product detail pages, bullet points and campaign headlines with attribution-ready data."
                image="/mockup-ai.png"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceShowcase() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Purpose-built for omnichannel commerce teams</h2>
          <p className="text-base text-slate-300">
            Whether you are launching on Shopify, Amazon or TikTok Shop, AI Store Assistant keeps every visual and copy guideline in one place so your brand stays consistent everywhere.
          </p>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-fuchsia-300" aria-hidden>
                ✓
              </span>
              Preset export sizes for PDPs, hero banners, reels and ads.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-fuchsia-300" aria-hidden>
                ✓
              </span>
              Collaboration tools with approval workflows and shareable links.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-fuchsia-300" aria-hidden>
                ✓
              </span>
              Performance analytics highlighting which assets convert best.
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-4 text-xs uppercase tracking-wide text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Shopify</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Amazon</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Etsy</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Meta Ads</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Klaviyo</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-purple-500/10 to-transparent blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070a16]/70 shadow-2xl">
            <Image src="/ai-studio.png" alt="AI Store Assistant creative workflow" width={960} height={780} className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-10">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0f1e] via-[#0f1324] to-[#10152b] p-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Trusted by modern commerce teams</h2>
            <p className="mt-4 text-base text-slate-300">
              Fast-growing brands, agencies and marketplaces rely on AI Store Assistant to ship assets faster and drive higher conversion.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-widest text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1">Lifestyle</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Beauty</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Home</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Apparel</span>
          </div>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.name} className="rounded-2xl border border-white/5 bg-black/30 p-6 text-sm text-slate-300">
              <p className="text-base leading-relaxed text-slate-100">“{testimonial.quote}”</p>
              <footer className="mt-6 text-xs uppercase tracking-wide text-slate-400">
                {testimonial.name} · {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 text-left md:px-10">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Answers before you onboard</h2>
        <p className="mt-4 text-base text-slate-300">
          Everything you need to know about getting started with AI Store Assistant.
        </p>
      </div>
      <div className="mt-12 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-white/10 bg-[#05070d]/80 p-6">
            <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-28 text-center md:px-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-600/30 via-purple-600/20 to-indigo-600/30 p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]" aria-hidden />
        <div className="relative">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Ready to launch a high-converting store?</h2>
          <p className="mt-4 text-base text-slate-200">
            Join thousands of product teams scaling creative output without scaling headcount.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <PrimaryButton href="/login">Start creating free</PrimaryButton>
            <SecondaryButton href="/pricing">View pricing</SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrimaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(111,66,193,0.35)] transition hover:shadow-[0_25px_70px_rgba(111,66,193,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200"
    >
      {children}
    </Link>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dd className="text-2xl font-semibold text-white">{value}</dd>
      <dt className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</dt>
    </div>
  );
}

function MediaCard({ title, description, image }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#05070d]/80">
      <Image src={image} alt={title} width={640} height={420} className="h-40 w-full object-cover" />
      <div className="space-y-2 p-5">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </div>
  );
}
