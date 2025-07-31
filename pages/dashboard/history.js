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
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <Layout title="My Try-On History">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <motion.h1
          className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My AI Try-On & Enhance History
        </motion.h1>

        {loading ? (
          <Spinner className="mx-auto" />
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
          </div>
        )}
      </div>
    </Layout>
  );
}
