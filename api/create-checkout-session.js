import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { amount, currency = 'usd', donor } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount (in cents) is required' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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