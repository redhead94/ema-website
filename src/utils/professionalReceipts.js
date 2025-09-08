// Free Professional Receipt System
// Keep EmailJS for notifications + Generate PDF receipts with download links

import jsPDF from 'jspdf';
import emailjs from '@emailjs/browser';

// Organization info - update with your details
const ORGANIZATION_INFO = {
  name: 'Essential Mom Assistance',
  address: 'Silver Spring, MD',
  phone: '(301) 555-0123',
  email: 'info@essentialmom.net',
  website: 'https://essentialmom.net',
  ein: 'XX-XXXXXXX', // Your actual EIN
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
    ['Receipt Number:', donationData.transactionId],
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

// Enhanced EmailJS function with receipt information
export const sendDonationEmailsWithReceipt = async (donationData) => {
  try {
    // Generate PDF receipt
    const pdf = generateTaxReceiptPDF(donationData);
    const pdfDataUri = pdf.output('datauristring');
    
    // Create a professional email template with download instructions
    const donorEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${ORGANIZATION_INFO.name}</h1>
          <p style="color: #e0e7ff; margin: 5px 0;">Tax Receipt for Your Donation</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px;">Dear ${donationData.donorName},</p>
          
          <p>Thank you for your generous donation of <strong style="color: #059669;">$${(donationData.amountCents / 100).toFixed(2)}</strong> to ${ORGANIZATION_INFO.name}.</p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">Your Tax Receipt Information</h3>
            <p style="margin: 5px 0;"><strong>Receipt Number:</strong> ${donationData.transactionId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${(donationData.amountCents / 100).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>EIN:</strong> ${ORGANIZATION_INFO.ein}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">📄 Your Official Tax Receipt</h4>
            <p style="margin: 0; color: #92400e;">Click the button below to download your official PDF tax receipt:</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${pdfDataUri}" download="EMA-Tax-Receipt-${donationData.transactionId}.pdf" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📥 Download Tax Receipt PDF
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            <strong>Instructions:</strong> Click the download button above to save your official tax receipt. 
            This PDF contains all the information required by the IRS for tax deduction purposes.
          </p>
          
          <p>Your contribution helps us provide:</p>
          <ul style="color: #374151;">
            <li>Meal delivery for new families</li>
            <li>Volunteer babysitting services</li>
            <li>Emotional support and guidance</li>
            <li>Community connection and resources</li>
          </ul>
          
          <p>If you have any questions about your donation or need assistance downloading your receipt, please contact us at ${ORGANIZATION_INFO.email}.</p>
          
          <p style="margin-top: 30px;">With heartfelt gratitude,<br>
          <strong>The EMA Team</strong></p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            ${ORGANIZATION_INFO.name}<br>
            ${ORGANIZATION_INFO.address} | ${ORGANIZATION_INFO.phone}<br>
            <a href="mailto:${ORGANIZATION_INFO.email}" style="color: #3b82f6;">${ORGANIZATION_INFO.email}</a>
          </p>
        </div>
      </div>
    `;

    // Send to donor using EmailJS
    const donorEmailResult = await emailjs.send(
      'service_i8vfuac', // Your EmailJS service ID
      'template_2v672mt', // Your EmailJS template ID
      {
        to_email: donationData.donorEmail,
        donor_name: donationData.donorName,
        amount: `$${(donationData.amountCents / 100).toFixed(2)}`,
        transaction_id: donationData.transactionId,
        receipt_number: donationData.transactionId,
        donation_date: new Date().toLocaleDateString(),
        message_html: donorEmailContent,
        organization_name: ORGANIZATION_INFO.name,
        ein_number: ORGANIZATION_INFO.ein,
      },
      'tpXSz1-_leAFrCNv7' // Your EmailJS public key
    );

    // Send admin notification
    const adminEmailResult = await emailjs.send(
      'service_i8vfuac',
      'template_p8tpsfl', // Your forms template
      {
        form_type: 'Donation Received',
        to_email: ORGANIZATION_INFO.email,
        name: donationData.donorName,
        donor_name: donationData.donorName,
        amount: `$${(donationData.amountCents / 100).toFixed(2)}`,
        transaction_id: donationData.transactionId,
        submission_date: new Date().toLocaleDateString(),
        message: donationData.donorMessage || 'No message provided',
      },
      'tpXSz1-_leAFrCNv7'
    );

    return { 
      success: true, 
      donorEmailSent: true, 
      adminEmailSent: true,
      receiptGenerated: true 
    };

  } catch (error) {
    console.error('Error sending donation emails:', error);
    return { success: false, error: error.message };
  }
};

// Alternative: Store PDF in browser and provide direct download
export const createReceiptDownload = (donationData) => {
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
  
  return url;
};