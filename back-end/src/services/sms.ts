import twilio from 'twilio';
import type { Twilio } from 'twilio';

let client: Twilio | null = null;

const getSmsClient = (): Twilio => {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not configured');
    }

    client = twilio(accountSid, authToken);
  }
  return client;
};

/**
 * Send SMS via Twilio
 * @param to - Phone number with country code (e.g. +84912345678)
 * @param body - Message body
 */
export const sendSms = async (to: string, body: string): Promise<{ success: boolean; sid: string }> => {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER is not configured');
  }

  const twilioClient = getSmsClient();
  const message = await twilioClient.messages.create({ body, from: fromNumber, to });

  console.log(`📱 SMS sent to ${to} — SID: ${message.sid}`);
  return { success: true, sid: message.sid };
};

/**
 * Send OTP via SMS
 */
export const sendOtpSms = async (phoneNumber: string, otp: string): Promise<{ success: boolean; sid: string }> => {
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES ?? '15';
  const body = `Your Skipli access code is: ${otp}. This code expires in ${expiryMinutes} minutes. Do not share it with anyone.`;
  return sendSms(phoneNumber, body);
};
