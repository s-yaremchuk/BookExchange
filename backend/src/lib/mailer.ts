import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface SendMailOptions {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

const transportOptions: nodemailer.TransportOptions = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
} as nodemailer.TransportOptions;

export const transporter = nodemailer.createTransport(transportOptions);

export async function sendMail(options: SendMailOptions): Promise<void> {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
