import { createServerClient } from '@supabase/auth-helpers-nextjs';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageUrl, prompt, plan = 'Free', user_email } = req.body || {};

  if (!imageUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing imageUrl, prompt, or user_email' });
  }

  const supabase = createServerClient(req, res);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user_id = session?.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Check user credits if plan isn't Free
  if (plan !== 'Free') {
    const { data, error } = await supabase
      .from('Data')
      .select('credits')
      .eq('email', user_email)
      .single();

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to fetch user credits' });
    }

    if (data.credits <= 0) {
      return res.status(403).json({ error: 'No credits remaining. Please upgrade.' });
    }
  }

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Replicate API token not set' });
  }

  let startData;
  const startRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'black-forest-labs/flux-kontext-max',
      input: {
        prompt,
        input_image: imageUrl,
        aspect_ratio: 'match_input_image',
        output_format: 'jpg',
        safety_tolerance: 2,
      },
    }),
  });

  try {
    startData = await startRes.json();
  } catch (err) {
    const text = await startRes.text();
    console.error('Non-JSON response from Replicate:', text);
    return res.status(500).json({
      error: 'Invalid JSON from Replicate',
      detail: text.slice(0, 300),
    });
  }

  if (!startRes.ok || !startData?.urls?.get) {
    return res.status(400).json({
      error: startData?.error || 'Replicate API failed to start generation',
      detail: startData,
    });
  }

  // Polling for completion
  const statusUrl = startData.urls.get;
  let output = null;
  let pollCount = 0;
  const maxPolls = 30;

  while (pollCount < maxPolls) {
    const pollRes = await fetch(statusUrl, {
      headers: { Authorization: `Token ${REPLICATE_TOKEN}` },
    });
    const pollData = await pollRes.json();

    if (pollData.status === 'succeeded') {
      output = pollData.output;
      break;
    }

    if (pollData.status === 'failed') {
      return res.status(500).json({ error: 'AI generation failed', detail: pollData });
    }

    await new Promise((r) => setTimeout(r, 2000));
    pollCount++;
  }

  if (!output) {
    return res.status(504).json({ error: 'Timed out waiting for AI result' });
  }

  // Deduct credit if not Free
  if (plan !== 'Free') {
    const { error: creditError } = await supabase.rpc('decrement_credit', {
      user_email,
    });

    if (creditError) {
      console.error('Credit deduction failed:', creditError);
    }
  }

  // Log the result
  const { error: insertError } = await supabase.from('Data').insert([
    {
      email: user_email,
      user_id,
      image_url: imageUrl,
      prompt,
      plan,
    },
  ]);

  if (insertError) {
    console.error('Insert failed:', insertError);
    return res.status(500).json({ error: 'Failed to insert enhancement log', detail: insertError.message });
  }

  return res.status(200).json({ output });
}
