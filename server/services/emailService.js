const nodemailer = require('nodemailer');

const isMailConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter;

if (isMailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'RentalHouse'} <${process.env.SMTP_FROM || 'noreply@rentalhouse.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  if (isMailConfigured) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Error sending email to ${options.email}:`, error);
    }
  } else {
    // Log to console fallback
    console.log('--- EMAIL NOTIFICATION LOG ---');
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Body:\n${mailOptions.html.replace(/<[^>]*>/g, ' ').substring(0, 300)}...`);
    console.log('------------------------------');
  }
};

/**
 * Send a welcome/registration email
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to RentalHouse!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0d6efd; text-align: center;">Welcome to RentalHouse!</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for registering on RentalHouse. Your account as a <strong>${user.role}</strong> has been successfully created.</p>
      <p>You can now search properties, manage bookings, and interact with other users on our platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/login" style="background-color: #0d6efd; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Login to Your Account</a>
      </div>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  return await sendEmail({ email: user.email, subject, html });
};

/**
 * Send booking status email
 */
const sendBookingNotification = async (booking, tenant, property, status) => {
  const subject = `Booking Update - Property: ${property.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0d6efd; text-align: center;">Booking Status Update</h2>
      <p>Hello <strong>${tenant.name}</strong>,</p>
      <p>Your booking request for <strong>${property.title}</strong> has been updated.</p>
      <p>Status: <span style="font-weight: bold; color: ${status === 'approved' ? '#198754' : '#dc3545'}; text-transform: uppercase;">${status}</span></p>
      <p>Monthly Rent: <strong>₹${property.rent}</strong></p>
      <p>Security Deposit: <strong>₹${property.deposit}</strong></p>
      <p>Address: <strong>${property.address}, ${property.city}</strong></p>
      <p>If you have any questions, you can contact the owner directly.</p>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  return await sendEmail({ email: tenant.email, subject, html });
};

/**
 * Send booking inquiry email to Owner
 */
const sendInquiryNotification = async (owner, tenant, property, message) => {
  const subject = `New Booking Request - ${property.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #0d6efd; text-align: center;">New Booking Request!</h2>
      <p>Hello <strong>${owner.name}</strong>,</p>
      <p>A tenant has submitted a booking request for your property: <strong>${property.title}</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee;">
      <h3>Tenant Info:</h3>
      <ul>
        <li><strong>Name:</strong> ${tenant.name}</li>
        <li><strong>Email:</strong> ${tenant.email}</li>
        <li><strong>Phone:</strong> ${tenant.phone}</li>
      </ul>
      <p><strong>Message from Tenant:</strong></p>
      <blockquote style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0d6efd; margin: 10px 0;">"${message || 'I am interested in renting this property.'}"</blockquote>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/dashboard" style="background-color: #198754; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Review Request</a>
      </div>
      <p>Best regards,<br>The RentalHouse Team</p>
    </div>
  `;
  return await sendEmail({ email: owner.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingNotification,
  sendInquiryNotification,
};
