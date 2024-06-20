import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: `${process.env.USER_ETHEREAL_EMAIL}`,
        pass: `${process.env.PASS_ETHEREAL_EMAIL}`,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const mailOptions = {
      from: '"Auth-backend Service" <no-reply@yourapp.com>',
      to: to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hello ${to},</h2>
          <p>We received a request to reset your password. Click the link below to reset your password:</p>
          <p style="text-align: center;">
            <a 
              href="${resetLink}" 
              style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>If you did not request a password reset, please ignore this email or contact our support if you have any questions.</p>
          <p>Best regards,<br>YourApp Support Team</p>
          <hr>
          <p style="font-size: 12px; color: #888;">
            If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
            <br>
            <a href="${resetLink}" style="color: #007BFF;">${resetLink}</a>
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
