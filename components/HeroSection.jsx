// File: app/tryone-landing/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/* ======================== MAIN PAGE ========================== */
export default function Page() {
  return (
    <main className="relative min-h-screen w-screen overflow-hidden bg-[#FCFCFF] text-[var(--ink)]">
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <ROICalculator />
      <UseCases />
      <FeaturesGrid />
      <Pricing />
      <IntegrationsSecurity />
      <FAQ />
      <FinalCTA />
      <GlobalStyles />
    </main>
  );
}

/* ======================== HERO ========================== */
function HeroSection() {
  const [img, setImg] = useState(null);
  const [enhanced, setEnhanced] = useState(false);

  return (
    <section className="relative grid min-h-[100svh] place-items-center px-5 py-10 md:grid-cols-2">
      <div className="z-10 max-w-lg space-y-4">
        <Badge>TryOne Cloud Studio</Badge>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
          Your product… wears itself!
        </h1>
        <p className="text-base text-[var(--ink)]/80">
          Try-On & Enhance your products in seconds — no photo sessions needed.
        </p>
        <div className="flex gap-3 pt-3">
          <PrimaryCTA href="#">Try a sample</PrimaryCTA>
          <GhostCTA href="#">Start free</GhostCTA>
        </div>
      </div>
      <div className="relative w-full max-w-xl">
        <ImageOrIllustration src={img} enhanced={enhanced} />
        <DropUpload onChange={setImg} />
      </div>
    </section>
  );
}

/* ======================== TRUST BAR ========================== */
function TrustBar() {
  return (
    <section className="grid place-items-center py-10">
      <div className="flex flex-wrap items-center justify-center gap-5">
        {"Shopify,PIM,DAM".split(",").map((logo) => (
          <span key={logo} className="rounded-lg border bg-white/70 px-4 py-2 text-sm font-semibold shadow-sm">
            {logo}
          </span>
        ))}
        <div className="flex gap-3 text-xs text-[var(--ink)]/70">
          <span>⏱ Faster</span>
          <span>💸 Cheaper</span>
          <span>📦 Scalable</span>
        </div>
      </div>
    </section>
  );
}

