// /pages/api/model.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      console.error('❌ Missing REPLICATE_API_TOKEN');
      return res.status(500).json({ error: 'Missing Replicate token' });
    }

    const {
      // مطلوب:
      prompt,
      user_email,

      // اختياري: طرق متعددة لتمرير الصور
      imageUrl,          // صورة أساسية واحدة
      refImages = [],    // مصفوفة صور إضافية
      input_images = [], // اسم بديل لو تمرير مصفوفة

      // اختياري: باراميترات للموديل
      aspect_ratio = 'match_input_image',
      output_format = 'png',
      safety_tolerance = 2,
    } = req.body || {};

    // نبني مصفوفة الصور من كل الحقول المحتملة
    const images = [
      ...(imageUrl ? [imageUrl] : []),
      ...(Array.isArray(refImages) ? refImages : []),
      ...(Array.isArray(input_images) ? input_images : []),
    ].filter(Boolean);

    if (!prompt || !user_email) {
      return res.status(400).json({ error: 'Missing required fields: prompt, user_email' });
    }
    if (images.length === 0) {
      return res.status(400).json({ error: 'At least one input image is required' });
    }

    // ✅ Auth via Supabase (نفس أسلوبك)
    const supabase = createPagesServerClient({ req, res });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 🧠 بيانات المستخدم من جدول Data
    const { data: userData, error: userError } = await supabase
      .from('Data')
      .select('credits, plan')
      .eq('email', user_email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userData.plan !== 'Pro' && (userData.credits ?? 0) <= 0) {
      return res.status(403).json({ error: 'No credits left' });
    }

    // 🟣 تشغيل الموديل multi-image عبر مكتبة Replicate الرسمية
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

    // نحول الصور input_image_1..N (نحدّد حدًا معقولًا مثل 5)
    const input = { prompt, aspect_ratio, output_format, safety_tolerance };
    const maxImgs = Math.min(images.length, 5);
    for (let i = 0; i < maxImgs; i++) {
      input[`input_image_${i + 1}`] = images[i];
    }

    // تشغيل الموديل
    const output = await replicate.run(
      'flux-kontext-apps/multi-image-kontext-pro',
      { input }
    );

    // محاولة استخراج رابط الملف الناتج (SDK قد يرجّع كائن فيه url() أو مصفوفة/سترنج)
    let outUrl = null;
    if (output) {
      if (typeof output === 'string') {
        outUrl = output;
      } else if (Array.isArray(output)) {
        const first = output[0];
        if (first) {
          if (typeof first?.url === 'function') outUrl = first.url();
          else if (typeof first?.url === 'string') outUrl = first.url;
        }
      } else if (typeof output === 'object') {
        if (typeof output.url === 'function') outUrl = output.url();
        else if (typeof output.url === 'string') outUrl = output.url;
      }
    }

    if (!outUrl) {
      // كحل أخير أرسل الـ output كما هو للمراجعة
      return res.status(200).json({
        success: true,
        output, // رجّعه كما وصل (قد يكون Blob/Buffer حسب الإصدارات)
        note: 'No direct URL found; raw output returned.',
      });
    }

    // ✅ خصم كريديت لغير الـ Pro
    if (userData.plan !== 'Pro') {
      try {
        await supabase.rpc('decrement_credit', { user_email });
      } catch (e) {
        // لا توقف العملية لو فشل الخصم — فقط سجّل
        console.error('decrement_credit failed', e?.message || e);
      }
    }

    // حافظنا على مفاتيح متوافقة مع pickFirstUrl() في واجهتك
    return res.status(200).json({
      success: true,
      image: outUrl,      // ← سيلتقطها pickFirstUrl
      url: outUrl,        // ← احتياط
      result: outUrl,     // ← احتياط
      model: 'flux-kontext-apps/multi-image-kontext-pro',
      used_images: images.slice(0, maxImgs),
    });
  } catch (err) {
    console.error('API /api/model error:', err);
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) });
  }
}
