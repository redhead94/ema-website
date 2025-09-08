// src/utils/firebaseReceipts.js
// Firebase Storage receipt hosting and EmailJS integration

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { generateTaxReceiptPDF } from './professionalReceipts';
import emailjs from '@emailjs/browser';

// Initialize Firebase Storage
const storage = getStorage();

// Organization info - update with your actual details
const ORGANIZATION_INFO = {
  name: 'Essential Mom Assistance',
  email: 'info@essentialmom.net',
  phone: '(845) 671-0355',
  ein: '39-3893195' // Replace with your actual EIN
};

// EmailJS configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_i8vfuac',
  TEMPLATE_DONATION: 'template_2v672mt',
  TEMPLATE_FORMS: 'template_p8tpsfl',
  PUBLIC_KEY: 'tpXSz1-_leAFrCNv7'
};

// Upload PDF receipt to Firebase Storage and get download URL
export const uploadReceiptToFirebase = async (donationData) => {
  try {
    console.log('Generating PDF receipt...');
    
    // Generate the PDF
    const pdf = generateTaxReceiptPDF(donationData);
    const pdfArrayBuffer = pdf.output('arraybuffer');
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    
    // Create a unique filename
    const fileName = `receipts/EMA-Receipt-${donationData.transactionId}.pdf`;
    
    // Create storage reference
    const storageRef = ref(storage, fileName);
    
    // Upload the PDF with metadata
    console.log('Uploading receipt to Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, pdfBlob, {
      contentType: 'application/pdf',
      customMetadata: {
        donorName: donationData.donorName,
        donorEmail: donationData.donorEmail || '',
        amount: donationData.amountDisplay,
        transactionId: donationData.transactionId,
        uploadDate: new Date().toISOString()
      }
    });
    
    // Get the permanent download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Receipt uploaded successfully. Download URL:', downloadURL);
    
    return {
      success: true,
      downloadURL,
      fileName,
      filePath: snapshot.ref.fullPath
    };
    
  } catch (error) {
    console.error('Error uploading receipt to Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send donation confirmation email with Firebase-hosted receipt
export const sendDonationEmailWithFirebaseReceipt = async (donationData, receiptDownloadURL) => {
  try {
    console.log('Sending donation confirmation email...');
    
    // Send confirmation email to donor
    const donorEmailResult = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_DONATION,
      {
        donor_name: donationData.donorName,
        amount: donationData.amountDisplay,
        transaction_id: donationData.transactionId,
        donation_date: new Date(donationData.donationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        receipt_download_url: receiptDownloadURL,
        to_email: donationData.donorEmail,
        organization_name: ORGANIZATION_INFO.name,
        organization_email: ORGANIZATION_INFO.email,
        organization_phone: ORGANIZATION_INFO.phone,
        ein_number: ORGANIZATION_INFO.ein
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log('Donor email sent successfully');
    
    // Send admin notification
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_FORMS,
      {
        form_type: 'New Donation Received',
        to_email: ORGANIZATION_INFO.email,
        name: donationData.donorName,
        donor_name: donationData.donorName,
        donor_email: donationData.donorEmail || 'No email provided',
        amount: donationData.amountDisplay,
        transaction_id: donationData.transactionId,
        receipt_url: receiptDownloadURL,
        submission_date: new Date().toLocaleDateString(),
        message: donationData.donorMessage || 'No message provided',
        additional_info: `Payment Method: ${donationData.paymentMethod || 'Credit Card'}\nStripe Receipt: ${donationData.receiptUrl || 'N/A'}`
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    
    console.log('Admin notification sent successfully');
    
    return {
      success: true,
      donorEmailSent: true,
      adminEmailSent: true
    };
    
  } catch (error) {
    console.error('Error sending donation emails:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Main function: Upload receipt and send emails
export const handleDonationWithFirebaseReceipt = async (donationData) => {
  try {
    console.log('Processing donation with Firebase receipt hosting...');
    
    // Step 1: Upload receipt to Firebase Storage
    const uploadResult = await uploadReceiptToFirebase(donationData);
    
    if (!uploadResult.success) {
      throw new Error(`Receipt upload failed: ${uploadResult.error}`);
    }
    
    // Step 2: Send emails with permanent download link
    const emailResult = await sendDonationEmailWithFirebaseReceipt(
      donationData, 
      uploadResult.downloadURL
    );
    
    if (!emailResult.success) {
      console.warn('Email sending failed:', emailResult.error);
      // Don't fail the whole process if email fails - receipt is still uploaded
    }
    
    return {
      success: true,
      downloadURL: uploadResult.downloadURL,
      fileName: uploadResult.fileName,
      emailSent: emailResult.success,
      donorEmailSent: emailResult.donorEmailSent,
      adminEmailSent: emailResult.adminEmailSent
    };
    
  } catch (error) {
    console.error('Error processing donation with Firebase receipt:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Utility function to retrieve receipt URL later (for admin dashboard, etc.)
export const getReceiptDownloadURL = async (transactionId) => {
  try {
    const receiptRef = ref(storage, `receipts/EMA-Receipt-${transactionId}.pdf`);
    const downloadURL = await getDownloadURL(receiptRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting receipt download URL:', error);
    return null;
  }
};

// Fallback function for local PDF download (if Firebase fails)
export const createReceiptDownload = (donationData) => {
  try {
    console.log('Creating local PDF download as fallback...');
    const pdf = generateTaxReceiptPDF(donationData);
    const blob = pdf.output('blob');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EMA-Tax-Receipt-${donationData.transactionId}.pdf`;
    
    // Auto-download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log('Local PDF download initiated');
    return url;
  } catch (error) {
    console.error('Error creating local PDF download:', error);
    return null;
  }
};

// Delete receipt from Firebase Storage (for admin cleanup)
export const deleteReceiptFromFirebase = async (transactionId) => {
  try {
    const receiptRef = ref(storage, `receipts/EMA-Receipt-${transactionId}.pdf`);
    await deleteObject(receiptRef);
    console.log('Receipt deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return { success: false, error: error.message };
  }
};