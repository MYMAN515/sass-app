import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: existingUser } = await supabase
    .from('Data')
    .select('email')
    .eq('email', normalizedEmail)
    .single();

  if (existingUser?.email) {
    return res.status(409).json({ error: `Email "${normalizedEmail}" already registered` });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (signUpError) {
    console.error('[Auth SignUp Error]', signUpError);
    return res.status(500).json({ error: signUpError.message });
  }

  const user = authData?.user;
  if (!user) {
    return res.status(500).json({ error: 'Failed to create user' });
  }

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

  return res.status(201).json({ success: true, message: 'User registered. Please confirm your email.' });
}
