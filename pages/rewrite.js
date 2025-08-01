// /pages/rewrite.js
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewritePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    setLoading(true);
    setOutput('');
    const res = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });
    const data = await res.json();
    setOutput(data.rewritten || 'No response returned.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl backdrop-blur-lg bg-white/80 dark:bg-gray-800/70 shadow-xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">✨ Rewrite Product Description</h1>

        <label className="relative block w-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your product here..."
            rows={5}
            className="w-full p-4 peer resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <span className="absolute top-2.5 left-4 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">
            Product Description
          </span>
        </label>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRewrite}
          disabled={loading || !input.trim()}
          className="mt-6 w-full py-3 text-center rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? 'Enhancing...' : 'Rewrite with AI'}
        </motion.button>

        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold mb-2">🔁 AI Rewritten Text:</h2>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{output}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
