const loginWithToken = async () => {
  try {
    setStatus('verifying');
    console.log('[VerifyEmail] Access Token:', access_token);

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: '', // May not be needed
    });

    if (error) {
      console.error('[VerifyEmail] Supabase Error:', error.message);
      throw error;
    }

    console.log('[VerifyEmail] Supabase Session:', data);

    const user = data?.user || data?.session?.user;

    if (user?.email) {
      console.log('[VerifyEmail] Logged in user:', user);

      Cookies.set('user', JSON.stringify({ email: user.email }), {
        expires: 7,
        path: '/',
      });

      await supabase.from('Data').upsert({
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        Provider: user.app_metadata?.provider || 'email',
        created_at: new Date().toISOString(),
        credits: 10,
        plan: 'Free',
      });

      console.log('[VerifyEmail] User inserted into Data table');
    }

    setStatus('success');
    setTimeout(() => router.replace('/dashboard'), 1500);
  } catch (err) {
    console.error('[VerifyEmail] Caught error:', err);
    setStatus('error');
    setError('❌ Failed to verify your email. Please try again.');
  }
};
