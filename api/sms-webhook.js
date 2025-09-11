// api/sms-webhook.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
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
  console.log('Webhook called with method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('Invalid method, returning 405');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { From, Body, MessageSid, To } = req.body;

    console.log('Received SMS from Twilio:', {
      from: From,
      to: To,
      body: Body,
      sid: MessageSid
    });

    // Save to Firebase if initialized
    if (db) {
      await saveSMSToFirebase({
        phoneNumber: From,
        body: Body,
        direction: 'inbound',
        twilioSid: MessageSid,
        to: To
      });
    } else {
      console.log('Firebase not initialized, message not saved');
    }

    // Respond to Twilio with success
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
      </Response>`);

  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    
    // Still respond successfully to Twilio to avoid retries
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
      </Response>`);
  }
}

async function saveSMSToFirebase({ phoneNumber, body, direction, twilioSid, to }) {
  try {
    console.log('Saving SMS to Firebase:', { phoneNumber, body, direction });

    // Save the message
    const messageData = {
      phoneNumber,
      body,
      direction,
      sentAt: serverTimestamp(),
      twilioSid
    };

    await addDoc(collection(db, 'sms_messages'), messageData);
    console.log('Message saved to sms_messages collection');

    // Update or create conversation
    const conversationRef = doc(db, 'sms_conversations', phoneNumber);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      // Update existing conversation
      await setDoc(conversationRef, {
        lastMessage: body,
        lastMessageAt: serverTimestamp(),
        unreadCount: increment(1),
        status: 'active'
      }, { merge: true });
      console.log('Updated existing conversation');
    } else {
      // Create new conversation
      await setDoc(conversationRef, {
        phoneNumber,
        contactName: null, // Can be updated later
        lastMessage: body,
        lastMessageAt: serverTimestamp(),
        unreadCount: 1,
        status: 'pending', // New conversations start as pending
        assignedTo: null
      });
      console.log('Created new conversation');
    }

  } catch (error) {
    console.error('Error saving SMS to Firebase:', error);
    throw error; // Re-throw to be caught by main handler
  }
}