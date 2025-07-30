import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ show, message, type = 'success' }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 text-white rounded-full shadow-lg z-50 ${colors[type]}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
