// pages/api/test-kontext.js

export default async function handler(req, res) {
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "c0fb2c14a1c17754800d0830f16838a83151d877a19b03201f142aa29f846e49",
      input: {
        prompt: "Replace the shirt with a red hoodie, clean white background",
        input_image:
          "https://replicate.delivery/pbxt/Ti1n9dujaFXP1CrzSEa9YnC8jsdkCnOcyoiB8KnNipNChRMG/A.png",
        aspect_ratio: "match_input_image",
        output_format: "jpg",
        safety_tolerance: 2,
      },
    }),
  });

  const prediction = await response.json();

  // Wait until prediction completes
  let predictionResult = prediction;
  while (
    predictionResult.status !== "succeeded" &&
    predictionResult.status !== "failed"
  ) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Token ${replicateApiToken}`,
      },
    });
    predictionResult = await poll.json();
  }

  if (predictionResult.status === "succeeded") {
    res.status(200).json({ image: predictionResult.output });
  } else {
    res.status(500).json({ error: "Image generation failed" });
  }
}
