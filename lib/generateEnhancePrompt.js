function generateEnhancePromptFromChoices({ productType, photographyStyle, background, lighting, purpose }) {
  return `
Enhance the uploaded ${productType} photo using a ${photographyStyle} setup.
Use a ${background} background with ${lighting} lighting conditions.
Final output should look ${purpose}-ready with clarity, realism, and modern styling.
`.trim();
}
