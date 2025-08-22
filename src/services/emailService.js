import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

// Only 2 templates with free plan
const TEMPLATE_IDS = {
  formSubmissions: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_FORMS,
  donationConfirmation: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_DONATION,
};

export const sendRegistrationEmail = async (formData) => {
  try {
    const templateParams = {
      form_type: 'Family Registration',
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
      submission_date: new Date().toLocaleDateString(),
      to_email: 'info@essentialmom.net',
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.formSubmissions,
      templateParams,
      PUBLIC_KEY
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send registration email:', error);
    return { success: false, error };
  }
};

export const sendVolunteerEmail = async (formData) => {
  try {
    const templateParams = {
      form_type: 'Volunteer Application',
      name: formData.volunteerName,
      volunteer_name: formData.volunteerName,
      volunteer_email: formData.volunteerEmail,
      volunteer_phone: formData.volunteerPhone,
      available_days: Array.isArray(formData.availableDays) 
        ? formData.availableDays.join(', ') 
        : formData.availableDays,
      submission_date: new Date().toLocaleDateString(),
      to_email: 'info@essentialmom.net',
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.formSubmissions,
      templateParams,
      PUBLIC_KEY
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send volunteer email:', error);
    return { success: false, error };
  }
};

export const sendContactEmail = async (formData) => {
  try {
    const templateParams = {
      form_type: 'Contact Form',
      name: formData.name,
      contact_name: formData.name,
      contact_email: formData.email,
      message: formData.message,
      submission_date: new Date().toLocaleDateString(),
      to_email: 'info@essentialmom.net',
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.formSubmissions,
      templateParams,
      PUBLIC_KEY
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return { success: false, error };
  }
};

export const sendDonationConfirmation = async (donationData) => {
  try {
    const templateParams = {
      donor_name: donationData.donorName,
      amount: donationData.amount,
      donation_date: new Date().toLocaleDateString(),
      transaction_id: donationData.transactionId,
      to_email: donationData.donorEmail, // Send to donor
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_IDS.donationConfirmation,
      templateParams,
      PUBLIC_KEY
    );
    
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send donation confirmation:', error);
    return { success: false, error };
  }
};