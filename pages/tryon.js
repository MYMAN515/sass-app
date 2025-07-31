// pages/tryon.js
import { useState, useEffect } from 'react';
import { Button, Toast, Skeleton } from '@/components/ui';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import TryOnCustomizer from '@/components/TryOnCustomizer';
import Cookies from 'js-cookie';

export default function TryOnPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [options, setOptions] = useState({});
  const [user, setUser] = useState({ email: '' });

useEffect(() => {
  const stored = Cookies.get('user');
  if (stored) {
    setUser(JSON.parse(stored));
  }
}, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleTryOn = async () => {
    if (!image) {
      setToast({ show: true, msg: 'Please upload a clothing image first.', type: 'error' });
      return;
    }

    if (!user.email) {
      setToast({ show: true, msg: 'User email not found.', type: 'error' });
      return;
    }

    setLoading(true);
    setToast({ show: false, msg: '', type: 'success' });

    try {
      const prompt = `
        A ${options.height || 'average'}-height ${options.skinTone || 'light'} male model with ${options.bodyType || 'fit'} body type,
        wearing the uploaded shirt, standing in a ${options.background || 'studio'} background,
        captured from the ${options.angle || 'front'} angle in a ${options.style || 'fashion'} style studio photo shoot.
        High-resolution, soft lighting, realistic shadows and folds.
      `;

      const formData = new FormData();
      formData.append('image', image);
      formData.append('prompt', prompt);
      formData.append('email', user.email); // ✅ send email

      const res = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Try-on failed');

      setResult(data.image);
      setToast({ show: true, msg: 'Try-on complete 🎉', type: 'success' });
    } catch (err) {
      setToast({ show: true, msg: err.message || 'Try-on failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Try-On">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Try On Your Product with AI
        </motion.h1>

        <label className="block mx-auto mb-4 text-sm text-gray-700 dark:text-gray-300">
          Upload a clothing image (T-shirt, jacket...)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="block mx-auto mb-6 file:px-5 file:py-2 file:rounded-md file:border-0 file:text-sm file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
        />

        {preview && (
          <motion.img
            src={preview}
            alt="Uploaded Preview"
            className="w-64 h-64 object-cover rounded-2xl mx-auto shadow mb-6 ring-2 ring-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}

        <TryOnCustomizer onChange={setOptions} />

        <Button onClick={handleTryOn} disabled={loading} className="transition-all duration-200">
          {loading ? 'Generating with AI...' : 'Generate AI Try-On'}
        </Button>

        {loading && <Skeleton className="w-64 h-64 mx-auto mt-8" />}

        {result && !loading && (
          <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-lg font-semibold mb-2">AI Try-On Result:</p>
            <img
              src={result}
              alt="AI Try-On Result"
              className="w-64 h-64 object-cover rounded-2xl mx-auto shadow border"
            />
          </motion.div>
        )}

        <Toast show={toast.show} message={toast.msg} type={toast.type} />
      </div>
    </Layout>
  );
}
