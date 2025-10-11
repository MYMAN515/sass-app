import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { buildDashboardSnapshot } from '@/lib/adminDashboard';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!roleRow || !['admin', 'editor'].includes(roleRow.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const snapshot = await buildDashboardSnapshot({
      supabase,
      userId: session.user.id,
      userEmail: session.user.email || '',
    });

    return res.status(200).json(snapshot);
  } catch (error) {
    console.error('Admin overview API error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
