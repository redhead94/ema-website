
export default async function handler(req, res) {
  // Log everything for debugging
  console.log('Webhook called:', {
    method: req.method,
    body: req.body,
    headers: req.headers
  });

  // Always return 200 to Twilio, regardless of method
  if (req.method === 'POST') {
    const { From, Body, MessageSid } = req.body;
    console.log('SMS received:', { From, Body, MessageSid });
  }

  // Return proper TwiML response
  res.status(200);
  res.setHeader('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
}