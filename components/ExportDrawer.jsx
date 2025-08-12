'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MARKET_PRESETS } from '@/lib/market-presets';
import { composeForPreset, downloadDataUrl } from '@/lib/exporters/canvasExport';

export default function ExportDrawer({ open, onClose, cutoutUrl, defaultName = 'product', useCurrentBg = false, currentBgColor }) {
  const [target, setTarget] = useState('amazon');
  const [padding, setPadding] = useState(6); // %
  const [busy, setBusy] = useState(false);

  const preset = MARKET_PRESETS[target];

  const onExport = async () => {
    if (!cutoutUrl) return;
    setBusy(true);
    try {
      const dataUrl = await composeForPreset(
        cutoutUrl,
        preset,
        {
          padding: (padding || 6) / 100,
          bgOverride: useCurrentBg ? currentBgColor : undefined,
        }
      );
      downloadDataUrl(dataUrl, preset.filename(defaultName));
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[86vw] max-w-md bg-[#0f0a1f] text-white border-l border-white/10 shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Export</div>
              <button onClick={onClose} className="rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-sm">Close</button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">Marketplace</label>
              <div className="flex gap-2">
                {Object.entries(MARKET_PRESETS).map(([key, p]) => (
                  <button key={key} onClick={() => setTarget(key)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${target===key ? 'bg-white text-black' : 'border border-white/15 bg-white/10'}`}>
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/60 mb-1">Canvas</div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">{preset.size[0]}×{preset.size[1]}</div>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Background</div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">{useCurrentBg ? 'Current' : preset.bg}</div>
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-white/60">Padding</label>
                  <input type="range" min={0} max={15} value={padding} onChange={(e)=>setPadding(Number(e.target.value))} className="w-full" />
                  <div className="text-right">{padding}%</div>
                </div>
              </div>

              <button
                onClick={onExport}
                disabled={!cutoutUrl || busy}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-2 font-semibold disabled:opacity-50"
              >
                {busy ? 'Exporting…' : `Export for ${preset.label}`}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
