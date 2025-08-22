import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs-config';


// EmailJS configuration - try env vars first, fallback to config
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || EMAILJS_CONFIG.SERVICE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY;
const TEMPLATE_IDS = {
  forms: process.env.REACT_APP_EMAILJS_TEMPLATE_FORMS || EMAILJS_CONFIG.TEMPLATE_FORMS,
  donation: process.env.REACT_APP_EMAILJS_TEMPLATE_DONATION || EMAILJS_CONFIG.TEMPLATE_DONATION,
};

console.log('Using EmailJS config:', {
  SERVICE_ID: SERVICE_ID.startsWith('service_') ? 'Set' : 'Missing',
  PUBLIC_KEY: PUBLIC_KEY ? 'Set' : 'Missing',
  source: process.env.REACT_APP_EMAILJS_SERVICE_ID ? 'Environment Variables' : 'Config File'
});

// Email sending functions
const sendFormEmail = async (formType, formData) => {
  console.log('Attempting to send email:', { formType, formData });
  
  try {
    let templateParams = {
      form_type: formType,
      submission_date: new Date().toLocaleDateString(),
      to_email: EMAILJS_CONFIG.ORGANIZATION_EMAIL,
    };

    // Add form-specific data
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
          available_days: Array.isArray(formData.availableDays) 
            ? formData.availableDays.join(', ') 
            : formData.availableDays || 'Not specified',
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

    console.log('Sending email with params:', templateParams);

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.forms,
      templateParams,
      PUBLIC_KEY
    );

    console.log('Email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send ${formType} email:`, error);
    return { success: false, error: error.message };
  }
};

const sendDonationConfirmation = async (donationData) => {
  try {
    const templateParams = {
      donor_name: donationData.donorName,
      amount: donationData.amount,
      donation_date: new Date().toLocaleDateString(),
      transaction_id: donationData.transactionId,
      to_email: donationData.donorEmail,
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.donation,
      templateParams,
      PUBLIC_KEY
    );

    return { success: true, result };
  } catch (error) {
    console.error('Failed to send donation confirmation:', error);
    return { success: false, error: error.message };
  }
};

const useFormData = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (formType) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate required fields
      const isValid = validateForm(formType, formData);
      
      if (!isValid) {
        setSubmitMessage('Please fill in all required fields.');
        setIsSubmitting(false);
        return { success: false, error: 'Validation failed' };
      }

      // Send email
      const emailResult = await sendFormEmail(formType, formData);
      
      if (emailResult.success) {
        setSubmitMessage(`${formType} submitted successfully! We'll be in touch soon.`);
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData(initialState);
          setSubmitMessage('');
        }, 3000);

        return { success: true };
      } else {
        setSubmitMessage(`Error: ${emailResult.error}`);
        return { success: false, error: emailResult.error };
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitMessage(`Error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonationSubmit = async (donationData) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const emailResult = await sendDonationConfirmation(donationData);
      
      if (emailResult.success) {
        setSubmitMessage('Thank you for your donation! A confirmation email has been sent.');
        return { success: true };
      } else {
        setSubmitMessage(`Error: ${emailResult.error}`);
        return { success: false, error: emailResult.error };
      }
    } catch (error) {
      console.error('Donation confirmation error:', error);
      setSubmitMessage(`Error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setSubmitMessage('');
  };

  return { 
    formData, 
    handleInputChange, 
    handleSubmit, 
    handleDonationSubmit,
    resetForm,
    isSubmitting,
    submitMessage
  };
};

// Form validation helper
const validateForm = (formType, formData) => {
  switch (formType) {
    case 'Family Registration':
      return formData.motherName && formData.address && formData.numberOfChildren;
    
    case 'Volunteer Application':
      return formData.volunteerName && formData.volunteerEmail && formData.volunteerPhone;
    
    case 'Contact Form':
      return formData.name && formData.email && formData.message;
    
    default:
      return true;
  }
};

export default useFormData;