const FALLBACK_TEMPLATE = Object.freeze({
  metrics: [
    {
      id: 'revenue',
      title: 'Revenue generated',
      value: '$248.6k',
      change: '+18.4%',
      changeType: 'up',
      sublabel: 'Monthly recurring revenue across all stores',
      icon: 'CreditCard',
    },
    {
      id: 'customers',
      title: 'Active customers',
      value: '12,482',
      change: '+6.1%',
      changeType: 'up',
      sublabel: 'Users engaged with workflows in the last 30 days',
      icon: 'Users',
    },
    {
      id: 'orders',
      title: 'Orders fulfilled',
      value: '3,104',
      change: '-2.3%',
      changeType: 'down',
      sublabel: 'Completed shipments waiting for review',
      icon: 'Package2',
    },
    {
      id: 'conversion',
      title: 'Conversion rate',
      value: '4.82%',
      change: '+0.6%',
      changeType: 'up',
      sublabel: 'AI-assisted product listings vs manual',
      icon: 'BarChart3',
    },
  ],
  revenueTrend: [
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
  ],
  insights: {
    mood: 'ready',
    statusLabel: 'Optimized',
    metrics: [
      { id: 'efficiency', label: 'Workflow efficiency', value: '92%', hint: '+8% vs last month' },
      { id: 'timeSaved', label: 'Hours saved', value: '612h', hint: 'Automations deployed' },
      { id: 'uptime', label: 'Platform uptime', value: '99.9%', hint: 'Past 30 days' },
      { id: 'satisfaction', label: 'Customer CSAT', value: '4.7 / 5', hint: '1.3k survey responses' },
    ],
  },
  suggestions: [
    {
      id: 'campaign',
      title: 'Launch Q2 lookbook campaign',
      description: 'Generate 12 hero assets using the lifestyle enhancer and schedule email sequences.',
      tone: 'info',
      actionLabel: 'Open campaign planner',
    },
    {
      id: 'pricing',
      title: 'Review enterprise pricing requests',
      description: 'Six opportunities are waiting in the pipeline with AI-drafted proposals.',
      tone: 'neutral',
      actionLabel: 'Open pipeline',
    },
    {
      id: 'training',
      title: 'Assign workflow training',
      description: 'Two new managers require onboarding to approve AI-suggested updates.',
      tone: 'error',
      actionLabel: 'View training kit',
    },
  ],
  orders: [
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
  ],
  events: [
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
  ],
  creators: [
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
  ],
  security: {
    postureScore: 94,
    incidentFreeDays: 128,
    mfaCoverage: '97%',
    privilegedAccounts: 8,
    topRisks: [
      {
        id: 'risk-1',
        title: 'Suspicious login velocity',
        description: 'Anomalous access attempts against 3 dormant vendor accounts.',
        severity: 'medium',
      },
      {
        id: 'risk-2',
        title: 'Secrets rotation due',
        description: 'Two webhook signing secrets expire within 5 days.',
        severity: 'low',
      },
    ],
    highlights: [
      {
        id: 'highlight-1',
        label: 'Zero critical alerts',
        detail: 'Last 30 days',
      },
      {
        id: 'highlight-2',
        label: 'Quarterly pen-test passed',
        detail: 'No exploitable findings reported',
      },
    ],
    alerts: [
      {
        id: 'alert-1',
        label: 'Review vendor access',
        detail: 'Complete OAuth token pruning before Friday.',
      },
      {
        id: 'alert-2',
        label: 'Enforce hardware keys',
        detail: 'Rollout physical key enforcement to support contractors.',
      },
    ],
  },
  infrastructure: {
    uptime: '99.982%',
    avgLatency: '182 ms',
    queueDepth: '1.2k jobs',
    change: '-8% vs 30d',
    regions: 12,
    services: [
      { id: 'svc-api', name: 'API gateway', status: 'Operational' },
      { id: 'svc-workers', name: 'Worker fleet', status: 'Autoscaling' },
      { id: 'svc-ml', name: 'ML inference pods', status: 'Warm standby' },
    ],
    incidents: [
      { id: 'inc-1', title: 'No major incidents', timestamp: 'Rolling 90 days' },
    ],
  },
  team: {
    onCallLead: 'Savannah Nguyen',
    coverage: '24/7 global coverage',
    nextStandup: '14:00 UTC',
    squads: [
      { id: 'sq-1', name: 'Reliability', owner: 'Courtney Henry', handoffIn: '4h' },
      { id: 'sq-2', name: 'Security', owner: 'Jenny Wilson', handoffIn: '7h' },
    ],
    responders: [
      { id: 'res-1', name: 'Ralph Edwards', speciality: 'Payments' },
      { id: 'res-2', name: 'Theresa Webb', speciality: 'AI Workflows' },
    ],
  },
  compliance: {
    frameworks: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'PCI DSS SAQ A'],
    nextAudit: '2025-06-14',
    dataResidency: 'US-East (primary) • EU-West (failover)',
    controlsTested: 162,
  },
  meta: {
    source: 'fallback',
    generatedAt: null,
    warnings: [],
  },
});

