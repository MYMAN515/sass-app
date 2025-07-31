// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/pricing`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Stripe error:', err.message); // 👈 for debugging
      res.status(500).json({ error: 'Stripe checkout failed' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
