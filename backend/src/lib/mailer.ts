import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../config/env';

export interface SendMailOptions {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

const transportOptions: SMTPTransport.Options = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: env.SMTP_USER
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      }
    : undefined,
};

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
