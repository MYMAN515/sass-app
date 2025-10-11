import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Globe,
  Package2,
  RefreshCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Layout from '@/components/Layout';
import { InsightsPanel, SuggestionPanel } from '@/components/dashboard/SmartPanels';
import { buildDashboardSnapshot, buildFallbackSnapshot } from '@/lib/adminDashboard';

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

const metricIconMap = {
  CreditCard,
  Users,
  Package2,
  BarChart3,
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
          <span
            className={`relative inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${badgeClasses}`}
          >
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
            {metrics.area && <path d={metrics.area} fill={`url(#${gradientId})`} transform="translate(0,0)" />}
            {metrics.points && (
              <path
                d={metrics.points}
                fill="none"
                stroke="rgba(16,185,129,0.9)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
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
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="flex h-full flex-col justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-zinc-400">
        No orders to display.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Recent orders</p>
          <p className="mt-1 text-sm text-zinc-300">Monitor fulfilment progress for the latest purchases.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
        >
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
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                      order.statusBadge || 'border-white/20 bg-white/5 text-zinc-200'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${order.statusDot || 'bg-zinc-200'}`} />
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
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
        No activity recorded in the last 48 hours.
      </div>
    );
  }

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
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                    activityColors[event.tone] || activityColors.info
                  }`}
                >
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
  if (!Array.isArray(creators) || creators.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
        No contributor metrics available yet.
      </div>
    );
  }

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
          <div
            key={creator.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
          >
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

function SecurityPanel({ data }) {
  if (!data) return null;
  const topRisks = Array.isArray(data.topRisks) ? data.topRisks : [];
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  return (
    <div className="rounded-3xl border border-emerald-400/20 bg-white/[0.03] p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Security posture</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-white">{data.postureScore}</span>
            <span className="text-xs text-emerald-300/80">risk index</span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            {data.incidentFreeDays ? `${data.incidentFreeDays} days since last incident` : 'Monitoring core controls'}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>
      <dl className="mt-6 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">MFA coverage</dt>
          <dd className="mt-1 text-base font-semibold text-white">{data.mfaCoverage}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Privileged accounts</dt>
          <dd className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
            {data.privilegedAccounts}
            <UserCheck className="h-4 w-4 text-emerald-300" />
          </dd>
        </div>
      </dl>
      {highlights.length > 0 && (
        <div className="mt-6 space-y-3">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
            >
              <div className="font-semibold text-white">{highlight.label}</div>
              {highlight.detail && <p className="mt-1 text-xs text-zinc-400">{highlight.detail}</p>}
            </div>
          ))}
        </div>
      )}
      {topRisks.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Active risks</p>
          <ul className="mt-3 space-y-2">
            {topRisks.map((risk) => (
              <li
                key={risk.id}
                className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-50">{risk.title}</p>
                  <p className="text-xs text-amber-100/80">{risk.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {alerts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Security tasks</p>
          <ul className="mt-2 space-y-1.5">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-300" />
                <div>
                  <span className="font-semibold text-white">{alert.label}</span>
                  {alert.detail && <p className="text-zinc-400">{alert.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InfrastructurePanel({ data }) {
  if (!data) return null;
  const services = Array.isArray(data.services) ? data.services : [];
  const incidents = Array.isArray(data.incidents) ? data.incidents : [];

  return (
    <div className="rounded-3xl border border-sky-400/20 bg-white/[0.03] p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Platform resilience</p>
          <p className="mt-1 text-sm text-zinc-300">Real-time health across compute, inference, and delivery.</p>
        </div>
        <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3 text-sky-200">
          <Server className="h-6 w-6" />
        </div>
      </div>
      <dl className="mt-6 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Global uptime</dt>
          <dd className="mt-1 text-base font-semibold text-white">{data.uptime}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Average latency</dt>
          <dd className="mt-1 text-base font-semibold text-white">{data.avgLatency}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Queue depth</dt>
          <dd className="mt-1 text-base font-semibold text-white">{data.queueDepth}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Regions served</dt>
          <dd className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
            {data.regions}
            <Globe className="h-4 w-4 text-sky-300" />
          </dd>
        </div>
      </dl>
      {data.change && <p className="mt-4 text-xs text-sky-200/80">Latency trend {data.change}</p>}
      {services.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Critical services</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-200">
            {services.map((service) => (
              <li key={service.id} className="flex items-center justify-between">
                <span>{service.name}</span>
                <span className="text-xs text-emerald-300">{service.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {incidents.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
          {incidents.map((incident) => (
            <p key={incident.id} className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              {incident.title} • {incident.timestamp}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamPanel({ team, compliance }) {
  if (!team && !compliance) return null;
  const squads = Array.isArray(team?.squads) ? team.squads : [];
  const responders = Array.isArray(team?.responders) ? team.responders : [];
  const frameworks = Array.isArray(compliance?.frameworks) ? compliance.frameworks : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Operations readiness</p>
          <p className="mt-1 text-sm text-zinc-300">On-call coverage and compliance posture at a glance.</p>
        </div>
        <Sparkles className="h-5 w-5 text-emerald-300" />
      </div>
      {team && (
        <div className="mt-5 space-y-4 text-sm text-zinc-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-zinc-400">On-call lead</span>
            <span className="text-base font-semibold text-white">{team.onCallLead}</span>
            <span className="text-xs text-zinc-400">{team.coverage}</span>
          </div>
          {team.nextStandup && (
            <div>
              <span className="text-xs uppercase tracking-wide text-zinc-400">Next stand-up</span>
              <p className="text-base font-semibold text-white">{team.nextStandup}</p>
            </div>
          )}
          {squads.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Squad coverage</p>
              <ul className="mt-3 space-y-2">
                {squads.map((squad) => (
                  <li key={squad.id} className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-semibold text-white">{squad.name}</span>
                    <span className="text-zinc-400">
                      {squad.owner} • handoff in {squad.handoffIn}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {responders.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Primary responders</p>
              <ul className="mt-3 space-y-1 text-xs text-zinc-300">
                {responders.map((responder) => (
                  <li key={responder.id}>
                    <span className="font-semibold text-white">{responder.name}</span> — {responder.speciality}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {frameworks.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-300">
          <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">Compliance coverage</p>
          <ul className="mt-2 space-y-1">
            {frameworks.map((framework) => (
              <li key={framework} className="flex items-center gap-2 text-zinc-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                {framework}
              </li>
            ))}
          </ul>
          {compliance?.nextAudit && (
            <p className="mt-3 text-zinc-400">Next audit: {compliance.nextAudit}</p>
          )}
          {compliance?.controlsTested && (
            <p className="text-zinc-400">Controls validated: {compliance.controlsTested}</p>
          )}
          {compliance?.dataResidency && (
            <p className="mt-2 text-zinc-400">Data residency: {compliance.dataResidency}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage({ initialSnapshot, user, role }) {
  const [snapshot, setSnapshot] = useState(() => initialSnapshot || buildFallbackSnapshot());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const refreshController = useRef(null);

  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    const controller = new AbortController();
    refreshController.current?.abort();
    refreshController.current = controller;
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/overview', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Unable to refresh dashboard data.');
      }

      const payload = await response.json();
      if (payload && typeof payload === 'object') {
        setSnapshot(payload);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setErrorMessage(error.message || 'Failed to refresh dashboard data.');
      }
    } finally {
      setIsRefreshing(false);
      if (refreshController.current === controller) {
        refreshController.current = null;
      }
    }
  }, [isRefreshing]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      refreshController.current?.abort();
    };
  }, [refreshData]);

  const metrics = useMemo(() => {
    const baseMetrics = Array.isArray(snapshot?.metrics) ? snapshot.metrics : [];
    return baseMetrics.map((metric) => {
      const IconComponent = typeof metric.icon === 'string' ? metricIconMap[metric.icon] || Sparkles : metric.icon || Sparkles;
      return { ...metric, icon: IconComponent };
    });
  }, [snapshot?.metrics]);

  const revenueTrend = snapshot?.revenueTrend || [];
  const insights = snapshot?.insights;
  const suggestions = snapshot?.suggestions;
  const orders = snapshot?.orders || [];
  const events = snapshot?.events || [];
  const creators = snapshot?.creators || [];
  const security = snapshot?.security;
  const infrastructure = snapshot?.infrastructure;
  const compliance = snapshot?.compliance;
  const team = snapshot?.team;
  const warnings = snapshot?.meta?.warnings || [];
  const sourceLabel = snapshot?.meta?.source || 'fallback';

  const gradientId = useMemo(() => `revenueGradient-${Math.random().toString(16).slice(2)}`, []);

  const lastUpdatedLabel = useMemo(() => {
    const timestamp = snapshot?.meta?.generatedAt;
    if (!timestamp) return 'No refresh recorded';
    try {
      return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(timestamp));
    } catch (error) {
      return timestamp;
    }
  }, [snapshot?.meta?.generatedAt]);

  const displayName = user?.name || user?.email || 'Administrator';
  const displayRole = role ? role.toUpperCase() : 'ADMIN';

  return (
    <Layout title="Admin Dashboard" className="bg-gradient-to-b from-[#070B13] via-[#0B111D] to-[#070A13]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 pb-20">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400/80">Executive overview</p>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Operations Control Center</h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-300">
                Monitor real-time commerce health, track adoption of AI tooling, and orchestrate your team’s next moves from a single command surface.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                {displayRole}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                {displayName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <RefreshCcw className="h-3.5 w-3.5 text-sky-300" />
                Last refreshed {lastUpdatedLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Server className="h-3.5 w-3.5 text-sky-300" />
                Snapshot source: {sourceLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <select className="rounded-xl border border-white/10 bg-[#0F1624] px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/60">
              <option>Last 30 days</option>
              <option>Last quarter</option>
              <option>Year to date</option>
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRefreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing…' : 'Refresh data'}
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                Download report
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {errorMessage && (
          <div
            className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100"
            role="alert"
            aria-live="assertive"
          >
            {errorMessage}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-xs text-amber-100">
            <p className="font-semibold uppercase tracking-[0.2em]">Warnings</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

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

        <section className="grid gap-6 xl:grid-cols-3">
          <SecurityPanel data={security} />
          <InfrastructurePanel data={infrastructure} />
          <TeamPanel team={team} compliance={compliance} />
        </section>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const supabase = createServerSupabaseClient(context);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!roleRow || !['admin', 'editor'].includes(roleRow.role)) {
    return {
      redirect: {
        destination: '/auth-failed?reason=forbidden',
        permanent: false,
      },
    };
  }

  const initialSnapshot = await buildDashboardSnapshot({
    supabase,
    userId: session.user.id,
    userEmail: session.user.email || '',
  });

  return {
    props: {
      initialSnapshot,
      role: roleRow.role,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || null,
      },
    },
  };
}
