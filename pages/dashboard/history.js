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

  // ✅ تحميل المستخدم من cookies
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
      setLoading(false); // لا يوجد مستخدم → أوقف التحميل
    }
  }, []);

  // ✅ تحميل السجل إذا وجد المستخدم
  useEffect(() => {
    if (user === null) return; // لم يحمّل بعد
    if (!user?.email) {
      setLoading(false); // لا يوجد إيميل → لا تحاول الاتصال
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
          className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My AI Try-On History
        </motion.h1>

        {loading ? (
          <Spinner className="mx-auto" />
        ) : !user?.email ? (
          <p className="text-red-500 text-center">No user email found. Please log in again.</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No results yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {records.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img
                  src={item.image_url}
                  alt="Try-On Result"
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-3">
                  {item.prompt}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
