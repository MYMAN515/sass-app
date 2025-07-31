import { useState, useEffect } from 'react';
import { Button, Toast, Skeleton } from '@/components/ui';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

export default function EnhancePage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [user, setUser] = useState({ email: '' });

  useEffect(() => {
    const stored = Cookies.get('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleEnhance = async () => {
    if (!image || !user.email) {
      setToast({ show: true, msg: 'Missing image or user', type: 'error' });
      return;
    }

    setLoading(true);
    setToast({ show: false, msg: '', type: 'success' });

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('email', user.email);

      const res = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enhancement failed');

      setResult(data.enhancedImage);
      setToast({ show: true, msg: 'Image enhanced 🎉', type: 'success' });
    } catch (err) {
      setToast({ show: true, msg: err.message || 'Error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Enhance">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Enhance Your Product Image ✨
        </motion.h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="block mx-auto mb-6 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-sm file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
        />

        {preview && (
          <motion.img
            src={preview}
            alt="preview"
            className="w-64 h-64 object-cover rounded-2xl mx-auto shadow mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        <Button onClick={handleEnhance} disabled={loading}>
          {loading ? 'Enhancing...' : 'Call AI to Enhance'}
        </Button>

        {loading && <Skeleton className="w-64 h-64 mx-auto mt-8" />}

        {result && !loading && (
          <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-lg font-semibold mb-2">Result:</p>
            <img
              src={result}
              alt="enhanced"
              className="w-64 h-64 object-cover rounded-2xl mx-auto shadow border"
            />
          </motion.div>
        )}

        <Toast show={toast.show} message={toast.msg} type={toast.type} />
      </div>
    </Layout>
  );
}
