
import { LipanaResponse } from '../types';

/**
 * Note: In a real production environment, this call would be proxied through a backend
 * to keep the Secret Key secure. For this demo, we use the provided API structure.
 */
// Use the backend URL from environment variables
const API_BASE_URL = import.meta.env.VITE_PAYMENT_BACKEND_URL || 'http://localhost:3000';

export const initiateMpesaStkPush = async (phone: string, planId: string, uid: string): Promise<LipanaResponse> => {
  // Validate and normalize phone format to 254xxxxxxxxx
  let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, ''); // Remove non-digits
  
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('7') && formattedPhone.length === 9) {
    formattedPhone = '254' + formattedPhone;
  } else if (formattedPhone.startsWith('254')) {
    // Keep as is
  } else {
    // valid for international if needed, but for M-Pesa usually strict
  }
  
  // Ensure we send a clean number, backend expects raw or + format. 
  // Let's send +254 to be consistent with previous logic if backend expects +, 
  // BUT backend logic strips +.
  // Let's send 254... backend handles it fine (doesn't start with 0 or + so it keeps it).
  
  // Wait, backend logic:
  // if startsWith '0' -> replace.
  // else if startsWith '+' -> substring(1).
  // else -> keep as is.
  
  // If I send '2547...', backend keeps '2547...'. Correct.

  try {
    // Call the user's backend to initiate the transaction
    const response = await fetch(`${API_BASE_URL}/api/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        planId,
        uid
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment initiation failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Backend API Error:', error);
    throw error;
  }
};

export const generateMockKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'gal_live_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
