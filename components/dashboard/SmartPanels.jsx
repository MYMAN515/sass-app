import { memo } from 'react';
import { motion } from 'framer-motion';

const moodPalette = {
  ready: {
    badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
    accent: 'from-emerald-500/15 via-transparent to-transparent',
  },
  loading: {
    badge: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
    accent: 'from-amber-500/15 via-transparent to-transparent',
  },
  error: {
    badge: 'bg-rose-500/20 text-rose-200 border border-rose-400/30',
    accent: 'from-rose-500/15 via-transparent to-transparent',
  },
};

const toneAccent = {
  error: 'border border-rose-400/40 bg-rose-500/10 text-rose-100',
  info: 'border border-violet-400/30 bg-violet-500/10 text-violet-100',
  neutral: 'border border-white/15 bg-white/5 text-zinc-200',
};

const MetricCard = memo(function MetricCard({ metric, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-inner backdrop-blur-sm"
    >
      <div className="text-[11px] uppercase tracking-widest text-zinc-400">{metric.label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{metric.value}</div>
      {metric.hint && (
        <div className="text-xs text-zinc-400 mt-1">{metric.hint}</div>
      )}
    </motion.div>
  );
});

export const InsightsPanel = memo(function InsightsPanel({ insights }) {
  if (!insights) return null;
  const palette = moodPalette[insights.mood] || moodPalette.ready;
  const metrics = Array.isArray(insights.metrics) ? insights.metrics : [];
  const statusLabel = insights.statusLabel || 'Ready';

  if (metrics.length === 0) {
    return (
      <div className="relative rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Workflow intelligence
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            We’ll surface insights here once you start generating results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 shadow-lg overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.accent} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Workflow intelligence
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur ${palette.badge}`}>
            {statusLabel}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {metrics.map((metric, idx) => (
            <MetricCard key={metric.id || idx} metric={metric} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
});

export const SuggestionPanel = memo(function SuggestionPanel({ suggestions }) {
  const items = Array.isArray(suggestions)
    ? suggestions.filter(Boolean)
    : [];
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Next best actions
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          You are ready to create. Prep your assets or explore another tool from the suite.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 shadow-lg">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
        Next best actions
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item, idx) => {
          const tone = toneAccent[item.tone || 'neutral'] || toneAccent.neutral;
          return (
            <motion.li
              key={item.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`rounded-xl px-3 py-2 ${tone}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold leading-tight text-white">
                      {item.title}
                    </div>
                    <p className="text-xs text-zinc-200/80 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.actionLabel && item.onAction && (
                  <button
                    onClick={() => {
                      if (typeof item.onAction === 'function') {
                        item.onAction();
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                  >
                    {item.actionLabel}
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
});

