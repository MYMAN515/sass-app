// ✅ أرسل الطلب الأول
const predictionRes = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: 'black-forest-labs/flux-kontext-max',
    input: {
      input_image: imageUrl,
      prompt,
      aspect_ratio: '1:1',
    },
  }),
});

const prediction = await predictionRes.json();
console.log('[DEBUG] Replicate prediction response:', prediction);

if (!prediction?.urls?.get) {
  console.error('[ERROR] No prediction get URL');
  return res.status(500).json({ error: 'Failed to get prediction' });
}

// ✅ انتظر حتى يتم التوليد (Polling)
let finalResult = null;
for (let i = 0; i < 20; i++) {
  const statusRes = await fetch(prediction.urls.get, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
    },
  });
  const statusData = await statusRes.json();

  console.log(`[DEBUG] Polling status [${i}]:`, statusData.status);

  if (statusData.status === 'succeeded') {
    finalResult = statusData;
    break;
  } else if (statusData.status === 'failed') {
    console.error('[ERROR] Image generation failed inside Replicate');
    return res.status(500).json({ error: 'Image generation failed (model error)' });
  }

  await new Promise((r) => setTimeout(r, 1500)); // ⏳ انتظر 1.5 ثانية قبل الاستعلام مجددًا
}

if (!finalResult?.output) {
  return res.status(500).json({ error: 'Image generation did not complete in time' });
}

const generatedImage = finalResult.output[0]; // ✅ هذه هي الصورة الجاهزة
console.log('[DEBUG] Final generated image:', generatedImage);

// ✅ الآن بعد ما الصورة نجحت، تخصم الكريدت
if (userData.plan !== 'Pro') {
  const { error: rpcError } = await supabase.rpc('decrement_credit', {
    user_email: userEmail,
  });

  if (rpcError) {
    console.error('[ERROR] Failed to decrement credit:', rpcError);
  } else {
    console.log('[DEBUG] Credit decremented successfully');
  }
}

return res.status(200).json({ success: true, image: generatedImage });
