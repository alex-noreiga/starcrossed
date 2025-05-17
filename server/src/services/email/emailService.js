// Email service for sending verification and password reset emails

// In a production environment, you would use a service like SendGrid, Mailgun, AWS SES, etc.
// For development, we'll implement a simplified version that logs emails to the console

/**
 * Send verification email
 * @param {string} to - Recipient email
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (to, token) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  
  console.log(`
    =============================================
    SENDING VERIFICATION EMAIL
    =============================================
    To: ${to}
    Subject: Verify Your Starcrossed Account
    
    Hello,
    
    Please verify your email address by clicking on the link below:
    
    ${verifyUrl}
    
    The link will expire in 24 hours.
    
    Thank you,
    The Starcrossed Team
    =============================================
  `);
  
  // In production, you would use a real email service:
  // return await sendgrid.send({
  //   to,
  //   from: 'noreply@starcrossed.com',
  //   subject: 'Verify Your Starcrossed Account',
  //   html: `<p>Please verify your email: <a href="${verifyUrl}">Verify Email</a></p>`
  // });
  
  return { success: true };
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} token - Reset token
 */
const sendPasswordResetEmail = async (to, token) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  console.log(`
    =============================================
    SENDING PASSWORD RESET EMAIL
    =============================================
    To: ${to}
    Subject: Reset Your Starcrossed Password
    
    Hello,
    
    You requested a password reset. Please click the link below to set a new password:
    
    ${resetUrl}
    
    The link will expire in 1 hour.
    
    If you didn't request this, please ignore this email.
    
    Thank you,
    The Starcrossed Team
    =============================================
  `);
  
  // In production, you would use a real email service
  
  return { success: true };
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
