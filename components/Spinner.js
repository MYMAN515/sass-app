'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast({ show, message, type = 'success' }) {
  const config = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
  };

  const { bg, text, icon } = config[type] || config.success;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-50`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${bg}`}>
            {icon}
            <p className={`text-sm font-medium ${text}`}>{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
