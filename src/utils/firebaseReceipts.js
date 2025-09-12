// src/utils/firebaseReceipts.js
// Firebase Storage receipt hosting and EmailJS integration

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import emailjs from '@emailjs/browser';
import jsPDF from 'jspdf';

// Initialize Firebase Storage
const storage = getStorage();

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

// Organization info - update with your details
const ORGANIZATION_INFO = {
  name: 'Essential Mom Assistance',
  address: 'Silver Spring MD, 20902',
  phone: '(301) 923-4815',
  email: 'info@essentialmom.net',
  website: 'https://essentialmom.net',
  ein: '39-3893195', // Your actual EIN
  taxExemptStatus: '501(c)(3)',
};

// Generate professional PDF receipt
export const generateTaxReceiptPDF = (donationData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  
  // Header with organization branding
  pdf.setFillColor(59, 130, 246); // Blue header
  pdf.rect(0, 0, pageWidth, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(ORGANIZATION_INFO.name, 20, 20);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text('TAX-DEDUCTIBLE DONATION RECEIPT', 20, 45);
  
  // Organization details
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(ORGANIZATION_INFO.address, 20, 55);
  pdf.text(`${ORGANIZATION_INFO.phone} | ${ORGANIZATION_INFO.email}`, 20, 62);
  pdf.text(ORGANIZATION_INFO.website, 20, 69);
  
  // Receipt details in a box
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.5);
  pdf.rect(20, 80, pageWidth - 40, 70); // Made box taller
  
  // Receipt header
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, 80, pageWidth - 40, 15, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('DONATION DETAILS', 25, 90);
  
  // Receipt content with better spacing
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(11);
  
  const details = [
    ['Date of Donation:', new Date(donationData.donationDate || Date.now()).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })],
    ['Donor Name:', donationData.donorName],
    ['Donation Amount:', `$${(donationData.amountCents / 100).toFixed(2)}`],
    ['Payment Method:', donationData.paymentMethod || 'Credit Card'],
  ];
  
  details.forEach(([label, value], index) => {
    const y = 105 + (index * 8);
    pdf.setFont(undefined, 'bold');
    pdf.text(label, 25, y);
    pdf.setFont(undefined, 'normal');
    pdf.text(value, 90, y);
  });
  
  // Tax deductible information - FIXED POSITIONING
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('TAX DEDUCTION INFORMATION', 20, 170); // Moved down from 180
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  
  const taxInfo = [
    `This organization is recognized as tax-exempt under Section ${ORGANIZATION_INFO.taxExemptStatus}`,
    'of the Internal Revenue Code.',
    `Federal Tax ID (EIN): ${ORGANIZATION_INFO.ein}`,
    '',
    'No goods or services were provided in exchange for this donation.',
    'The entire amount is tax-deductible to the fullest extent allowed by law.',
    'Please retain this receipt for your tax records.',
  ];
  
  let currentY = 180; // Start position for tax info
  taxInfo.forEach((info) => {
    if (info) {
      pdf.text(info, 20, currentY);
      currentY += 7; // Consistent spacing
    } else {
      currentY += 3; // Smaller space for blank lines
    }
  });
  
  // Thank you message - positioned after tax info
  const thankYouY = currentY + 10;
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, thankYouY, pageWidth - 40, 25, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'italic');
  pdf.text('Thank you for your generous support of Essential Mom Assistance.', 25, thankYouY + 10);
  pdf.text('Your donation helps us provide crucial support to new families.', 25, thankYouY + 18);
  
  // Footer - positioned at bottom
  const footerY = thankYouY + 35;
  pdf.setFontSize(8);
  pdf.setTextColor(128);
  pdf.text('This receipt was generated electronically and is valid without a signature.', 20, footerY);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, footerY + 7);
  
  return pdf;
};