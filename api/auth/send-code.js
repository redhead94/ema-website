// api/auth/send-code.js
import { generateVerificationCode, storeVerificationCode } from '../../src/utils/auth';
import { normalizePhone } from '../../src/utils/conversation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const normalizedPhone = normalizePhone(phone);
    const code = generateVerificationCode();
    
    // Store the code
    storeVerificationCode(normalizedPhone, code);
    
    // Send SMS
    const smsResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: normalizedPhone,
        message: `Your EMA verification code is: ${code}. This code expires in 5 minutes.`,
        sentBy: 'System'
      })
    });

    if (!smsResponse.ok) {
      throw new Error('Failed to send SMS');
    }

    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent'
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ 
      error: 'Failed to send verification code'
    });
  }
}
