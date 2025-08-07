import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { action, name, email, password } = req.body;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!action || !email || !password || (action === 'register' && !name)) {
    return res.status(400).json({ error: 'Missing fields or action' });
  }

  if (action === 'login') {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    return res.status(200).json({ user: data.user, session: data.session });
  }

  if (action === 'register') {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) return res.status(500).json({ error: signUpError.message });

    const userId = signUpData.user?.id;
    const { error: insertErr } = await supabase.from('Data').insert({
      user_id: userId,
      name,
      email,
      Provider: 'Default',
      credits: 5  // هنا تمنح 5 Credits تلقائيًا
    });
    if (insertErr) return res.status(500).json({ error: insertErr.message });

    return res.status(201).json({ user: signUpData.user, message: 'Registered with 5 credits' });
  }

  res.status(400).json({ error: 'Invalid action' });
}
