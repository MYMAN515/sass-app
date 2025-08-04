// pages/history.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const user = await supabase.auth.getUser();
      const email = user?.data?.user?.email;
      if (!email) return;

      const { data, error } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });

      if (!error) setHistory(data);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">✨ Your History</h1>

      {loading && <p>Loading...</p>}

      {!loading && history.length === 0 && (
        <p className="text-zinc-400">No generation history yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
          >
            <img
              src={item.image_url}
              alt="generated"
              className="w-full h-56 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="p-4">
              <div className="text-sm text-zinc-400">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-purple-400 italic">
                {item.type || 'Enhance'}
              </div>
              {item.prompt && (
                <p className="mt-2 text-sm text-zinc-200 line-clamp-2">
                  {item.prompt}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
