'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

/**
 * Mint/Lemon Studio — Dashboard (Final)
 * -------------------------------------------------
 * - RTL first to match the provided mock
 * - Sticky header, glass cards, soft borders/shadows
 * - Left rail (sections), central Try-On with presets
 * - Mobile-first, smooth motion, skeleton states
 * - Try-On sends: { imageUrl, prompt, user_email, aspect_ratio, ... }
 */

/* ---------------------------------- Theme --------------------------------- */
const MINT = '#D8FFEA';
const LEMON = '#FFF7B3';
const ease = [0.22, 1, 0.36, 1];
const STORAGE_BUCKET = 'img';

/* --------------------------------- Helpers -------------------------------- */
const hexToRGBA = (hex, a = 1) => {
  const c = hex.replace('#', '');
  const v = c.length === 3 ? c.replace(/(.)/g, '$1$1') : c;
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const mapAspectToApi = (a) => (a === '1:1' || a === '4:5' || a === '3:2') ? a : 'match_input_image';

/* -------------------------------- Presets --------------------------------- */
// Persona (نصوص عامة/مجردة — ليست أشخاصًا حقيقيين)
const PERSONA = [
  { id: 'p_f_clean', label: 'أنثى — كلاسيك', gender: 'female', body: 'regular', tone: 'III', head: 'شعر طويل', age: '25-30', height: 'متوسط' },
  { id: 'p_f_hijab', label: 'أنثى — حجاب', gender: 'female', body: 'regular', tone: 'III', head: 'حجاب', age: '25-30', height: 'متوسط' },
  { id: 'p_m_beard', label: 'ذكر — لحية', gender: 'male',   body: 'regular', tone: 'IV', head: 'شعر قصير + لحية', age: '28-35', height: 'متوسط' },
  { id: 'p_f_plus',  label: 'أنثى — Plus', gender: 'female', body: 'plus-size', tone: 'V', head: 'مغطى', age: '28-35', height: 'متوسط' },
  { id: 'p_u_teen',  label: 'مراهق — Unisex', gender: 'unisex', body: 'slim', tone: 'IV', head: 'شعر قصير', age: '16-18', height: 'متوسط' },
];

const POSE = [
  { id: 'cam_front_mid', label: 'أمامي / منتصف', pose: 'front', camera: 'mid' },
  { id: 'cam_three_mid', label: '٣/٤ / منتصف',   pose: 'three-quarter', camera: 'mid' },
  { id: 'cam_side_mid',  label: 'جانبي / منتصف', pose: 'side', camera: 'mid' },
  { id: 'cam_front_full',label: 'أمامي / كامل',  pose: 'front', camera: 'full' },
];

const SCENE = [
  { id: 'sc_white',  label: 'Studio White + Softbox', bg: 'white seamless background', light: 'large softbox' },
  { id: 'sc_mint',   label: 'Mint Gradient + Soft Rim', bg: 'mint haze gradient', light: 'soft rim + fill' },
  { id: 'sc_lemon',  label: 'Lemon Beige + Editorial Glow', bg: 'lemon beige gradient', light: 'editorial glow' },
  { id: 'sc_slate',  label: 'Slate Vignette + Contrast', bg: 'cool slate vignette', light: 'high contrast studio' },
];

/* ------------------------------- Quick Combos ------------------------------ */
const QUICK = [
  { id: 'q_f_clean',  title: 'E-Comm (أنثى)',  persona: 'p_f_clean', pose: 'cam_front_mid', scene: 'sc_white' },
  { id: 'q_f_hijab',  title: 'Modest (حجاب)', persona: 'p_f_hijab', pose: 'cam_front_mid', scene: 'sc_mint' },
  { id: 'q_m_beard',  title: 'E-Comm (ذكر)',  persona: 'p_m_beard', pose: 'cam_three_mid', scene: 'sc_white' },
  { id: 'q_f_plus',   title: 'Plus Size',     persona: 'p_f_plus',  pose: 'cam_side_mid',  scene: 'sc_white' },
  { id: 'q_u_teen',   title: 'Street Casual', persona: 'p_u_teen',  pose: 'cam_three_mid', scene: 'sc_lemon' },
];

/* --------------------------------- Toasts -------------------------------- */
function useToasts() {
  const [items, setItems] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const item = { id, msg, type: opts.type || 'info', progress: opts.progress ?? null };
    setItems((s) => [...s, item]);
    return {
      id,
      update: (patch) => setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it))),
      close: () => setItems((s) => s.filter((it) => it.id !== id)),
    };
  };
  const remove = (id) => setItems((s) => s.filter((it) => it.id !== id));
  return { items, push, remove };
}

