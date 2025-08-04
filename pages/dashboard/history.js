<<<<<<< HEAD
// pages/dashboard/history.js
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import Spinner from '@/components/Spinner';
import Cookies from 'js-cookie';

export default function TryOnHistoryPage() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ تحميل المستخدم من الكوكيز
  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error('Invalid cookie data:', err);
        setLoading(false);
      }
    } else {
      setLoading(false); // لا يوجد مستخدم
    }
  }, []);

  // ✅ تحميل السجل بعد وجود المستخدم
  useEffect(() => {
    if (user === null) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/history?email=${user.email}`);
        const data = await res.json();
        setRecords(data.records || []);
      } catch (err) {
        console.error('Fetch failed:', err);
=======
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import Spinner from '@/components/Spinner';

export default function HistoryPage() {
  const session = useSession();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const userEmail = session?.user?.email?.toLowerCase()?.trim();
      console.log('📡 Email being used for query:', userEmail);

      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/history?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        console.log('📦 Supabase records:', data);
        setRecords(data.records || []);
      } catch (err) {
        console.error('❌ Fetch failed:', err);
>>>>>>> 292c6fba (New Front-end | Back-End|)
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
<<<<<<< HEAD
  }, [user]);

  return (
    <Layout title="My Try-On History">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <motion.h1
          className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
=======
  }, [session]);

  return (
    <Layout title="My AI History">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.h1
          className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
>>>>>>> 292c6fba (New Front-end | Back-End|)
          animate={{ opacity: 1, y: 0 }}
        >
          My AI Try-On & Enhance History
        </motion.h1>

        {loading ? (
          <Spinner className="mx-auto" />
<<<<<<< HEAD
        ) : !user?.email ? (
          <p className="text-red-500 text-center">No user email found. Please log in again.</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No try-on results yet. Upload a product and generate AI output!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {records.map((item) => (
              <motion.div
                key={`${item.image_url}-${item.created_at}`}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4 border border-zinc-200 dark:border-zinc-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img
                  src={item.image_url}
                  alt="Generated Image"
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300 overflow-hidden max-h-24 whitespace-pre-line break-words">
                  {item.prompt}
                </div>
              </motion.div>
            ))}
=======
        ) : !session?.user?.email ? (
          <p className="text-red-500 text-center">
            ⚠️ No user session found. Please log in to view your history.
          </p>
        ) : records.filter((r) => r.image_url).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            🧪 You haven't generated anything yet. Start by uploading and creating results!
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {records
              .filter((item) => item.image_url)
              .map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden flex flex-col"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <img
                    src={item.image_url}
                    alt="Generated Result"
                    className="w-full h-64 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/fallback-image.jpg'; // ← صورة بديلة لو فشل التحميل
                    }}
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">
                        📅 {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 break-words line-clamp-4">
                        🧠 <strong>Prompt:</strong>{' '}
                        {item.prompt ?? 'No prompt provided'}
                      </p>
                      {item.type && (
                        <p className="text-xs mt-2 text-purple-500 uppercase font-semibold tracking-wide">
                          🔖 {item.type}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
>>>>>>> 292c6fba (New Front-end | Back-End|)
          </div>
        )}
      </div>
    </Layout>
  );
}
