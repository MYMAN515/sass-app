import { addWatermarkToImage } from '@/lib/addWatermarkToImage';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
    const supabase = createServerClient({ req, res });
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageUrl, prompt, plan = 'Free', user_email } = req.body || {};

  if (!imageUrl || !prompt || !user_email) {
    return res.status(400).json({ error: 'Missing imageUrl, prompt, or user_email' });
  }

  // ✅ Get session to extract user_id
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const user_id = session?.user?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // ✅ Credit check for paid users
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
      return res.status(403).json({ error: 'You have no remaining credits. Please upgrade your plan.' });
    }
  }

  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Replicate API token not set' });
  }
console.log('session user?', (await supabase.auth.getUser()).data?.user);

  // ✅ Start replicate generation
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

  const startData = await startRes.json();

  if (!startRes.ok || !startData?.urls?.get) {
    return res.status(400).json({
      error: startData?.error || 'Replicate API failed to start generation',
      detail: startData,
    });
  }

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

  let finalOutput = output;
  if (plan === 'Free') {
    try {
      finalOutput = await addWatermarkToImage(output);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to apply watermark', detail: err.message });
    }
  }

  if (plan !== 'Free') {
    const { error: creditError } = await supabase.rpc('decrement_credit', {
      user_email: user_email,
    });

    if (creditError) {
      console.error('Credit deduction failed:', creditError);
    }
  }

  // ✅ Insert the enhancement into the Data table with user_id
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

  return res.status(200).json({ output: finalOutput });
}
