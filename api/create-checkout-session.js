import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


   if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
     console.log('Creating checkout session...'); 
    const { amount, currency = 'usd', donor } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount (in cents) is required' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'us_bank_account'], // remove us_bank_account if you don't want ACH
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
      // Updated success URL to redirect to thank you page
      success_url: `${process.env.SITE_URL}/thank-you?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/donate?status=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Failed to create Checkout session' });
  }
}