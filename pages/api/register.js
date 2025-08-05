import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { name, email, password } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!name || !email || !password || !token) {
    return res.status(400).json({ error: 'Missing fields or token' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid token or user not found' });
  }

  const { data: existingUser } = await supabase
    .from('Data')
    .select('email')
    .eq('email', normalizedEmail)
    .single();

  if (existingUser?.email) {
    return res.status(409).json({ error: `Email "${normalizedEmail}" already registered` });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: insertError } = await supabase.from('Data').insert([
    {
      user_id: user.id,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      Provider: 'Default',
    },
  ]);

  if (insertError) {
    console.error('[Register Error]', insertError);
    return res.status(500).json({ error: insertError.message });
  }

  return res.status(201).json({ success: true, message: 'User registered' });
}
