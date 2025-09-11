const twilio = require('twilio');

export default async function handler(req, res) {
  console.log('Webhook called with method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Raw body:', req.body);

  if (req.method !== 'POST') {
    console.log('Invalid method, returning 405');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Twilio sends form-encoded data, not JSON
    const { From, Body, MessageSid, To } = req.body;

    console.log('Parsed SMS data:', {
      from: From,
      to: To,
      body: Body,
      sid: MessageSid
    });

    // Respond with TwiML
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
      </Response>`);

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error');
  }
}