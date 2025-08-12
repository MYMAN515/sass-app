'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const ReactMarkdown = dynamic(() => import('react-markdown').then(m => m.default), {
  ssr: false,
  // if react-markdown isn't installed, fall back to plain text
  loading: () => null,
});

export default function MarkdownEditor({ value, onChange }) {
  const [tab, setTab] = useState('edit');

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`px-3 py-1.5 rounded-xl text-sm border ${tab==='edit' ? 'bg-black text-white' : 'bg-white'}`}
        >Edit</button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-3 py-1.5 rounded-xl text-sm border ${tab==='preview' ? 'bg-black text-white' : 'bg-white'}`}
        >Preview</button>
        <span className="ml-auto text-xs text-gray-500">Markdown supported</span>
      </div>

      {tab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your post in Markdown..."
          className="w-full h-80 p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/50"
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose max-w-none border rounded-2xl p-4 bg-white">
          {ReactMarkdown ? <ReactMarkdown>{value || 'Nothing to preview yet.'}</ReactMarkdown> : <pre className="whitespace-pre-wrap">{value}</pre>}
        </motion.div>
      )}
    </div>
  );
}