/* ======================== HOW IT WORKS ========================== */
function HowItWorks() {
  const steps = [
    { t: "Upload product", img: "" },
    { t: "Choose model/style", img: "" },
    { t: "Publish instantly", img: "" },
  ];
  return (
    <section className="grid place-items-center py-20">
      <div className="grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border bg-white/80 p-6 text-center shadow-sm">
            <div className="mb-3 h-32 w-full rounded-lg bg-[var(--lavender)]/30"></div>
            <p className="text-sm font-semibold">{s.t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================== ROI CALCULATOR ========================== */
function ROICalculator() {
  const [val, setVal] = useState(50);
  return (
    <section className="grid place-items-center py-20">
      <h2 className="text-3xl font-bold">ROI Calculator</h2>
      <input type="range" min="0" max="100" value={val} onChange={(e) => setVal(e.target.value)} className="my-6 w-64" />
      <div className="h-32 w-32 rounded-full border-8 border-[var(--mint)] grid place-items-center text-xl font-bold">
        {val}% Saved
      </div>
    </section>
  );
}

/* ======================== USE CASES ========================== */
function UseCases() {
  const tabs = ["Retail", "Marketplaces", "Agencies", "SMB"];
  const [active, setActive] = useState("Retail");
  return (
    <section className="py-20">
      <div className="flex justify-center gap-3 pb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActive(t)} className={`rounded-full px-4 py-2 text-sm font-semibold ${t === active ? "bg-[var(--lavender)]" : "bg-white/70"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid place-items-center text-center">
        <div className="h-40 w-72 rounded-xl bg-[var(--sky)]/30"></div>
        <p className="mt-4 text-sm">Value for {active}</p>
      </div>
    </section>
  );
}

/* ======================== FEATURES GRID ========================== */
function FeaturesGrid() {
  const features = ["Try-On", "Model Swap", "Fabric Preserve", "Short Videos"];
  return (
    <section className="py-20">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {features.map((f) => (
          <div key={f} className="rounded-xl border bg-white/70 p-4 text-center text-sm font-semibold hover:shadow-md">
            {f}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================== PRICING ========================== */
function Pricing() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {["Starter", "Pro", "Enterprise"].map((p) => (
          <div key={p} className="rounded-2xl border bg-white/80 p-6 text-center shadow-sm">
            <h3 className="text-xl font-bold">{p}</h3>
            <p className="mt-2 text-sm opacity-70">Cute pastel sticker here</p>
            <button className="mt-4 rounded-lg bg-[var(--peach)] px-4 py-2 font-semibold">Choose</button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================== INTEGRATIONS + SECURITY ========================== */
function IntegrationsSecurity() {
  return (
    <section className="grid place-items-center gap-6 py-20">
      <div className="flex flex-wrap gap-3">
        {"Shopify,TikTok,Meta,Woo".split(",").map((t) => (
          <span key={t} className="rounded-lg border bg-white/80 px-3 py-1 text-sm font-semibold">
            {t}
          </span>
        ))}
      </div>
      <div className="max-w-md rounded-xl border bg-white/80 p-6 text-center">
        <h3 className="text-lg font-bold">Security & Privacy</h3>
        <p className="text-sm opacity-70">We protect your data with enterprise standards.</p>
      </div>
    </section>
  );
}

/* ======================== FAQ ========================== */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "How fast is it?", a: "Try-On in seconds." },
    { q: "Do I need a credit card?", a: "No, free to start." },
  ];
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
      <div className="mx-auto max-w-xl divide-y">
        {faqs.map((f, i) => (
          <div key={i} className="py-3">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left font-semibold">
              {f.q}
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-sm opacity-70">
                  {f.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ======================== FINAL CTA ========================== */
function FinalCTA() {
  return (
    <section className="grid place-items-center gap-4 py-20 text-center">
      <h2 className="text-4xl font-bold">Start your free trial today</h2>
      <p className="text-sm opacity-70">No credit card required</p>
      <PrimaryCTA href="#">Get Started</PrimaryCTA>
      <GhostCTA href="#">Download Quality Guide</GhostCTA>
    </section>
  );
}

/* ======================== UI HELPERS ========================== */
function Badge({ children }) {
  return <span className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold">{children}</span>;
}

function PrimaryCTA({ href, children }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-[var(--lavender)] px-5 py-3 text-sm font-semibold shadow-sm transition hover:brightness-110">{children}</Link>;
}

function GhostCTA({ href, children }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-xl border border-[var(--ink)]/10 bg-white/70 px-5 py-3 text-sm font-semibold transition hover:bg-white">{children}</Link>;
}

function ImageOrIllustration({ src, enhanced }) {
  if (!src) return <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-[var(--lavender)] to-[var(--sky)]"></div>;
  return <img src={src} alt="Product preview" className={`aspect-video w-full rounded-xl object-cover ${enhanced ? "contrast-125" : "blur-sm"}`} />;
}

function DropUpload({ onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const onPick = () => inputRef.current?.click();
  const onFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      setBusy(false);
      onChange(String(reader.result));
    };
    reader.readAsDataURL(f);
  };
  return (
    <div className="mt-3 flex items-center gap-2">
      <button onClick={onPick} className="rounded-lg bg-[var(--butter)] px-3 py-1 text-xs font-semibold shadow-sm">Upload</button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {busy && <span className="text-xs text-[var(--ink)]/70">Processing…</span>}
    </div>
  );
}

/* ======================== GLOBAL STYLES ========================== */
function GlobalStyles() {
  return (
    <style jsx global>{`
      :root {
        --lavender: #C8B6FF;
        --sky: #BFE6FF;
        --mint: #CFF6E4;
        --peach: #FFDCCB;
        --butter: #FFF4C2;
        --ink: #1F2937;
      }
      body { font-family: Inter, sans-serif; }
    `}</style>
  );
}
