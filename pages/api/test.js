import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const email = req.query.email?.toLowerCase(); // خليه lowercase للتطابق

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ records: data });
}
