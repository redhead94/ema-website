import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs-config';
import { saveRegistration, saveVolunteer, saveContact, saveDonation } from '../services/firebaseService';
import { debugFirebaseConfig } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendWelcomeSMSWithType } from '../utils/sms';

// Import the Firebase receipt functions
import { handleDonationWithFirebaseReceipt, createReceiptDownload } from '../utils/firebaseReceipts';

// EmailJS configuration (keep existing)
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID;
const PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY;
const TEMPLATE_IDS = {
  forms:    process.env.REACT_APP_EMAILJS_TEMPLATE_FORMS    || EMAILJS_CONFIG.TEMPLATE_FORMS,
  donation: process.env.REACT_APP_EMAILJS_TEMPLATE_DONATION || EMAILJS_CONFIG.TEMPLATE_DONATION,
};

// Keep existing form email function (unchanged)
const sendFormEmail = async (formType, formData) => {
  try {
    let templateParams = {
      form_type: formType,
      submission_date: new Date().toLocaleDateString(),
      to_email: EMAILJS_CONFIG.ORGANIZATION_EMAIL,
    };

    switch (formType) {
      case 'Family Registration':
        templateParams = {
          ...templateParams,
          name: formData.motherName,
          mother_name: formData.motherName,
          mother_email: formData.motherEmail,
          mother_phone: formData.motherPhone,
          address: formData.address,
          baby_birthday: formData.babyBirthday,
          number_of_children: formData.numberOfChildren,
          dietary_restrictions: formData.dietaryRestrictions,
          meal_train_url: formData.mealTrainUrl,
          shul_affiliation: formData.shulAffiliation,
        };
        break;
      case 'Volunteer Application':
        templateParams = {
          ...templateParams,
          name: formData.volunteerName,
          volunteer_name: formData.volunteerName,
          volunteer_email: formData.volunteerEmail,
          volunteer_phone: formData.volunteerPhone,
          best_contact_method: formData.bestContactMethod || 'Not specified',
          available_days: Array.isArray(formData.availableDays) ? formData.availableDays.join(', ') : (formData.availableDays || 'Not specified'),
          available_times: Array.isArray(formData.availableTimes) ? formData.availableTimes.join(', ') : (formData.availableTimes || 'Not specified'),
          additional_info: formData.additionalInfo || 'None provided',
        };
        break;
      case 'Contact Form':
        templateParams = {
          ...templateParams,
          name: formData.name,
          contact_name: formData.name,
          contact_email: formData.email,
          message: formData.message,
        };
        break;
      default:
        throw new Error(`Unknown form type: ${formType}`);
    }

    const result = await emailjs.send(SERVICE_ID, TEMPLATE_IDS.forms, templateParams, PUBLIC_KEY);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send ${formType} email:`, error);
    return { success: false, error: error.message };
  }
};

const useFormData = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // Keep existing handleSubmit function (unchanged)
  const handleSubmit = async (formType) => {
    console.log('Form submission started for:', formType);
    debugFirebaseConfig();
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      const validationResult = validateForm(formType, formData);
      if (!validationResult.isValid) {
        setSubmitMessage(validationResult.message);
        return { success: false, error: 'Validation failed' };
      }

      let firebaseResult;
      let smsSuccess;
      try {
        switch (formType) {
          case 'Family Registration':
            firebaseResult = await saveRegistration(formData);

            // Send welcome SMS
            smsSuccess = await sendWelcomeSMSWithType(
              formData.phone, 
              'family', 
              formData.motherName
            );

            if (!smsSuccess) {
              console.warn('Welcome SMS failed to send, but registration was successful');
            }
            break;
          case 'Volunteer Application':
            firebaseResult = await saveVolunteer(formData);
            // Send welcome SMS
            smsSuccess = await sendWelcomeSMSWithType(
              formData.phone, 
              'volunteer', 
              formData.name
            );

            if (!smsSuccess) {
              console.warn('Welcome SMS failed to send, but registration was successful');
            }

            break;
          case 'Contact Form':
            firebaseResult = await saveContact(formData);
            break;
          default:
            firebaseResult = { success: true };
        }
      } catch (fbError) {
        console.error('Firebase error:', fbError);
        firebaseResult = { success: false, error: fbError.message };
      }

      if (!firebaseResult.success) {
        setSubmitMessage(`Error saving data: ${firebaseResult.error}`);
        return { success: false, error: firebaseResult.error };
      }

    
      try {
        const emailResult = await sendFormEmail(formType, formData);
        if (emailResult.success) {
          setSubmitMessage(`${formType} submitted successfully! We'll be in touch soon.`);
          setTimeout(() => { 
            setFormData(initialState); 
            setSubmitMessage(''); 
          }, 3000);
          return { success: true };
        } else {
          setSubmitMessage(`Data saved, but email notification failed: ${emailResult.error}`);
          return { success: false, error: emailResult.error };
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        setSubmitMessage(`Data saved, but email notification failed: ${emailError.message}`);
        return { success: false, error: emailError.message };
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage(`Error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }

  
  };

  // UPDATED: This is where you use handleDonationWithFirebaseReceipt
  const handleStripeDonationResult = async (session) => {
    console.log('Processing Stripe donation result:', session);
    
    const dedupKey = `donation_ack_${session.session_id}`;
    if (localStorage.getItem(dedupKey)) {
      console.log('Donation already processed, skipping');
      return { success: true, deduped: true };
    }

    const donationData = {
      donorName: session.donor_name || 'Anonymous',
      donorEmail: session.customer_email || null,
      donorPhone: formData?.donorPhone || null,
      donorMessage: session.donor_message || '',
      amountCents: session.amount_total,
      amountDisplay: `$${(session.amount_total / 100).toFixed(2)}`,
      currency: session.currency || 'usd',
      transactionId: session.session_id,
      receiptUrl: session.receipt_url || '',
      sessionId: session.session_id,
      paymentIntentId: session.payment_intent_id || null,
      chargeId: session.charge_id || null,
      status: session.status,
      donationDate: new Date().toISOString(),
      paymentMethod: 'Credit Card',
    };

    try {
      // Save to Firestore first
      const fb = await saveDonation(donationData);
      if (!fb.success) {
        console.error('Firebase save failed:', fb.error);
        // Continue anyway - don't fail for database issues
      }

      // HERE'S WHERE YOU USE handleDonationWithFirebaseReceipt
      console.log('Uploading receipt to Firebase and sending emails...');
      const receiptResult = await handleDonationWithFirebaseReceipt(donationData);
      
      if (receiptResult.success) {
        console.log('Receipt uploaded and emails sent successfully');
        console.log('Receipt download URL:', receiptResult.downloadURL);
        
        // Update the donation record with the receipt URL
        if (fb.success && receiptResult.downloadURL) {
          try {
            await updateDoc(doc(db, 'donations', fb.id), {
              receiptDownloadURL: receiptResult.downloadURL
            });
            console.log('Updated donation record with receipt URL');
          } catch (updateError) {
            console.warn('Could not update donation with receipt URL:', updateError);
          }
        }
      } else {
        console.warn('Receipt processing failed:', receiptResult.error);
        // Fallback: create local download
        console.log('Falling back to local PDF download');
        createReceiptDownload(donationData);
      }

      localStorage.setItem(dedupKey, '1');
      return { 
        success: true, 
        id: fb.id || 'temp-id',
        receiptURL: receiptResult.downloadURL 
      };
      
    } catch (error) {
      console.error('Error processing donation result:', error);
      // As a last resort, provide local download
      try {
        createReceiptDownload(donationData);
      } catch (downloadError) {
        console.error('Even local download failed:', downloadError);
      }
      return { success: false, error: error.message };
    }
  };

  const resetForm = () => { setFormData(initialState); setSubmitMessage(''); };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    handleStripeDonationResult, // This function now uses Firebase Storage
    resetForm,
    isSubmitting,
    submitMessage
  };
};

// Keep existing validation (unchanged)
const validateForm = (formType, formData) => {
  switch (formType) {
    case 'Family Registration':
      if (!formData.motherName) return { isValid: false, message: 'Mother\'s name is required.' };
      if (!formData.address) return { isValid: false, message: 'Address is required.' };
      if (!formData.numberOfChildren) return { isValid: false, message: 'Number of children is required.' };
      return { isValid: true };
      
    case 'Volunteer Application':
      if (!formData.volunteerName) return { isValid: false, message: 'Name is required.' };
      if (!formData.volunteerEmail) return { isValid: false, message: 'Email is required.' };
      if (!formData.volunteerPhone) return { isValid: false, message: 'Phone number is required.' };
      if (!formData.bestContactMethod) return { isValid: false, message: 'Please select your preferred contact method.' };
      if (!formData.availableDays || !Array.isArray(formData.availableDays) || formData.availableDays.length === 0) {
        return { isValid: false, message: 'Please select at least one available day.' };
      }
      if (!formData.availableTimes || !Array.isArray(formData.availableTimes) || formData.availableTimes.length === 0) {
        return { isValid: false, message: 'Please select at least one available time.' };
      }
      return { isValid: true };
      
    case 'Contact Form':
      if (!formData.name) return { isValid: false, message: 'Name is required.' };
      if (!formData.email) return { isValid: false, message: 'Email is required.' };
      if (!formData.message) return { isValid: false, message: 'Message is required.' };
      return { isValid: true };
      
    default:
      return { isValid: true };
  }
};

export default useFormData;