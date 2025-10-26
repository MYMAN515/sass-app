import Image from 'next/image';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'Enhance product photos',
    description:
      'Clean up lighting, remove backgrounds, and export ready-to-use imagery without leaving your browser.',
    image: '/before-after-bottle.jpg',
  },
  {
    title: 'Rewrite product copy',
    description:
      'Turn rough bullet points into polished, on-brand descriptions that help shoppers understand the value fast.',
    image: '/mockup-ai.png',
  },
  {
    title: 'Virtual try-on for apparel',
    description:
      'Show clothing on diverse models instantly so customers can picture the fit before they buy.',
    image: '/models/m03.webp',
  },
];

const WORKFLOW = [
  {
    title: 'Upload what you have',
    description: 'Drop in product photos or paste the copy you already use. No templates required.',
  },
  {
    title: 'Choose the tool you need',
    description: 'Enhance images, rewrite descriptions, try on looks, or animate a product in just a few clicks.',
  },
  {
    title: 'Publish everywhere',
    description: 'Export clean assets sized for your storefront, marketplace, or social channels.',
  },
];

const HIGHLIGHTS = [
  {
    title: 'Works with your store',
    description: 'Compatible with Shopify, WooCommerce, Etsy, Amazon, and more.',
  },
  {
    title: 'Designed for teams',
    description: 'Invite collaborators, keep assets organized, and pick up where someone else left off.',
  },
  {
    title: 'Built for speed',
    description: 'Everything runs in the browser so you can move from idea to live listing in minutes.',
  },
];

export default function HeroSection() {
  return (
    <main className="bg-white text-slate-900">
      <Hero />
      <FeatureGallery />
      <Workflow />
      <Highlights />
      <FinalCallToAction />
    </main>
  );
}

function Hero() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:py-24">
        <div className="w-full max-w-xl text-center lg:text-left">
          <span className="mb-4 inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-sm font-medium text-white">
            AI Store Assistant
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Show your products at their best without a studio or a copywriter
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            AI Store Assistant helps e-commerce teams polish visuals, rewrite descriptions, and showcase apparel on real models.
            Everything happens in one place so you can launch listings faster.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-700"
            >
              Start for free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-base font-medium text-slate-900 transition hover:border-slate-400 hover:text-slate-700"
            >
              View the dashboard
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-transparent to-slate-200" aria-hidden="true" />
          <div className="relative">
            <Image
              src="/ai-studio.png"
              width={900}
              height={640}
              alt="Screenshot of the AI Store Assistant workspace"
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGallery() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Everything your product team needs</h2>
        <p className="mt-4 text-lg text-slate-600">
          Choose the workflow that matches the task at hand. Each tool is ready to use with presets designed for online stores.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-56 w-full bg-slate-100">
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">How teams use AI Store Assistant</h2>
          <p className="mt-4 text-lg text-slate-600">
            Skip the long production cycle. Each project flows from import to publish without switching tabs or tools.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {WORKFLOW.map((step, index) => (
            <div key={step.title} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm">
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlights() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            A calm workspace built for online retail
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every screen keeps the focus on your products. The interface stays light, so your team can move quickly and stay in sync.
          </p>
        </div>
        <div className="lg:col-span-2 grid gap-6">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="border-t border-slate-200 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-16 text-center sm:text-left lg:flex-row">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to list your next product?</h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Create an account and see how quickly you can prepare polished visuals and copy for your storefront.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-200"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
