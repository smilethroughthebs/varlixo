/**
 * ==============================================
 * VARLIXO - EMAIL SERVICE
 * ==============================================
 * Complete email system using SMTP (Resend, SendGrid, etc).
 * Handles all email notifications with beautiful HTML templates.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Email types for different scenarios
export enum EmailType {
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FA_CODE = 'two_fa_code',
  DEPOSIT_RECEIVED = 'deposit_received',
  DEPOSIT_CONFIRMED = 'deposit_confirmed',
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  WITHDRAWAL_COMPLETED = 'withdrawal_completed',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',
  INVESTMENT_ACTIVATED = 'investment_activated',
  INVESTMENT_MATURED = 'investment_matured',
  PROFIT_CREDITED = 'profit_credited',
  KYC_SUBMITTED = 'kyc_submitted',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
  SECURITY_ALERT = 'security_alert',
  RECEIPT_GENERATED = 'receipt_generated',
  WELCOME = 'welcome',
  ADMIN_NOTIFICATION = 'admin_notification',
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly adminEmail: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    // Initialize SMTP transporter
    const smtpPort = this.configService.get<number>('email.port') || 587;
    const smtpConfig: any = {
      host: this.configService.get<string>('email.host') || 'smtp.resend.com',
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: this.configService.get<string>('email.user') || 'resend',
        pass: this.configService.get<string>('email.pass'),
      },
    };
    
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.fromEmail = this.configService.get<string>('email.from') || 'noreply@varlixo.com';
    this.adminEmail = this.configService.get<string>('email.adminEmail') || 'admin@varlixo.com';
    this.frontendUrl = this.configService.get<string>('cors.frontendUrl') || 'http://localhost:3000';

    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection() {
    // Skip verification in production to avoid startup delays
    // Emails will still be sent, just won't verify connection upfront
    const skipVerification = this.configService.get<string>('app.nodeEnv') === 'production';
    
    if (skipVerification) {
      this.logger.log('⚠️  SMTP verification skipped in production - will attempt to send emails on demand');
      return;
    }

    try {
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection established successfully');
    } catch (error) {
      this.logger.warn('⚠️  SMTP verification failed - will still attempt to send emails:', error.message);
    }
  }

  // ==========================================
  // AUTHENTICATION EMAILS
  // ==========================================

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verifyUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    const html = this.getEmailTemplate({
      title: 'Verify Your Email Address',
      preheader: 'Complete your Varlixo registration',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Welcome to Varlixo! You're just one step away from accessing the world of intelligent investing.
        </p>
        <p style="margin: 0 0 24px; color: #a0a0a0; font-size: 15px; line-height: 1.6;">
          Please verify your email address by clicking the button below. This link will expire in 24 hours.
        </p>
      `,
      buttonText: 'Verify My Email',
      buttonUrl: verifyUrl,
      footer: `
        <p style="margin: 0; color: #666; font-size: 13px;">
          If you didn't create an account with Varlixo, please ignore this email.
        </p>
      `,
    });

    return this.sendEmail(email, '✉️ Verify Your Email - Varlixo', html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    const html = this.getEmailTemplate({
      title: 'Reset Your Password',
      preheader: 'Password reset request for your Varlixo account',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password.
        </p>
        <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #ffc107; font-size: 14px;">
            ⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email or contact support.
          </p>
        </div>
      `,
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
    });

    return this.sendEmail(email, '🔐 Reset Your Password - Varlixo', html);
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(email: string, name: string): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Password Changed Successfully',
      preheader: 'Your Varlixo password has been updated',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Your password has been successfully changed on <strong>${new Date().toLocaleString()}</strong>.
        </p>
        <div style="background: rgba(220, 53, 69, 0.1); border-left: 4px solid #dc3545; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #dc3545; font-size: 14px;">
            🚨 <strong>Wasn't you?</strong> If you didn't make this change, please secure your account immediately and contact our support team.
          </p>
        </div>
      `,
      buttonText: 'Secure My Account',
      buttonUrl: `${this.frontendUrl}/dashboard/settings`,
    });

    return this.sendEmail(email, '🔒 Password Changed - Varlixo', html);
  }

  /**
   * Send 2FA verification code via email
   */
  async send2FACodeEmail(email: string, name: string, code: string): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Your Security Code',
      preheader: `Your verification code is: ${code}`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Use the following code to complete your login:
        </p>
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid #00d4aa; border-radius: 12px; padding: 30px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #00d4aa; font-family: 'Courier New', monospace;">
            ${code}
          </p>
        </div>
        <p style="margin: 0 0 16px; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
      `,
      footer: `
        <p style="margin: 0; color: #666; font-size: 13px;">
          If you didn't try to log in, someone might be attempting to access your account. Please change your password immediately.
        </p>
      `,
    });

    return this.sendEmail(email, `🔑 Your Security Code: ${code} - Varlixo`, html);
  }

  /**
   * Send OTP code email (for email verification, password reset, etc)
   */
  async sendOtpEmail(email: string, name: string, code: string, type: 'verification' | 'reset' | 'withdrawal' | 'login' = 'verification'): Promise<boolean> {
    const titles = {
      verification: 'Verify Your Email Address',
      reset: 'Reset Your Password',
      withdrawal: 'Confirm Withdrawal Request',
      login: 'Confirm Your Login',
    };

    const descriptions = {
      verification: 'Complete your account verification',
      reset: 'Password reset request for your account',
      withdrawal: 'Confirm your withdrawal request',
      login: 'Complete your secure login',
    };

    const actionTexts = {
      verification: 'Verify your email and activate your account',
      reset: 'Change your password securely',
      withdrawal: 'Approve your withdrawal request',
      login: 'Enter this code to complete your login',
    };

    const html = this.getEmailTemplate({
      title: titles[type],
      preheader: `Your verification code is: ${code}`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          ${actionTexts[type]}
        </p>
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid #00d4aa; border-radius: 12px; padding: 30px; text-align: center; margin: 24px 0;">
          <p style="margin: 0 0 12px; color: #888; font-size: 13px;">CODE</p>
          <p style="margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #00d4aa; font-family: 'Courier New', monospace;">
            ${code}
          </p>
        </div>
        <p style="margin: 0 0 16px; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
        </p>
        ${type === 'reset' ? `
        <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #ffc107; font-size: 13px;">
            ⚠️ If you didn't request a password reset, please ignore this email and secure your account.
          </p>
        </div>
        ` : ''}
      `,
      footer: `
        <p style="margin: 0; color: #666; font-size: 13px;">
          Never share this code with anyone, including Varlixo support staff. We will never ask for this code via email or message.
        </p>
      `,
    });

    const subjects = {
      verification: `📧 Verify Your Email - ${code}`,
      reset: `🔐 Reset Password Code - ${code}`,
      withdrawal: `💳 Withdrawal Confirmation - ${code}`,
      login: `🔑 Login Code - ${code}`,
    };

    return this.sendEmail(email, subjects[type], html);
  }

  // ==========================================
  // DEPOSIT EMAILS
  // ==========================================

  /**
   * Send deposit received notification
   */
  async sendDepositReceivedEmail(
    email: string,
    name: string,
    amount: number,
    currency: string,
    depositRef: string,
    paymentMethod: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Deposit Received',
      preheader: `Your deposit of ${currency} ${amount.toLocaleString()} has been received`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          We have received your deposit request and it's being processed.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888;">Amount</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right;">
                <span style="color: #00d4aa; font-size: 18px; font-weight: 600;">${currency} ${amount.toLocaleString()}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888;">Reference</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right;">
                <span style="color: #fff; font-family: monospace;">${depositRef}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888;">Payment Method</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right;">
                <span style="color: #fff;">${paymentMethod.replace('_', ' ').toUpperCase()}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #888;">Status</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="background: #ffc107; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PROCESSING</span>
              </td>
            </tr>
          </table>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          Processing typically takes 1-24 hours. You'll receive another email once the deposit is confirmed.
        </p>
      `,
      buttonText: 'View Deposit Status',
      buttonUrl: `${this.frontendUrl}/dashboard/wallet`,
    });

    return this.sendEmail(email, '💰 Deposit Received - Varlixo', html);
  }

  /**
   * Send deposit confirmed notification
   */
  async sendDepositConfirmedEmail(
    email: string,
    name: string,
    amount: number,
    currency: string,
    depositRef: string,
    newBalance: number,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Deposit Confirmed! 🎉',
      preheader: `${currency} ${amount.toLocaleString()} has been added to your account`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Great news! Your deposit has been confirmed and the funds are now available in your account.
        </p>
        <div style="background: linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 160, 128, 0.1) 100%); border: 1px solid #00d4aa; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Amount Credited</p>
          <p style="margin: 0 0 16px; color: #00d4aa; font-size: 36px; font-weight: 700;">${currency} ${amount.toLocaleString()}</p>
          <p style="margin: 0; color: #888; font-size: 14px;">New Balance: <strong style="color: #fff;">${currency} ${newBalance.toLocaleString()}</strong></p>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px;">
          Reference: <span style="font-family: monospace; color: #fff;">${depositRef}</span>
        </p>
      `,
      buttonText: 'Start Investing',
      buttonUrl: `${this.frontendUrl}/dashboard/invest`,
    });

    return this.sendEmail(email, '✅ Deposit Confirmed - Varlixo', html);
  }

  // ==========================================
  // WITHDRAWAL EMAILS
  // ==========================================

  /**
   * Send withdrawal request notification
   */
  async sendWithdrawalRequestEmail(
    email: string,
    name: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Withdrawal Request Received',
      preheader: `Your withdrawal request of ${currency} ${amount.toLocaleString()} is being processed`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          We have received your withdrawal request. Our team will process it within 24-48 hours.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Withdrawal Amount</p>
          <p style="margin: 0; color: #fff; font-size: 32px; font-weight: 700;">${currency} ${amount.toLocaleString()}</p>
        </div>
        <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #ffc107; font-size: 14px;">
            ⏳ <strong>Processing Time:</strong> 24-48 hours. You'll receive an email once the withdrawal is completed.
          </p>
        </div>
      `,
      buttonText: 'View Withdrawal Status',
      buttonUrl: `${this.frontendUrl}/dashboard/wallet`,
    });

    return this.sendEmail(email, '📤 Withdrawal Request - Varlixo', html);
  }

  /**
   * Send withdrawal completed notification
   */
  async sendWithdrawalCompletedEmail(
    email: string,
    name: string,
    amount: number,
    currency: string,
    txHash?: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Withdrawal Completed! 💸',
      preheader: `${currency} ${amount.toLocaleString()} has been sent to your account`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Your withdrawal has been successfully processed and the funds are on their way!
        </p>
        <div style="background: linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 160, 128, 0.1) 100%); border: 1px solid #00d4aa; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Amount Sent</p>
          <p style="margin: 0; color: #00d4aa; font-size: 36px; font-weight: 700;">${currency} ${amount.toLocaleString()}</p>
        </div>
        ${txHash ? `
        <p style="margin: 0; color: #a0a0a0; font-size: 14px;">
          Transaction Hash: <span style="font-family: monospace; color: #00d4aa; word-break: break-all;">${txHash}</span>
        </p>
        ` : ''}
        <p style="margin: 16px 0 0; color: #888; font-size: 14px;">
          For bank transfers, please allow 1-3 business days for the funds to appear in your account.
        </p>
      `,
      buttonText: 'View Transaction History',
      buttonUrl: `${this.frontendUrl}/dashboard/transactions`,
    });

    return this.sendEmail(email, '✅ Withdrawal Completed - Varlixo', html);
  }

  /**
   * Send withdrawal rejected notification
   */
  async sendWithdrawalRejectedEmail(
    email: string,
    name: string,
    amount: number,
    currency: string,
    reason: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Withdrawal Request Declined',
      preheader: `Your withdrawal request of ${currency} ${amount.toLocaleString()} was not approved`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Unfortunately, we were unable to process your withdrawal request.
        </p>
        <div style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Amount Requested</p>
          <p style="margin: 0 0 16px; color: #fff; font-size: 24px; font-weight: 600;">${currency} ${amount.toLocaleString()}</p>
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Reason</p>
          <p style="margin: 0; color: #dc3545; font-size: 16px;">${reason}</p>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          The funds have been returned to your account balance. If you believe this was an error, please contact our support team.
        </p>
      `,
      buttonText: 'Contact Support',
      buttonUrl: `${this.frontendUrl}/support`,
    });

    return this.sendEmail(email, '❌ Withdrawal Declined - Varlixo', html);
  }

  // ==========================================
  // KYC EMAILS
  // ==========================================

  /**
   * Send KYC submission confirmation
   */
  async sendKycSubmittedEmail(email: string, name: string): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'KYC Documents Received',
      preheader: 'Your verification documents are under review',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Thank you for submitting your verification documents. Our compliance team is reviewing them.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; background: rgba(255, 193, 7, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">📋</span>
            </div>
            <div>
              <p style="margin: 0 0 4px; color: #ffc107; font-size: 16px; font-weight: 600;">Under Review</p>
              <p style="margin: 0; color: #888; font-size: 14px;">Usually completed within 24-48 hours</p>
            </div>
          </div>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          We'll notify you via email once the verification is complete. You can continue using limited features in the meantime.
        </p>
      `,
      buttonText: 'Check Status',
      buttonUrl: `${this.frontendUrl}/dashboard/kyc`,
    });

    return this.sendEmail(email, '📄 KYC Documents Received - Varlixo', html);
  }

  /**
   * Send KYC approved notification
   */
  async sendKycApprovedEmail(email: string, name: string): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Identity Verified! ✓',
      preheader: 'Congratulations! Your KYC verification is complete',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Great news! Your identity has been successfully verified. You now have full access to all Varlixo features.
        </p>
        <div style="background: linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 160, 128, 0.1) 100%); border: 1px solid #00d4aa; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <div style="width: 64px; height: 64px; background: rgba(0, 212, 170, 0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 32px;">✓</span>
          </div>
          <p style="margin: 0 0 8px; color: #00d4aa; font-size: 20px; font-weight: 600;">Verification Complete</p>
          <p style="margin: 0; color: #888; font-size: 14px;">Full account access unlocked</p>
        </div>
        <p style="margin: 0 0 8px; color: #fff; font-size: 16px; font-weight: 600;">You can now:</p>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #a0a0a0; font-size: 14px; line-height: 2;">
          <li>Make unlimited deposits</li>
          <li>Withdraw funds to any method</li>
          <li>Access premium investment plans</li>
          <li>Enjoy higher transaction limits</li>
        </ul>
      `,
      buttonText: 'Start Investing Now',
      buttonUrl: `${this.frontendUrl}/dashboard/invest`,
    });

    return this.sendEmail(email, '✅ KYC Verified - Varlixo', html);
  }

  /**
   * Send KYC rejected notification
   */
  async sendKycRejectedEmail(email: string, name: string, reason: string): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Verification Unsuccessful',
      preheader: 'Additional information required for your KYC verification',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          We were unable to verify your identity based on the documents provided.
        </p>
        <div style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Reason</p>
          <p style="margin: 0; color: #dc3545; font-size: 16px;">${reason}</p>
        </div>
        <p style="margin: 0 0 16px; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          Please review the reason above and resubmit your documents. Make sure:
        </p>
        <ul style="margin: 0 0 16px; padding: 0 0 0 20px; color: #a0a0a0; font-size: 14px; line-height: 2;">
          <li>Documents are clear and readable</li>
          <li>All corners of the document are visible</li>
          <li>Documents are not expired</li>
          <li>Information matches your profile</li>
        </ul>
      `,
      buttonText: 'Resubmit Documents',
      buttonUrl: `${this.frontendUrl}/dashboard/kyc`,
    });

    return this.sendEmail(email, '⚠️ KYC Verification Update - Varlixo', html);
  }

  /**
   * Send receipt generated email
   */
  async sendReceiptEmail(
    email: string,
    name: string,
    receiptNumber: string,
    transaction: any,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Transaction Receipt Generated! 🧾',
      preheader: `Your receipt ${receiptNumber} is ready`,
      name: name,
      content: `
        <h2 style="color: #333; margin-bottom: 20px;">Transaction Receipt Generated</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">
          Dear ${name},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">
          Your transaction receipt has been generated successfully. Here are the details:
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Receipt Details</h3>
          <p style="margin: 5px 0;"><strong>Receipt Number:</strong> ${receiptNumber}</p>
          <p style="margin: 5px 0;"><strong>Transaction Type:</strong> ${transaction.type}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> $${transaction.amount.toFixed(2)} ${transaction.currency}</p>
          <p style="margin: 5px 0;"><strong>Fee:</strong> $${transaction.fee.toFixed(2)} ${transaction.currency}</p>
          <p style="margin: 5px 0;"><strong>Net Amount:</strong> $${transaction.netAmount.toFixed(2)} ${transaction.currency}</p>
          <p style="margin: 5px 0;"><strong>Transaction Reference:</strong> ${transaction.transactionRef}</p>
          ${transaction.txHash ? `<p style="margin: 5px 0;"><strong>Transaction Hash:</strong> ${transaction.txHash}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #666; margin-bottom: 20px;">
          You can download your receipt from your dashboard at any time.
        </p>
      `,
      buttonText: 'View Receipts',
      buttonUrl: `${this.frontendUrl}/dashboard/receipts`,
    });

    return this.sendEmail(email, `🧾 Receipt Generated - ${receiptNumber}`, html);
  }

  // ==========================================
  // INVESTMENT EMAILS
  // ==========================================

  /**
   * Send investment activated email
   */
  async sendInvestmentActivatedEmail(
    email: string,
    name: string,
    planName: string,
    amount: number,
    currency: string,
    dailyReturn: number,
    maturityDate: Date,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Investment Activated! 🚀',
      preheader: `Your ${planName} investment is now active`,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Congratulations! Your investment has been activated and is now generating returns.
        </p>
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 16px; color: #00d4aa; font-size: 20px; font-weight: 600; text-align: center;">${planName}</p>
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888;">Investment Amount</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right;">
                <span style="color: #00d4aa; font-size: 18px; font-weight: 600;">${currency} ${amount.toLocaleString()}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e;">
                <span style="color: #888;">Daily Return</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right;">
                <span style="color: #fff;">${dailyReturn}%</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #888;">Maturity Date</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: #fff;">${maturityDate.toLocaleDateString()}</span>
              </td>
            </tr>
          </table>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          Daily profits will be automatically credited to your account. Track your investment progress from the dashboard.
        </p>
      `,
      buttonText: 'View My Investment',
      buttonUrl: `${this.frontendUrl}/dashboard`,
    });

    return this.sendEmail(email, '🎉 Investment Activated - Varlixo', html);
  }

  async sendRecurringPaymentDueEmail(
    email: string,
    name: string,
    planType: string,
    monthlyContribution: number,
    nextPaymentDate: Date,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Upcoming Payment Due',
      preheader: 'Your recurring plan payment is due soon',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Your next recurring plan payment is due soon.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Plan</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${planType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #00d4aa; font-weight: 600;">$${monthlyContribution.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Due Date</td>
              <td style="padding: 12px 0; text-align: right; color: #fff;">${nextPaymentDate.toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'View My Plans',
      buttonUrl: `${this.frontendUrl}/dashboard/investments`,
    });

    return this.sendEmail(email, '⏰ Recurring Plan Payment Due - Varlixo', html);
  }

  async sendRecurringMissedPaymentEmail(
    email: string,
    name: string,
    planType: string,
    monthlyContribution: number,
    nextPaymentDate: Date,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Payment Missed',
      preheader: 'Your recurring plan payment was missed',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Your recurring plan payment was missed.
        </p>
        <div style="background: rgba(220, 53, 69, 0.1); border-left: 4px solid #dc3545; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #dc3545; font-size: 14px;">
            Please make your payment as soon as possible to keep your plan on track.
          </p>
        </div>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Plan</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${planType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #ffc107; font-weight: 600;">$${monthlyContribution.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Was Due</td>
              <td style="padding: 12px 0; text-align: right; color: #fff;">${nextPaymentDate.toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'Pay Now',
      buttonUrl: `${this.frontendUrl}/dashboard/investments`,
    });

    return this.sendEmail(email, '⚠️ Missed Recurring Plan Payment - Varlixo', html);
  }

  async sendRecurringPlanMaturedEmail(
    email: string,
    name: string,
    planType: string,
    totalContributed: number,
    maturityDate: Date,
  ): Promise<boolean> {
    const html = this.getEmailTemplate({
      title: 'Plan Reached Maturity',
      preheader: 'Your recurring plan has reached maturity',
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          Your recurring plan has reached maturity.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Plan</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${planType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Total Contributed</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #00d4aa; font-weight: 600;">$${totalContributed.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Maturity Date</td>
              <td style="padding: 12px 0; text-align: right; color: #fff;">${maturityDate.toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.6;">
          You can request a withdrawal from your dashboard. Withdrawals require admin approval.
        </p>
      `,
      buttonText: 'Request Withdrawal',
      buttonUrl: `${this.frontendUrl}/dashboard/investments`,
    });

    return this.sendEmail(email, '✅ Recurring Plan Matured - Varlixo', html);
  }

  async notifyAdminRecurringWithdrawalRequest(
    userEmail: string,
    userName: string,
    planType: string,
    amountUsd: number,
    planId: string,
  ): Promise<boolean> {
    const html = this.getAdminEmailTemplate({
      title: '📤 Recurring Plan Withdrawal Request',
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px;">
          A user has requested a withdrawal for a recurring plan.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">User</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Plan</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${planType}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Amount (USD)</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #ffc107; font-weight: 600;">$${amountUsd.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Plan ID</td>
              <td style="padding: 12px 0; text-align: right; color: #fff; font-family: monospace;">${planId}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'Review Recurring Plans',
      buttonUrl: `${this.frontendUrl}/admin/dashboard/investments`,
    });

    return this.sendEmail(this.adminEmail, `📤 Recurring Withdrawal Request - ${userName}`, html);
  }

  // ==========================================
  // ADMIN NOTIFICATION EMAILS
  // ==========================================

  /**
   * Send admin notification for new deposit
   */
  async notifyAdminNewDeposit(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    depositRef: string,
  ): Promise<boolean> {
    const html = this.getAdminEmailTemplate({
      title: '💰 New Deposit Request',
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px;">
          A new deposit request has been submitted and requires attention.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">User</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #00d4aa; font-weight: 600;">${currency} ${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Method</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Reference</td>
              <td style="padding: 12px 0; text-align: right; color: #fff; font-family: monospace;">${depositRef}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'Review Deposit',
      buttonUrl: `${this.frontendUrl}/admin/deposits`,
    });

    return this.sendEmail(this.adminEmail, `💰 New Deposit: ${currency} ${amount.toLocaleString()} - ${userName}`, html);
  }

  /**
   * Send admin notification for new withdrawal
   */
  async notifyAdminNewWithdrawal(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    withdrawalRef: string,
  ): Promise<boolean> {
    const html = this.getAdminEmailTemplate({
      title: '📤 New Withdrawal Request',
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px;">
          A new withdrawal request requires your approval.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">User</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Amount</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #ffc107; font-weight: 600;">${currency} ${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">Method</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Reference</td>
              <td style="padding: 12px 0; text-align: right; color: #fff; font-family: monospace;">${withdrawalRef}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'Review Withdrawal',
      buttonUrl: `${this.frontendUrl}/admin/withdrawals`,
    });

    return this.sendEmail(this.adminEmail, `📤 Withdrawal Request: ${currency} ${amount.toLocaleString()} - ${userName}`, html);
  }

  /**
   * Send admin notification for new KYC submission
   */
  async notifyAdminNewKyc(
    userEmail: string,
    userName: string,
    documentType: string,
  ): Promise<boolean> {
    const html = this.getAdminEmailTemplate({
      title: '📋 New KYC Submission',
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px;">
          A user has submitted KYC documents for verification.
        </p>
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; color: #888;">User</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3e; text-align: right; color: #fff;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #888;">Document Type</td>
              <td style="padding: 12px 0; text-align: right; color: #fff;">${documentType.replace('_', ' ').toUpperCase()}</td>
            </tr>
          </table>
        </div>
      `,
      buttonText: 'Review KYC',
      buttonUrl: `${this.frontendUrl}/admin/kyc`,
    });

    return this.sendEmail(this.adminEmail, `📋 New KYC Submission - ${userName}`, html);
  }

  async sendAdminCustomUserEmail(
    email: string,
    name: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    const safeSubject = (subject ?? '').trim();
    const safeBody = (body ?? '').trim();

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const htmlBody = escapeHtml(safeBody).replace(/\r\n|\n|\r/g, '<br />');

    const html = this.getEmailTemplate({
      title: safeSubject,
      preheader: safeSubject,
      name,
      content: `
        <p style="margin: 0 0 16px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          ${htmlBody}
        </p>
      `,
    });

    return this.sendEmail(email, safeSubject, html);
  }

  // ==========================================
  // EMAIL TEMPLATES
  // ==========================================

  /**
   * Main email template
   */
  private getEmailTemplate(options: {
    title: string;
    preheader?: string;
    name: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
    footer?: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${options.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  ${options.preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${options.preheader}</div>` : ''}
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #12121a 0%, #0d0d14 100%); border-radius: 16px; overflow: hidden; border: 1px solid #1a1a2e;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #1a1a2e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background: linear-gradient(135deg, #00d4aa 0%, #00a080 100%); padding: 12px 24px; border-radius: 8px;">
                      <span style="color: #fff; font-size: 24px; font-weight: 700; letter-spacing: 2px;">VARLIXO</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 24px; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${options.title}
              </h1>
              <p style="margin: 0 0 24px; color: #888888; font-size: 16px;">
                Hello <span style="color: #00d4aa; font-weight: 500;">${options.name}</span>,
              </p>
              
              <div style="color: #cccccc; font-size: 16px; line-height: 1.6;">
                ${options.content}
              </div>
              
              ${options.buttonText && options.buttonUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${options.buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4aa 0%, #00a080 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(0, 212, 170, 0.3);">
                      ${options.buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${options.footer ? `
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #1a1a2e;">
                ${options.footer}
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0a0a0f; padding: 30px 40px; border-top: 1px solid #1a1a2e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 16px; color: #444; font-size: 14px;">
                      Follow us for updates
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #1a1a2e; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #888;">𝕏</a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #1a1a2e; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #888;">in</a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="#" style="display: inline-block; width: 36px; height: 36px; background: #1a1a2e; border-radius: 50%; text-align: center; line-height: 36px; text-decoration: none; color: #888;">✉</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 8px; color: #555; font-size: 13px;">
                      © ${new Date().getFullYear()} Varlixo. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #444; font-size: 12px;">
                      This is an automated message. Please do not reply directly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="margin: 0; color: #444; font-size: 12px;">
                <a href="${this.frontendUrl}/dashboard/settings" style="color: #666; text-decoration: underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Admin email template
   */
  private getAdminEmailTemplate(options: {
    title: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #12121a; border-radius: 12px; border: 1px solid #1a1a2e;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #12121a 100%); padding: 24px; border-bottom: 1px solid #2a2a3e;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color: #00d4aa; font-size: 18px; font-weight: 700;">VARLIXO</span>
                    <span style="color: #666; font-size: 14px; margin-left: 8px;">Admin Panel</span>
                  </td>
                  <td align="right">
                    <span style="color: #ffc107; font-size: 12px; background: rgba(255, 193, 7, 0.1); padding: 4px 12px; border-radius: 4px;">ACTION REQUIRED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">
                ${options.title}
              </h1>
              ${options.content}
              
              ${options.buttonText && options.buttonUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td>
                    <a href="${options.buttonUrl}" style="display: inline-block; background: #00d4aa; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      ${options.buttonText} →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #1a1a2e;">
              <p style="margin: 0; color: #555; font-size: 12px;">
                Sent from Varlixo Admin System • ${new Date().toLocaleString()}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // ==========================================
  // SEND EMAIL METHOD
  // ==========================================

  /**
   * Send email with error handling
   * Uses Resend HTTP API as primary, falls back to SMTP
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Try Resend HTTP API first (more reliable on Railway)
    const apiKey = this.configService.get<string>('email.pass');
    
    if (apiKey && apiKey.startsWith('re_')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [to],
            subject: subject,
            html: html,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.logger.log(`✅ Email sent successfully to ${to} via Resend API - ID: ${data.id}`);
          return true;
        }

        const error = await response.json();
        this.logger.error(`❌ Resend API error: ${JSON.stringify(error)}`);
      } catch (error) {
        this.logger.error(`❌ Resend API failed: ${error.message}`);
      }
    }

    // Fallback to SMTP
    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      this.logger.log(`✅ Email sent successfully to ${to} via SMTP - MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Email delivery to ${to} failed - Status: ${error.message}`);
      
      if (error.response) {
        this.logger.error(`SMTP Response: ${error.response}`);
      }
      
      return false;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, message: `SMTP connection failed: ${error.message}` };
    }
  }
}
