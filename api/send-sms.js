// api/send-sms.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const twilio = require('twilio');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
    const { message, sentBy = 'Admin' } = req.body;
    const to = normalizePhone(req.body.to);

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    console.log('Sending SMS:', { to, message: message.substring(0, 50) + '...', sentBy });

    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send SMS via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent successfully via Twilio:', twilioMessage.sid);

    // Save to Firebase if available
    if (db) {
      try {
        
        // Save the outbound message
        await addDoc(collection(db, 'sms_messages'), {
          phoneNumber: to,
          body: message,
          direction: 'outbound',
          sentAt: serverTimestamp(),
          sentBy: sentBy,
          twilioSid: twilioMessage.sid
        });

        console.log('Outbound message saved to Firebase');

        // Update the conversation
        const conversationRef = doc(db, 'sms_conversations', to);
        await updateDoc(conversationRef, {
          lastMessage: message,
          lastMessageAt: serverTimestamp(),
          status: 'active'
        });

        console.log('Conversation updated in Firebase');

      } catch (firebaseError) {
        console.error('Error saving to Firebase (SMS still sent):', firebaseError);
        // Don't fail the API call if Firebase fails - SMS was already sent
      }
    } else {
      console.warn('Firebase not initialized - message sent but not saved');
    }

    res.status(200).json({
      success: true,
      messageSid: twilioMessage.sid,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to send SMS';
    
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format';
    } else if (error.code === 21408) {
      errorMessage = 'Permission to send SMS to this number is denied';
    } else if (error.code === 21614) {
      errorMessage = 'SMS is not supported for this destination';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
}