function ToastHost({ items, onClose }) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[999] w-[92vw] max-w-sm sm:max-w-md space-y-2">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur shadow-lg p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-zinc-900">{t.msg}</div>
              <button className="text-xs text-zinc-600 hover:text-zinc-900" onClick={() => onClose(t.id)}>✕</button>
            </div>
            {typeof t.progress === 'number' && (
              <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all" style={{ width: `${Math.min(Math.max(t.progress, 0), 100)}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- Main View -------------------------------- */
export default function Dashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const toasts = useToasts();

  /* -------------------------- Auth & basic state -------------------------- */
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');

  // Uploads / results
  const [file, setFile] = useState(null);
  const [localUrl, setLocalUrl] = useState('');
  const [imageData, setImageData] = useState(''); // for remove-bg (if استخدمته لاحقًا)
  const [resultUrl, setResultUrl] = useState('');

  // Try-On selections
  const [pieceType, setPieceType] = useState(null); // upper/lower/dress/outfit
  const [personaId, setPersonaId] = useState(PERSONA[0].id);
  const [poseId, setPoseId] = useState(POSE[0].id);
  const [sceneId, setSceneId] = useState(SCENE[0].id);
  const [aspect, setAspect] = useState('1:1');
  const [fit, setFit] = useState('regular');
  const [shadowOn, setShadowOn] = useState(true);
  const [faceMode, setFaceMode] = useState('subtle'); // none/subtle/natural
  const [extraPrompt, setExtraPrompt] = useState('');  // search-like bar

  // UI phases
  const [step, setStep] = useState('cloth'); // cloth → piece → options
  const [phase, setPhase] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);

  // refs
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  /* ------------------------------ Auth / plan ----------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (user === undefined) return;
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const { data } = await supabase.from('Data').select('plan').eq('user_id', user.id).single();
        if (!mounted) return;
        setPlan(data?.plan || 'Free');
      } catch {}
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user, router, supabase]);

  /* ----------------------------- Drop & Paste ----------------------------- */
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e) => { e.preventDefault(); el.classList.add('ring-2','ring-emerald-300'); };
    const leave = () => el.classList.remove('ring-2','ring-emerald-300');
    const drop = async (e) => { e.preventDefault(); leave(); const f = e.dataTransfer.files?.[0]; if (f) await onPick(f); };
    el.addEventListener('dragover', over);
    el.addEventListener('dragleave', leave);
    el.addEventListener('drop', drop);
    const onPaste = async (e) => {
      const item = Array.from(e.clipboardData?.items || []).find((it) => it.type.startsWith('image/'));
      const f = item?.getAsFile?.(); if (f) await onPick(f);
    };
    window.addEventListener('paste', onPaste);
    return () => { el.removeEventListener('dragover', over); el.removeEventListener('dragleave', leave); el.removeEventListener('drop', drop); window.removeEventListener('paste', onPaste); };
  }, []);

  const onPick = async (f) => {
    setFile(f);
    setLocalUrl(URL.createObjectURL(f));
    setResultUrl('');
    setErr(''); setPhase('idle');
    setStep('piece');
    // لو استخدمت remove-bg مستقبلًا
    setImageData(await fileToDataURL(f).catch(()=>''));
  };

  /* -------------------------------- Storage ------------------------------- */
  const uploadToStorage = useCallback(
    async (f) => {
      if (!f) throw new Error('no file');
      const ext = (f.name?.split('.').pop() || 'png').toLowerCase();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase
        .storage.from(STORAGE_BUCKET)
        .upload(path, f, { cacheControl: '3600', upsert: false, contentType: f.type || 'image/*' });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error('no public url');
      return data.publicUrl;
    },
    [supabase, user]
  );

  /* ---------------------------- Prompt building --------------------------- */
  const personaObj = useMemo(() => PERSONA.find(p => p.id === personaId), [personaId]);
  const poseObj    = useMemo(() => POSE.find(p => p.id === poseId), [poseId]);
  const sceneObj   = useMemo(() => SCENE.find(s => s.id === sceneId), [sceneId]);

  const livePrompt = useMemo(() => {
    const aspectWords = aspect === '1:1' ? 'square 1:1' : aspect === '4:5' ? 'portrait 4:5' : 'landscape 3:2';
    const faceText = faceMode === 'none' ? 'no visible face; ' : faceMode === 'subtle' ? 'subtle, non-identifiable face features; ' : 'natural face; ';

    return [
      'Generate a photorealistic virtual fashion model wearing ONLY the garment from the input image.',
      `Persona: ${personaObj.gender}, ${personaObj.body}, skin tone ${personaObj.tone}, ${personaObj.head}, ${personaObj.height} height, age ${personaObj.age}.`,
      `Pose/Camera: ${poseObj.pose}, ${poseObj.camera} framing, centered, realistic proportions.`,
      `Scene/Light: ${sceneObj.bg}, ${sceneObj.light}, ${shadowOn ? 'with coherent ground shadow' : 'no ground shadow'}, ${aspectWords} composition.`,
      `Garment placement: ${pieceType ? (pieceType==='upper'?'TOP':pieceType==='lower'?'BOTTOM':pieceType==='dress'?'FULL DRESS':'FULL OUTFIT') : 'TOP'}. Fit: ${fit}.`,
      faceText + 'no brands, no extra text.',
      'Preserve garment anatomy (sleeves, collar, hem, waistband, seams); align scale; natural fabric drape; avoid crop.',
      extraPrompt?.trim() ? `Extra: ${extraPrompt.trim()}` : ''
    ].filter(Boolean).join(' ');
  }, [personaObj, poseObj, sceneObj, pieceType, fit, shadowOn, aspect, faceMode, extraPrompt]);

  /* ------------------------------ Run: Try-On ----------------------------- */
  const runTryOn = useCallback(async () => {
    if (!file) { setErr('حمّل صورة القطعة أولاً.'); return; }
    if (!pieceType) { setErr('اختر نوع القطعة.'); return; }

    setBusy(true); setErr(''); setPhase('processing');
    const toast = toasts.push('Generating Try-On…', { progress: 12 });
    let adv = 12; const iv = setInterval(() => { adv = Math.min(adv + 6, 88); toast.update({ progress: adv }); }, 500);

    try {
      const imageUrl = await uploadToStorage(file);

      const payload = {
        imageUrl,                     // ✅ مطلوب بواسطة /api/tryon
        prompt: livePrompt,           // ✅ مطلوب
        user_email: user.email,       // ✅ مطلوب (يتحقق منه السيرفر)
        plan,                         // اختياري
        aspect_ratio: mapAspectToApi(aspect), // اختياري
        guidance_scale: 3.5,
        safety_tolerance: 2,
        num_images: plan === 'Pro' ? 2 : 1,
        pieceType,                    // لمعلوماتك بالسيرفر (اختياري)
      };

      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `Unexpected error (${r.status})`);

      const out = j?.image || (Array.isArray(j?.variants) ? j.variants[0] : '');
      if (!out) throw new Error('No output image returned from the API.');

      setResultUrl(out);
      setHistory((h) => [{ tool: 'Try-On', inputThumb: localUrl, outputUrl: out, ts: Date.now() }, ...h].slice(0, 24));
      setPhase('ready');
      toast.update({ progress: 100, msg: 'Try-On ✓' });
      setTimeout(() => toast.close(), 700);
    } catch (e) {
      console.error(e);
      setPhase('error'); setErr(e?.message || 'Processing failed.');
      toast.update({ msg: `Try-On failed: ${e?.message || 'Error'}`, type: 'error' });
      setTimeout(() => toast.close(), 1500);
    } finally {
      clearInterval(iv); setBusy(false);
    }
  }, [file, pieceType, user, plan, aspect, livePrompt, uploadToStorage, toasts, localUrl]);

  /* ------------------------------- UI helpers ----------------------------- */
  const initials = (() => {
    const n = user?.user_metadata?.name || user?.email || 'U';
    const p = n.split(' ').filter(Boolean);
    return ((p[0]?.[0] || n[0]) + (p[1]?.[0] || '')).toUpperCase();
  })();

  const SectionTitle = ({ children }) => (
    <div className="mb-2 text-[12px] font-semibold text-zinc-700">{children}</div>
  );

  if (loading || user === undefined) {
    return (
      <main dir="rtl" className="min-h-screen grid place-items-center bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-700">
        <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border border-zinc-200 shadow-sm text-sm">جارِ التحميل…</div>
      </main>
    );
  }
  if (!user) return null;

  return (
    <main dir="rtl" className="relative min-h-screen w-full overflow-clip bg-gradient-to-b from-[#F3FFF8] via-[#FFFCE8] to-white text-zinc-900">
      <BackgroundAuras />

      {/* ------------------------------- Header ------------------------------ */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="sticky top-0 z-40 border-b border-zinc-200/60 backdrop-blur bg-white/60"
      >
        <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 shadow-sm">
              <HeartLeaf className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold"><span className="text-emerald-600">Ur</span>lka Schward</div>
              <div className="text-[11px] text-zinc-600">Sticky header • Glass UI</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">الخطة: {plan}</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 flex items-center gap-2">
              <span className="grid place-items-center size-6 rounded-full bg-zinc-100 font-bold text-zinc-700">{initials}</span>
              {user.user_metadata?.name || user.email}
            </span>
          </div>
        </div>
      </motion.header>

      {/* ------------------------------ Content ------------------------------ */}
      <div className="relative mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[280px_1fr_330px] gap-4 md:gap-6 px-3 md:px-6 lg:px-8 py-4 md:py-6">

        {/* ------------------------------ Left Rail --------------------------- */}
        <aside className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur shadow-sm sticky top-20 h-fit">
          <div className="px-4 py-4 flex items-center gap-3 border-b border-zinc-200/80">
            <div className="grid place-items-center size-10 rounded-2xl bg-gradient-to-br from-[#CFFAE2] to-[#FFF0A6] text-zinc-900 shadow">
              <SparkleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-zinc-900 text-[15px]">القائمة</div>
              <div className="text-[11px] text-zinc-600">Sections</div>
            </div>
          </div>

          <nav className="px-3 py-3 space-y-1">
            {[
              { id: 1, label: 'Sticky header' },
              { id: 2, label: 'Presets' },
              { id: 3, label: 'Try-On Steps' },
              { id: 4, label: 'Quick presets' },
              { id: 5, label: 'History' },
            ].map((it) => (
              <button
                key={it.id}
                className="w-full text-right group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition border bg-white/70 hover:bg-white hover:shadow-sm border-zinc-200"
              >
                <span className="truncate">{it.label}</span>
                <span className="size-6 grid place-items-center rounded-lg bg-zinc-100 text-[11px] text-zinc-700">{it.id}</span>
              </button>
            ))}
          </nav>

          <div className="px-4 py-3 border-t border-zinc-200/80">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center size-10 rounded-full bg-zinc-100 text-zinc-800 font-bold">{initials}</div>
              <div className="text-sm">
                <div className="font-medium leading-tight text-zinc-900">{user.user_metadata?.name || user.email}</div>
                <div className="text-[11px] text-zinc-600">الخطة: {plan}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* --------------------------- Center Workspace ----------------------- */}
        <section className="space-y-5 md:space-y-6">
          {/* Top Card — Try-On header */}
          <motion.div layout className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 sm:p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">Try-On</h1>
                <p className="text-zinc-700/80 text-xs sm:text-sm">١) ارفع القطعة ٢) اختر النوع ٣) اضبط الـPresets ٤) شغّل</p>
              </div>
              <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
                {['الواجهة','الخلفية'].map((l,i)=>(
                  <button key={i} className={[
                    'px-3 py-1.5 text-xs rounded-full transition',
                    i===0 ? 'bg-zinc-900 text-white shadow' : 'text-zinc-900 hover:bg-zinc-100'
                  ].join(' ')}>{l}</button>
                ))}
              </div>
            </div>

            {/* search + extra prompt */}
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_220px]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                <input
                  value={extraPrompt}
                  onChange={(e)=>setExtraPrompt(e.target.value)}
                  placeholder="أضف وصفًا إضافيًا (اختياري) — مثال: natural skin tone, slight smile"
                  className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm"
                />
              </div>
              <div>
                <SelectLike
                  value={pieceType}
                  placeholder="اختر نوع القطعة"
                  onClick={() => setStep('piece')}
                  label={pieceType ? (pieceType==='upper'?'أعلى (قمصان/جاكيت)':
                                       pieceType==='lower'?'أسفل (سراويل/تنورة)':
                                       pieceType==='dress'?'فستان كامل':'طقم كامل') : ''}
                />
              </div>
            </div>

            {/* Quick presets */}
            {step==='options' && (
              <div className="mt-4">
                <SectionTitle>Quick presets</SectionTitle>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {QUICK.map(q => (
                    <QuickCard
                      key={q.id}
                      title={q.title}
                      active={personaId===q.persona && poseId===q.pose && sceneId===q.scene}
                      onClick={() => { setPersonaId(q.persona); setPoseId(q.pose); setSceneId(q.scene); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Workbench */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_330px]">
            {/* Canvas / upload / result */}
            <section className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur relative shadow-sm">
              {/* Stepper */}
              <div className="px-3 sm:px-4 md:px-5 pt-3 md:pt-4">
                <Stepper step={step} pieceType={pieceType} />
              </div>

              {/* Upload / preview */}
              <div
                ref={dropRef}
                className="m-3 sm:m-4 md:m-5 min-h-[260px] sm:min-h-[320px] md:min-h-[380px] grid place-items-center rounded-3xl border-2 border-dashed border-emerald-200/80 bg-white/60 hover:bg-white/70 transition cursor-pointer"
                onClick={() => inputRef.current?.click()}
                title="سحب وإفلات / ضغط للاختيار / لصق (Ctrl+V)"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => { const f = e.target.files?.[0]; if (f) await onPick(f); }}
                />
                {!localUrl && !resultUrl ? (
                  <div className="text-center text-zinc-700 text-sm">
                    <div className="mx-auto mb-3 grid place-items-center size-12 rounded-full bg-white border border-zinc-200">⬆</div>
                    ارفع صورة قطعة الملابس (PNG/JPG). ويفضّل PNG بخلفية شفافة.
                  </div>
                ) : (
                  <div className="relative w-full h-full grid place-items-center p-2 sm:p-3">
                    {!resultUrl ? (
                      <img src={localUrl} alt="cloth" className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
                    ) : (
                      <img src={resultUrl} alt="result" className="max-w-full max-h-[70vh] object-contain rounded-2xl" />
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
                <button
                  onClick={runTryOn}
                  disabled={busy || !file || !pieceType}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {busy ? 'Processing…' : (<><PlayIcon className="size-4" /> Run Try-On</>)}
                </button>

                {resultUrl && (
                  <>
                    <a href={resultUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 text-zinc-900">
                      ↗ فتح الصورة
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(resultUrl).catch(()=>{}); }} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2.5 py-2 text-xs font-semibold hover:bg-zinc-50 text-zinc-900">
                      🔗 نسخ الرابط
                    </button>
                  </>
                )}

                {!!err && <div className="text-xs text-rose-600">{err}</div>}
              </div>

              {/* busy overlay */}
              <AnimatePresence>
                {busy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 rounded-3xl grid place-items-center bg-white/60">
                    <div className="text-xs px-3 py-2 rounded-lg bg-white border border-zinc-200 shadow">Working…</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Inspector / controls */}
            <aside className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 md:pb-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-900">الإعدادات</div>
                <span className="text-xs text-zinc-700">Try-On</span>
              </div>

              {/* step: choose piece */}
              {step === 'piece' && (
                <div className="space-y-3 mt-3">
                  <SectionTitle>نوع القطعة</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'upper', label: 'أعلى (T-Shirt/قميص/جاكيت)' },
                      { id: 'lower', label: 'أسفل (بنطال/تنورة)' },
                      { id: 'dress', label: 'فستان كامل' },
                      { id: 'outfit', label: 'طقم كامل' },
                    ].map(o => (
                      <Chip key={o.id} active={pieceType === o.id} onClick={() => { setPieceType(o.id); setStep('options'); }}>
                        {o.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* step: options */}
              {step === 'options' && (
                <div className="space-y-4 mt-3">
                  <div className="grid gap-3">
                    <PresetGroup
                      title="Persona"
                      items={PERSONA}
                      activeId={personaId}
                      onSelect={setPersonaId}
                      getSubtitle={(p) => `${p.gender}, ${p.body}, tone ${p.tone}`}
                    />
                    <PresetGroup
                      title="Pose & Camera"
                      items={POSE}
                      activeId={poseId}
                      onSelect={setPoseId}
                      getSubtitle={(p) => `${p.pose}, ${p.camera}`}
                    />
                    <PresetGroup
                      title="Scene & Lighting"
                      items={SCENE}
                      activeId={sceneId}
                      onSelect={setSceneId}
                      getSubtitle={(s) => s.light}
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs space-y-2">
                    <div className="text-zinc-700 font-medium">ضبط دقيق</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={fit==='regular'} onClick={()=>setFit('regular')}>Fit: Regular</Chip>
                      <Chip active={fit==='slim'} onClick={()=>setFit('slim')}>Fit: Slim</Chip>
                      <Chip active={fit==='oversized'} onClick={()=>setFit('oversized')}>Fit: Oversized</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={aspect==='1:1'} onClick={()=>setAspect('1:1')}>1:1</Chip>
                      <Chip active={aspect==='4:5'} onClick={()=>setAspect('4:5')}>4:5</Chip>
                      <Chip active={aspect==='3:2'} onClick={()=>setAspect('3:2')}>3:2</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={shadowOn} onClick={()=>setShadowOn(true)}>Shadow: On</Chip>
                      <Chip active={!shadowOn} onClick={()=>setShadowOn(false)}>Shadow: Off</Chip>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Chip active={faceMode==='subtle'} onClick={()=>setFaceMode('subtle')}>Face: Subtle</Chip>
                      <Chip active={faceMode==='none'} onClick={()=>setFaceMode('none')}>Face: None</Chip>
                      <Chip active={faceMode==='natural'} onClick={()=>setFaceMode('natural')}>Face: Natural</Chip>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs">
                    <div className="text-zinc-700 mb-2">نص البرومبت (يُرسل للموديل)</div>
                    <div className="max-h-40 overflow-auto leading-relaxed text-[11px] text-zinc-700">{livePrompt}</div>
                  </div>

                  {resultUrl && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                      <div className="text-zinc-700 mb-2 text-xs">النتيجة</div>
                      <img src={resultUrl} alt="final" className="w-full max-h-64 object-contain rounded-md border border-zinc-100 bg-white/60" />
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>

          {/* History */}
          <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-zinc-900">السجل</div>
              {history.length > 0 && (
                <button onClick={()=>setHistory([])} className="text-xs px-2 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900">مسح</button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-xs text-zinc-600 px-1 py-4">— لا توجد نتائج بعد —</div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {history.map((h,i)=>(
                  <button key={i} onClick={()=>setResultUrl(h.outputUrl)} className="group relative rounded-2xl overflow-hidden border border-zinc-200 hover:border-zinc-300 transition bg-white/60 min-w-[160px]">
                    <img src={h.outputUrl || h.inputThumb} alt="hist" className="w-[160px] h-[110px] object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-zinc-800/50 text-white backdrop-blur">
                      {h.tool} • {new Date(h.ts).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --------------------------- Right Reference ------------------------ */}
        <aside className="space-y-5 md:space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="text-sm font-semibold mb-2">Design system cheat sheet</div>
            <ol className="text-xs text-zinc-700 leading-6 list-decimal pr-4">
              <li>Clear hierarchy</li>
              <li>Progressive disclosure</li>
              <li>One primary action</li>
              <li>Visual breathing</li>
              <li>Responsive grid</li>
              <li>Sticky header</li>
              <li>Control spacing</li>
              <li>Empty states</li>
              <li>Skeleton loading</li>
              <li>Safe errors</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-4 shadow-sm">
            <div className="text-sm font-semibold mb-3">Components</div>
            <div className="grid gap-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-3 flex items-center justify-between text-xs">
                <span>Persona</span>
                <span className="inline-flex gap-1">
                  <MiniPill>+</MiniPill>
                  <MiniPill>−</MiniPill>
                </span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition">
                  <PlayIcon className="size-4" /> Run Try-On
                </button>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-3 flex items-center justify-between text-xs">
                <span>Cancel</span>
                <MiniPill>→</MiniPill>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ToastHost items={toasts.items} onClose={toasts.remove} />
    </main>
  );
}

/* ------------------------------ Reusables -------------------------------- */
function BackgroundAuras() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full" style={{ background: MINT }} />
      <div className="absolute top-24 -right-16 h-80 w-80 rounded-full" style={{ background: LEMON }} />
      <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full" style={{ background: '#E8FFF4' }} />
      <div className="blur-3xl absolute inset-0 opacity-60"
           style={{ background: 'radial-gradient(60% 40% at 30% 0%, #D8FFEA 0%, transparent 60%), radial-gradient(50% 40% at 100% 10%, #FFF7B3 0%, transparent 55%)' }} />
    </div>
  );
}

function Stepper({ step, pieceType }) {
  const map = { cloth: 0, piece: 1, options: 2 };
  const idx = map[step] ?? 0;
  const steps = [
    { id: 'cloth', label: 'رفع القطعة' },
    { id: 'piece', label: pieceType ? `النوع: ${pieceType}` : 'اختيار النوع' },
    { id: 'options', label: 'اختيار Presets' },
  ];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i < idx; const active = i === idx;
          return (
            <div key={s.id} className="flex-1">
              <div className="flex items-center gap-2">
                <motion.div layout className={[
                  'size-6 rounded-full grid place-items-center border text-[11px] font-semibold',
                  done ? 'bg-emerald-600 text-white border-emerald-600' : active ? 'bg-white text-zinc-900 border-zinc-300' : 'bg-white text-zinc-700 border-zinc-200',
                ].join(' ')}>{done ? '✓' : i + 1}</motion.div>
                <div className={['text-xs sm:text-[13px]', done ? 'text-zinc-700' : active ? 'text-zinc-900' : 'text-zinc-700/80'].join(' ')}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <motion.div layout className="h-1 mt-2 rounded-full bg-zinc-200 overflow-hidden">
                  <motion.div initial={false} animate={{ width: i < idx ? '100%' : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="h-full bg-emerald-600" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full border text-xs transition',
        active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-100'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function QuickCard({ title, active, onClick }) {
  return (
    <motion.button onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
      className={[
        'rounded-xl border px-3 py-2 text-sm text-right transition',
        active ? 'border-zinc-400 bg-white shadow-sm' : 'border-zinc-200 bg-white/80 hover:bg-white'
      ].join(' ')}
    >
      {title}
    </motion.button>
  );
}

function PresetGroup({ title, items, activeId, onSelect, getSubtitle }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="mb-2 text-[12px] font-semibold text-zinc-700">{title}</div>
      <div className="grid gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={[
              'w-full text-right rounded-xl border px-3 py-2 text-sm transition',
              activeId === it.id ? 'border-zinc-400 bg-white' : 'border-zinc-200 hover:bg-white/70'
            ].join(' ')}
          >
            <div className="font-semibold text-zinc-900">{it.label}</div>
            <div className="text-[11px] text-zinc-600">{getSubtitle ? getSubtitle(it) : ''}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectLike({ value, label, placeholder, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full h-[38px] rounded-2xl border border-zinc-200 bg-white px-3 text-sm flex items-center justify-between">
      <span className={`truncate ${value ? 'text-zinc-900' : 'text-zinc-500'}`}>{value ? label : placeholder}</span>
      <span className="text-zinc-500">▾</span>
    </button>
  );
}

function MiniPill({ children }) {
  return (
    <span className="inline-grid place-items-center rounded-md bg-zinc-100 px-2 h-6">{children}</span>
  );
}

/* --------------------------------- Icons --------------------------------- */
function HeartLeaf(props){ return (<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 21s-6.7-4.5-9.5-7.3A6 6 0 1 1 12 5a6 6 0 1 1 9.5 8.7C18.7 16.5 12 21 12 21z" fill="currentColor"/></svg>); }
function SparkleIcon(props){ return (<svg viewBox="0 0 24 24" className={props.className||''}><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor" /></svg>); }
function PlayIcon(props){ return (<svg viewBox="0 0 24 24" className={props.className||''}><path d="M8 5v14l11-7z" fill="currentColor"/></svg>); }

/* ---------------------------- (Optional) Export --------------------------- */
async function exportPngSafe(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = 'studio-output.png';
    document.body.appendChild(a); a.click(); a.remove();
  } catch {
    const a = document.createElement('a'); a.href = url; a.download = 'studio-output.png';
    document.body.appendChild(a); a.click(); a.remove();
  }
}
