import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

export const isRazorpayConfigured = () => {
  return (
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET) &&
    process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder'
  );
};

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
};
