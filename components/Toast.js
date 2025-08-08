import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TYPE_STYLES = {
  success:
    'bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 text-white shadow-[0_20px_60px_rgba(147,51,234,0.35)]',
  error:
    'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-[0_20px_60px_rgba(225,29,72,0.35)]',
  info:
    'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-[0_20px_60px_rgba(2,132,199,0.35)]',
};

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M20 6 9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M12 9v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
      <path d="M13 16h-2v-4h2m-1-4h.01" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
    </svg>
  ),
};

export default function Toast({
  show,
  message,
  type = 'success',
  // اختياري: يغلق نفسه بعد مدة
  autoHide = false,
  duration = 3000,
  onClose, // اختياري: لو تبغى تغلقه من جوّا
  position = 'bottom', // 'bottom' | 'top'
}) {
  useEffect(() => {
    if (!show || !autoHide || !onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [show, autoHide, duration, onClose]);

  const posClass =
    position === 'top'
      ? 'top-4 sm:top-6'
      : 'bottom-4 sm:bottom-6 pb-[env(safe-area-inset-bottom)]';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live={type === 'error' ? 'assertive' : 'polite'}
          className={`fixed left-1/2 -translate-x-1/2 ${posClass} z-[100] pointer-events-none`}
          initial={{ y: position === 'top' ? -20 : 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: position === 'top' ? -20 : 20, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <div
            className={[
              'pointer-events-auto rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5',
              'max-w-[92vw] sm:max-w-md w-[min(92vw,680px)] sm:w-auto',
              'backdrop-blur-md border border-white/10 flex items-center gap-3',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400',
              TYPE_STYLES[type],
              'motion-reduce:transition-none motion-reduce:transform-none',
            ].join(' ')}
          >
            <span className="shrink-0 opacity-90">{ICONS[type]}</span>
            <div className="text-sm font-medium leading-snug">{message}</div>

            {/* Close (يعمل فقط إذا onClose موجود) */}
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto grid place-items-center rounded-lg/80 px-2 py-1.5 hover:bg-white/10 focus:outline-none"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* شريط تقدم اختياري للـ autoHide */}
          {autoHide && onClose && (
            <motion.div
              className="h-1 mt-2 w-full rounded-full bg-zinc-700/40 overflow-hidden"
              initial={false}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500"
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
