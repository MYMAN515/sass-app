import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // ✅ Check for existing user
  const { data: existingUser } = await supabase
    .from('Data') // Your actual table name
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // ✅ Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Insert new user into Supabase
  const { error } = await supabase.from('Data').insert([
    {
      name,
      email,
      password: hashedPassword,
    },
  ]);

  if (error) {
    console.error('[Register Error]', error.message);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(201).json({ success: true, message: 'User registered' });
}


