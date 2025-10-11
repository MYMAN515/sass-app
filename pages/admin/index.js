import { useMemo } from 'react';
import { ArrowUpRight, BarChart3, CreditCard, Package2, Sparkles, Users, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import { InsightsPanel, SuggestionPanel } from '@/components/dashboard/SmartPanels';

const metricChangeStyles = {
  up: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  down: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  steady: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
};

const activityColors = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
};

function KpiCard({ title, value, change, changeType = 'steady', icon: Icon, sublabel }) {
  const badgeClasses = metricChangeStyles[changeType] || metricChangeStyles.steady;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
      <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            <Icon className="h-4 w-4 text-zinc-300" />
            {title}
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
          {sublabel && <p className="mt-2 text-xs text-zinc-400">{sublabel}</p>}
        </div>
        {change && (
          <span className={`relative inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${badgeClasses}`}>
            <ArrowUpRight className={`h-3.5 w-3.5 ${changeType === 'down' ? 'rotate-180' : ''}`} />
            {change}
          </span>
        )}
      </div>
      <div className="relative mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-emerald-400/80 via-emerald-300/60 to-transparent" />
      </div>
    </div>
  );
}

function TrendChart({ title, description, data, gradientId }) {
  const metrics = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { points: '', area: '', max: 0, min: 0 };
    }

    const values = data.map((item) => item.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const normalizedRange = max - min || 1;
    const height = 140;
    const width = 640;
    const stepX = data.length > 1 ? width / (data.length - 1) : width;

    const points = data
      .map((point, index) => {
        const x = index * stepX;
        const y = height - ((point.value - min) / normalizedRange) * height;
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');

    const areaPath = `${points} L${width},${height} L0,${height} Z`;

    return {
      points,
      area: areaPath,
      max,
      min,
    };
  }, [data]);

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
      <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{title}</p>
          <p className="mt-2 text-sm text-zinc-300">{description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Last 12 weeks
        </div>
      </div>
      <div className="relative mt-8">
        <svg viewBox="0 0 640 180" className="h-48 w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
              <stop offset="80%" stopColor="rgba(16, 185, 129, 0)" />
            </linearGradient>
          </defs>
          <g transform="translate(0,20)">
            <path d="M0,140 L640,140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <path d="M0,80 L640,80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <path d="M0,20 L640,20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            {metrics.area && (
              <path d={metrics.area} fill={`url(#${gradientId})`} transform="translate(0,0)" />
            )}
            {metrics.points && (
              <path d={metrics.points} fill="none" stroke="rgba(16,185,129,0.9)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            )}
          </g>
        </svg>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-200">Peak</span> {metrics.max.toLocaleString()} •
          <span className="font-semibold text-zinc-200">Low</span> {metrics.min.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ orders }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Recent orders</p>
          <p className="mt-1 text-sm text-zinc-300">Monitor fulfilment progress for the latest purchases.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10">
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-6 py-3 text-left">Order</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-white/5">
                <td className="px-6 py-3 font-medium text-zinc-200">#{order.id}</td>
                <td className="px-6 py-3 text-zinc-300">{order.customer}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${order.statusBadge}`}>
                    <span className={`h-2 w-2 rounded-full ${order.statusDot}`} />
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-zinc-200">{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityFeed({ events }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">System activity</p>
          <p className="mt-1 text-sm text-zinc-300">Audit key operations across the platform.</p>
        </div>
        <Zap className="h-4 w-4 text-amber-300" />
      </div>
      <ul className="mt-6 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-200">
                <span className="font-semibold text-white">{event.title}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${activityColors[event.tone] || activityColors.info}`}>
                  {event.toneLabel}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{event.description}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-zinc-500">{event.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreatorLeaderboard({ creators }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Creator leaderboard</p>
          <p className="mt-1 text-sm text-zinc-300">Track the most effective campaign contributors.</p>
        </div>
        <Sparkles className="h-4 w-4 text-emerald-300" />
      </div>
      <div className="mt-6 space-y-4">
        {creators.map((creator) => (
          <div key={creator.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{creator.name}</p>
              <p className="text-xs text-zinc-400">{creator.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-300">{creator.metric}</p>
              <p className="text-xs text-zinc-500">{creator.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const metrics = [
    {
      id: 'revenue',
      title: 'Revenue generated',
      value: '$248.6k',
      change: '+18.4%',
      changeType: 'up',
      sublabel: 'Monthly recurring revenue across all stores',
      icon: CreditCard,
    },
    {
      id: 'customers',
      title: 'Active customers',
      value: '12,482',
      change: '+6.1%',
      changeType: 'up',
      sublabel: 'Users engaged with workflows in the last 30 days',
      icon: Users,
    },
    {
      id: 'orders',
      title: 'Orders fulfilled',
      value: '3,104',
      change: '-2.3%',
      changeType: 'down',
      sublabel: 'Completed shipments waiting for review',
      icon: Package2,
    },
    {
      id: 'conversion',
      title: 'Conversion rate',
      value: '4.82%',
      change: '+0.6%',
      changeType: 'up',
      sublabel: 'AI-assisted product listings vs manual',
      icon: BarChart3,
    },
  ];

  const revenueTrend = [
    { label: 'W1', value: 148 },
    { label: 'W2', value: 172 },
    { label: 'W3', value: 190 },
    { label: 'W4', value: 210 },
    { label: 'W5', value: 198 },
    { label: 'W6', value: 228 },
    { label: 'W7', value: 240 },
    { label: 'W8', value: 232 },
    { label: 'W9', value: 246 },
    { label: 'W10', value: 256 },
    { label: 'W11', value: 248 },
    { label: 'W12', value: 268 },
  ];

  const insights = {
    mood: 'ready',
    statusLabel: 'Optimized',
    metrics: [
      { id: 'efficiency', label: 'Workflow efficiency', value: '92%', hint: '+8% vs last month' },
      { id: 'timeSaved', label: 'Hours saved', value: '612h', hint: 'Automations deployed' },
      { id: 'uptime', label: 'Platform uptime', value: '99.9%', hint: 'Past 30 days' },
      { id: 'satisfaction', label: 'Customer CSAT', value: '4.7 / 5', hint: '1.3k survey responses' },
    ],
  };

  const suggestions = [
    {
      id: 'campaign',
      title: 'Launch Q2 lookbook campaign',
      description: 'Generate 12 hero assets using the lifestyle enhancer and schedule email sequences.',
      tone: 'info',
      actionLabel: 'Open campaign planner',
      onAction: () => {},
    },
    {
      id: 'pricing',
      title: 'Review enterprise pricing requests',
      description: 'Six opportunities are waiting in the pipeline with AI-drafted proposals.',
      tone: 'neutral',
      actionLabel: 'Open pipeline',
      onAction: () => {},
    },
    {
      id: 'training',
      title: 'Assign workflow training',
      description: 'Two new managers require onboarding to approve AI-suggested updates.',
      tone: 'error',
      actionLabel: 'View training kit',
      onAction: () => {},
    },
  ];

  const orders = [
    {
      id: '58112',
      customer: 'Eleanor Pena',
      status: 'Processing',
      statusBadge: 'border border-amber-400/30 bg-amber-500/10 text-amber-100',
      statusDot: 'bg-amber-400',
      total: '$842.90',
    },
    {
      id: '58103',
      customer: 'Floyd Miles',
      status: 'Completed',
      statusBadge: 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
      statusDot: 'bg-emerald-400',
      total: '$1,128.00',
    },
    {
      id: '58098',
      customer: 'Darlene Robertson',
      status: 'Awaiting approval',
      statusBadge: 'border border-sky-400/30 bg-sky-500/10 text-sky-100',
      statusDot: 'bg-sky-400',
      total: '$624.50',
    },
    {
      id: '58081',
      customer: 'Devon Lane',
      status: 'Failed payment',
      statusBadge: 'border border-rose-400/30 bg-rose-500/10 text-rose-100',
      statusDot: 'bg-rose-400',
      total: '$94.00',
    },
  ];

  const events = [
    {
      id: 'evt-1',
      title: 'Inventory sync completed',
      description: '2,341 SKUs reconciled with Shopify and Stripe integrations.',
      timestamp: 'Today • 09:24 UTC',
      tone: 'success',
      toneLabel: 'Stable',
    },
    {
      id: 'evt-2',
      title: 'New automation published',
      description: 'Seasonal retargeting flow deployed for EU region storefronts.',
      timestamp: 'Today • 07:16 UTC',
      tone: 'info',
      toneLabel: 'Update',
    },
    {
      id: 'evt-3',
      title: 'Payment retry required',
      description: 'Three enterprise invoices bounced due to outdated billing contacts.',
      timestamp: 'Yesterday • 18:41 UTC',
      tone: 'warning',
      toneLabel: 'Action needed',
    },
  ];

  const creators = [
    {
      id: 'cr-1',
      name: 'Courtney Henry',
      role: 'Brand Design Lead',
      metric: '214 assets shipped',
      trend: '+32% vs last cycle',
    },
    {
      id: 'cr-2',
      name: 'Guy Hawkins',
      role: 'AI Content Specialist',
      metric: '1.8k automations approved',
      trend: '+12% vs forecast',
    },
    {
      id: 'cr-3',
      name: 'Leslie Alexander',
      role: 'Marketplace Strategist',
      metric: '$86k influenced revenue',
      trend: '+21% vs Q1',
    },
  ];

  const gradientId = useMemo(() => `revenueGradient-${Math.random().toString(16).slice(2)}`, []);

  return (
    <Layout title="Admin Dashboard" className="bg-gradient-to-b from-[#070B13] via-[#0B111D] to-[#070A13]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 pb-20">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">Executive overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Operations Control Center</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300">
              Monitor real-time commerce health, track adoption of AI tooling, and orchestrate your team’s next moves
              from a single command surface.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select className="rounded-xl border border-white/10 bg-[#0F1624] px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/60">
              <option>Last 30 days</option>
              <option>Last quarter</option>
              <option>Year to date</option>
            </select>
            <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
              Download report
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <KpiCard key={metric.id} {...metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TrendChart
              title="Revenue trajectory"
              description="AI-generated placements continue to outpace manual campaign performance."
              data={revenueTrend}
              gradientId={gradientId}
            />
          </div>
          <div className="space-y-6">
            <InsightsPanel insights={insights} />
            <SuggestionPanel suggestions={suggestions} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <OrdersTable orders={orders} />
          <div className="grid gap-6">
            <ActivityFeed events={events} />
            <CreatorLeaderboard creators={creators} />
          </div>
        </section>
      </div>
    </Layout>
  );
}
