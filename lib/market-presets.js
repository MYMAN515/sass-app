// lib/market-presets.js
export const MARKET_PRESETS = {
  amazon: {
    label: 'Amazon',
    size: [1000, 1000],
    bg: '#ffffff',
    fillMin: 0.85,
    format: 'jpeg',
    quality: 0.9,
    filename: (base) => `${base}_amazon_1000.jpg`,
  },
  etsy: {
    label: 'Etsy',
    size: [3000, 2400],
    bg: '#ffffff',
    fillMin: 0.70,
    format: 'jpeg',
    quality: 0.9,
    filename: (base) => `${base}_etsy_3000x2400.jpg`,
  },
  shopify: {
    label: 'Shopify',
    size: [2048, 2048],
    bg: '#ffffff',
    fillMin: 0.80,
    format: 'jpeg',
    quality: 0.92,
    filename: (base) => `${base}_shopify_2048.jpg`,
  },
};
