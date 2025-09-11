export default function handler(req, res) {
  console.log('SMS received from:', req.body.From);
  console.log('Message:', req.body.Body);
  
  res.status(200);
  res.setHeader('Content-Type', 'text/xml');
  res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}