import { useState } from 'react';
import { Button, Toast, Skeleton } from '@/components/ui';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';

export default function TryOnPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleTryOn = () => {
    if (!image) {
      setToast({ show: true, msg: 'Upload a clothing image first', type: 'error' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setResult('/tryon-placeholder.jpg');
      setLoading(false);
      setToast({ show: true, msg: 'Try-on complete 🎉', type: 'success' });
    }, 2000);
  };

  return (
    <Layout title="Try-On">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI Clothing Try-On 👕
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

        <Button onClick={handleTryOn} disabled={loading}>
          {loading ? 'Trying on...' : 'Call AI for Try-On'}
        </Button>

        {loading && <Skeleton className="w-64 h-64 mx-auto mt-8" />}

        {result && !loading && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
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
