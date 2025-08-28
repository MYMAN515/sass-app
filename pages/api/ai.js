import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Replicate from 'replicate';

export const config = {
  api: { bodyParser: true },
};

// --------- إعدادات ---------
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_ID = 'google/nano-banana';

// حدود آمنة
const clamp = (n, min, max) => Math.max(min, Math.min(max, n || 0));

// عميل Replicate
const replicate = new Replicate({
  // يقرأ التوكن من env تلقائياً، لكن نمرّره صراحة لتفادي أي لبس
  auth: REPLICATE_TOKEN,
});

// محاولة استخراج رابط من مخرجات متنوعة الشكل
const toUrlList = (output) => {
  // بعض الموديلات ترجع string أو Array<string>
  if (!output) return [];
  if (typeof output === 'string') return [output];

  // File-like object مع دالة url()
  if (typeof output?.url === 'function') {
    const u = output.url();
    return typeof u === 'string' ? [u] : [];
  }

  // Array من عناصر مختلفة
  if (Array.isArray(output)) {
    const urls = [];
    for (const item of output) {
      if (typeof item === 'string') {
        urls.push(item);
      } else if (item && typeof item.url === 'function') {
        const u = item.url();
        if (typeof u === 'string') urls.push(u);
      }
    }
    return urls;
  }

  return [];
};

// تشغيل الموديل مرة واحدة
async function runNanoBananaOnce({ prompt, image_input }) {
  const output = await replicate.run(MODEL_ID, {
    input: {
      prompt,
      image_input, // array of urls
    },
  });
  return toUrlList(output);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  // ---- تحقّق التوكن ----
  if (!REPLICATE_TOKEN) {
    console.error('❌ Missing REPLICATE_API_TOKEN');
    return res.status(500).json({ error: 'Missing Replicate token' });
  }

  // ---- مدخلات ----
  const {
    imageUrl,      // تَوافق: لو وصلك واحد فقط
    imageUrls,     // الجديد: Array<string> لعدة صور
    prompt,
    user_email,
    plan,          // اختياري من الواجهة؛ القرار الحقيقي من جدول Data
    // خيارات قديمة/إضافية (تُتجاهل هنا إن لم يدعمها الموديل):
    num_images,    // عدد التنويعات المطلوبة (نشغّل الموديل أكثر من مرة)
  } = req.body || {};

  // تطبيع الصور: نقبل imageUrl أو imageUrls
  let inputs = [];
  if (Array.isArray(imageUrls)) inputs = imageUrls.filter(Boolean);
  if (!inputs.length && typeof imageUrl === 'string') inputs = [imageUrl];

  // حد عملي للمدخلات (اندماج متعدد) — تقدر تزود/تقلّل حسب تجربتك
  const MAX_INPUTS = 6;
  inputs = inputs.slice(0, MAX_INPUTS);

  if (!inputs.length || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing required fields: imageUrls/imageUrl, prompt, user_email' });
  }

  // ---- Supabase Session/Auth ----
  const supabase = createPagesServerClient({ req, res });
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (!session || sessionError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---- بيانات المستخدم (الخطة/الكريدت) ----
  const { data: userData, error: userError } = await supabase
    .from('Data')
    .select('credits, plan')
    .eq('email', user_email)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (userData.plan !== 'Pro' && userData.credits <= 0) {
    return res.status(403).json({ error: 'No credits left' });
  }

  // ---- عدد التنويعات (نشغّل الموديل أكثر من مرة) ----
  const outputsCount = clamp(
    typeof num_images === 'number' ? num_images : (userData.plan === 'Pro' ? 2 : 1),
    1, 3
  );

  // ---- تشغيل أساسي + Retry ببرومبت مشدّد إذا لزم ----
  const harden = (p) =>
    `${p} Ensure correct layering and natural fusion of all garments/items; maintain realistic proportions, lighting, and alignment; avoid artifacts or partial crops.`;

  let variants = [];
  let firstError = null;

  try {
    // نشغّل بعدد التنويعات المطلوبة
    for (let i = 0; i < outputsCount; i++) {
      let urls = await runNanoBananaOnce({ prompt, image_input: inputs });

      // Retry ببرومبت مشدّد إذا ما في ناتج
      if (!urls.length) {
        urls = await runNanoBananaOnce({ prompt: harden(prompt), image_input: inputs });
      }

      if (!urls.length) {
        firstError = 'Model returned no image';
        continue;
      }

      // nano-banana عادة يعطي ملف/رابط واحد — لكن ندمجه كتنويعات
      variants.push(urls[0]);
    }
  } catch (e) {
    console.error('nano-banana error:', e);
    return res.status(500).json({ error: e?.message || 'Replicate run failed' });
  }

  // إزالة التكرارات (لو رجع نفس الرابط)
  variants = [...new Set(variants)];

  if (!variants.length) {
    return res.status(500).json({ error: firstError || 'No image returned' });
  }

  const first = variants[0];

  // ---- خصم كريدت لغير الـ Pro ----
  if (userData.plan !== 'Pro') {
    try {
      await supabase.rpc('decrement_credit', { user_email });
    } catch (e) {
      console.warn('decrement_credit failed:', e?.message || e);
    }
  }

  // ---- استجابة ----
  return res.status(200).json({
    success: true,
    image: first,
    variants, // قائمة روابط (تنويعات من عدة تشغيلات)
    seed: null, // هذا الموديل لا يدعم seed حالياً
    plan: userData.plan,
    inputsCount: inputs.length,
  });
}
