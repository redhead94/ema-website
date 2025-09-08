// Vercel Serverless Function to fetch details for the Thank You banner
import Stripe from 'stripe';

// console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent.latest_charge', 'customer_details'],
    });

    const pi = session.payment_intent;
    const charge = pi?.latest_charge;

    res.status(200).json({
      // high-level payment result
      status: session.payment_status,              // 'paid'
      amount_total: session.amount_total,          // cents
      currency: session.currency,                  // 'usd'
      // donor information
      donor_name: session.metadata?.donor_name || '',
      donor_message: session.metadata?.donor_message || '',
      customer_email: session.customer_details?.email || null,
      // receipts/ids
      receipt_url: charge?.receipt_url || null,
      session_id: session.id,
      payment_intent_id: typeof pi === 'string' ? pi : pi?.id || null,
      charge_id: typeof charge === 'string' ? charge : charge?.id || null,
    });
  } catch (err) {
    console.error('get-checkout-session error', err);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
}
