// api/auth/verify-code.js
import { verifyCode } from '../../src/utils/auth';
import { normalizePhone } from '../../src/utils/conversation';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import jwt from 'jsonwebtoken'; // Only use JWT on server side

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }

    const normalizedPhone = normalizePhone(phone);
    
    // Verify the code
    if (!verifyCode(normalizedPhone, code)) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Look up user in volunteers and families
    const userInfo = await findUserByPhone(normalizedPhone);
    
    if (!userInfo) {
      return res.status(404).json({ 
        error: 'No account found with this phone number. Please contact EMA to get registered.' 
      });
    }

    // Create or update user record
    const userId = await createOrUpdateUser(userInfo);
    
    // Generate JWT token (server-side only)
    const token = jwt.sign(
      { userId, type: userInfo.type, profileId: userInfo.profileId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        name: userInfo.name,
        type: userInfo.type,
        profileId: userInfo.profileId
      }
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ 
      error: 'Failed to verify code'
    });
  }
}

async function findUserByPhone(phone) {
  try {
    // Check volunteers
    const volunteersQuery = query(
      collection(db, 'volunteers'),
      where('volunteerPhone', '==', phone)
    );
    const volunteerSnapshot = await getDocs(volunteersQuery);
    
    if (!volunteerSnapshot.empty) {
      const volunteerDoc = volunteerSnapshot.docs[0];
      const data = volunteerDoc.data();
      return {
        type: 'volunteer',
        profileId: volunteerDoc.id,
        name: data.volunteerName,
        email: data.volunteerEmail,
        phone: data.volunteerPhone
      };
    }

    // Check families
    const familiesQuery = query(
      collection(db, 'registrations'),
      where('motherPhone', '==', phone)
    );
    const familySnapshot = await getDocs(familiesQuery);
    
    if (!familySnapshot.empty) {
      const familyDoc = familySnapshot.docs[0];
      const data = familyDoc.data();
      return {
        type: 'family',
        profileId: familyDoc.id,
        name: data.motherName,
        email: data.motherEmail,
        phone: data.motherPhone
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding user by phone:', error);
    throw error;
  }
}

async function createOrUpdateUser(userInfo) {
  try {
    const userId = `${userInfo.type}_${userInfo.profileId}`;
    
    await setDoc(doc(db, 'users', userId), {
      email: userInfo.email,
      phone: userInfo.phone,
      name: userInfo.name,
      type: userInfo.type,
      profileId: userInfo.profileId,
      lastLogin: new Date(),
      createdAt: new Date(),
      isActive: true
    }, { merge: true });

    return userId;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

