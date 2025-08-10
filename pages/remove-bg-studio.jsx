'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function RemoveBgStudioPage() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff'); // لون الخلفية الجديد
  const [outputImage, setOutputImage] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabaseClient();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setImagePreview(URL.createObjectURL(selected));
  };

  const handleRemoveBackground = async () => {
    if (!file) return alert('اختر صورة أولاً');
    setLoading(true);

    // رفع الصورة لـ Supabase Storage أو سيرفرك
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    // استدعاء API الإزالة
    const res = await fetch('/api/remove-bg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: publicUrl,
      }),
    });

    const data = await res.json();
    if (data.success) {
      // إضافة الخلفية الملونة على الصورة الناتجة
      const finalImage = await addBackgroundColor(data.image, bgColor);
      setOutputImage(finalImage);
    } else {
      alert('فشل في إزالة الخلفية');
    }

    setLoading(false);
  };

  // إضافة خلفية ملونة
  const addBackgroundColor = async (imageUrl, color) => {
    const img = await fetch(imageUrl).then((res) => res.blob());
    const bitmap = await createImageBitmap(img);

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');

    // رسم الخلفية الملونة
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الصورة فوق الخلفية
    ctx.drawImage(bitmap, 0, 0);

    return canvas.toDataURL('image/png');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🖌️ Remove BG Studio</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />

      {imagePreview && (
        <div className="mb-4">
          <img src={imagePreview} alt="Preview" className="w-full rounded-md border" />
        </div>
      )}

      <label className="block mb-2 font-semibold">اختر لون الخلفية الجديد:</label>
      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mb-4" />

      <button
        onClick={handleRemoveBackground}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'جار المعالجة...' : 'إزالة الخلفية وإضافة اللون'}
      </button>

      {outputImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">النتيجة:</h2>
          <img src={outputImage} alt="Output" className="w-full rounded-md border" />
          <a
            href={outputImage}
            download="result.png"
            className="mt-3 inline-block bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            تنزيل الصورة
          </a>
        </div>
      )}
    </div>
  );
}
