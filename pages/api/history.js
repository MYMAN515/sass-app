// pages/api/history.js
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }

  return res.status(200).json({ records: data });
}
