// /api/create-checkout-session.js
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, currency = 'usd', donor } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount (in cents) is required' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'us_bank_account'], // bank payments optional; remove if not needed
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Donation to EMA' },
            unit_amount: amount, // integer cents
          },
          quantity: 1,
        },
      ],
      customer_email: donor?.email,
      metadata: {
        donor_name: donor?.name || '',
        donor_phone: donor?.phone || '',
        donor_message: donor?.message || '',
      },
      allow_promotion_codes: true,
      success_url: `${process.env.SITE_URL}/donate?status=success`,
      cancel_url: `${process.env.SITE_URL}/donate?status=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Checkout session' });
  }
}