function cloneTemplate() {
  if (typeof structuredClone === 'function') {
    return structuredClone(FALLBACK_TEMPLATE);
  }
  return JSON.parse(JSON.stringify(FALLBACK_TEMPLATE));
}

function formatTimestamp(value) {
  if (!value) return '';
  try {
    return new Date(value).toISOString();
  } catch (error) {
    return value;
  }
}

export function buildFallbackSnapshot(overrides = {}) {
  const snapshot = cloneTemplate();
  snapshot.meta = {
    ...snapshot.meta,
    ...overrides.meta,
    source: overrides?.meta?.source || 'fallback',
    generatedAt: formatTimestamp(overrides?.meta?.generatedAt) || new Date().toISOString(),
    warnings: Array.isArray(overrides?.meta?.warnings) ? overrides.meta.warnings.slice() : [],
  };
  if (overrides.metrics) snapshot.metrics = overrides.metrics;
  if (overrides.revenueTrend) snapshot.revenueTrend = overrides.revenueTrend;
  if (overrides.insights) snapshot.insights = overrides.insights;
  if (overrides.suggestions) snapshot.suggestions = overrides.suggestions;
  if (overrides.orders) snapshot.orders = overrides.orders;
  if (overrides.events) snapshot.events = overrides.events;
  if (overrides.creators) snapshot.creators = overrides.creators;
  if (overrides.security) snapshot.security = { ...snapshot.security, ...overrides.security };
  if (overrides.infrastructure) snapshot.infrastructure = { ...snapshot.infrastructure, ...overrides.infrastructure };
  if (overrides.team) snapshot.team = { ...snapshot.team, ...overrides.team };
  if (overrides.compliance) snapshot.compliance = { ...snapshot.compliance, ...overrides.compliance };
  return snapshot;
}

export async function buildDashboardSnapshot({ supabase, userId, userEmail } = {}) {
  const snapshot = buildFallbackSnapshot({
    meta: {
      user: { id: userId || null, email: userEmail || null },
      source: 'fallback',
    },
  });

  if (!supabase) {
    return snapshot;
  }

  const warnings = [];
  let enriched = false;

  try {
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .in('role', ['admin', 'editor', 'security'])
      .limit(200);

    if (!rolesError && Array.isArray(roles)) {
      snapshot.security.privilegedAccounts = roles.length;
      enriched = true;
    } else if (rolesError) {
      warnings.push(rolesError.message || 'Failed to load privileged roles');
    }
  } catch (error) {
    warnings.push(error.message);
  }

  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, status, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (!postsError && Array.isArray(posts) && posts.length) {
      const mappedEvents = posts.map((post) => {
        const timestamp = post.updated_at || post.created_at;
        const status = (post.status || '').toLowerCase();
        const tone = status === 'published' ? 'success' : status === 'pending' ? 'warning' : 'info';
        const toneLabel = status === 'published' ? 'Published' : status === 'pending' ? 'Pending' : 'Updated';
        return {
          id: `post-${post.id}`,
          title: post.title || 'Content update',
          description: `Blog post is ${status || 'updated'} in moderation pipeline.`,
          timestamp: timestamp ? new Date(timestamp).toUTCString() : 'Recently',
          tone,
          toneLabel,
        };
      });
      snapshot.events = [...mappedEvents, ...snapshot.events].slice(0, 5);
      const pending = posts.filter((post) => post.status === 'pending').length;
      if (pending > 0) {
        snapshot.suggestions = [
          {
            id: 'moderation',
            title: 'Moderate queued articles',
            description: `${pending} unpublished ${(pending === 1 ? 'post requires' : 'posts require')} review in the content backlog.`,
            tone: 'warning',
            actionLabel: 'Open moderation queue',
          },
          ...snapshot.suggestions.filter((suggestion) => suggestion.id !== 'moderation'),
        ].slice(0, 4);
      }
      enriched = true;
    } else if (postsError) {
      warnings.push(postsError.message || 'Failed to load content updates');
    }
  } catch (error) {
    warnings.push(error.message);
  }

  if (warnings.length) {
    snapshot.meta.warnings.push(...warnings);
    snapshot.meta.source = enriched ? 'hybrid' : 'fallback';
  } else if (enriched) {
    snapshot.meta.source = 'realtime';
  }

  snapshot.meta.generatedAt = new Date().toISOString();
  return snapshot;
}

export default buildDashboardSnapshot;
