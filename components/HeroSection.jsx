import Image from 'next/image';
import Link from 'next/link';

const FEATURE_LIST = [
  {
    title: 'Studio-ready backgrounds',
    description: 'Swap cluttered shots for clean, on-brand canvases without opening a design tool.',
  },
  {
    title: 'Realistic try-ons',
    description: 'Showcase how each product looks on real people to help shoppers feel confident.',
  },
  {
    title: 'Copy that sells',
    description: 'Generate clear product descriptions that focus on benefits instead of buzzwords.',
  },
];

const WORKFLOW_STEPS = [
  {
    title: 'Upload a product photo',
    detail: 'Drag in any image from your shoot or supplier catalog.',
  },
  {
    title: 'Pick a style or try-on',
    detail: 'Choose a scene, model, or prompt that fits your brand in seconds.',
  },
  {
    title: 'Publish everywhere',
    detail: 'Download ready-to-use assets or sync them straight to your storefront.',
  },
];

export default function HeroSection() {
  return (
    <main className="-mx-4 -mt-16 bg-white text-slate-900 md:-mx-10 lg:-mx-20">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-24 md:pb-32">
        <header className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Simple tools for modern product teams
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Put your products in the spotlight with AIStore
            </h1>
            <p className="text-lg text-slate-600">
              AIStore is the all-in-one workspace for polishing product images, creating realistic try-ons, and writing clear
              copy. No gimmicks—just the essentials you need to launch better listings faster.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-base font-medium text-slate-800 transition hover:border-slate-400 hover:text-slate-900"
              >
                View pricing
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {FEATURE_LIST.map((feature) => (
                <li key={feature.title} className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">{feature.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
            <div className="relative px-6 pb-6 pt-16">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">In-product view</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Create polished assets without leaving the dashboard</h2>
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image
                  src="/ai-studio.png"
                  alt="AIStore workspace showing before-and-after image editing"
                  width={1200}
                  height={900}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </header>
      </div>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Everything you need in one clean workspace</h2>
            <p className="mt-4 text-base text-slate-600">
              Switch between background cleanup, try-on generation, and copywriting with just a few clicks. AIStore keeps every
              edit organised so your team stays in sync and on schedule.
            </p>
            <ul className="mt-8 space-y-4">
              {WORKFLOW_STEPS.map((step) => (
                <li key={step.title} className="rounded-lg bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <Image
              src="/mockup-ai.png"
              alt="Example product listing created with AIStore"
              width={1200}
              height={800}
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">Built for teams that value clarity</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            We designed AIStore to be approachable on day one. Clear controls, predictable results, and export-ready files make it
            easy to ship new products without second-guessing the process.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tryon"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
            >
              Explore try-on studio
            </Link>
            <Link
              href="/remove-bg-studio"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-base font-medium text-slate-800 transition hover:border-slate-400 hover:text-slate-900"
            >
              Remove backgrounds instantly
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
