const config = require('../config/environment');

/**
 * Fast2SMS Service for sending OTP via SMS
 */
class Fast2SMSService {
  constructor() {
    this.apiKey = config.FAST2SMS_API_KEY;
    this.baseURL = 'https://www.fast2sms.com/dev/bulkV2';
    this.route = config.FAST2SMS_ROUTE || 'q'; // 'q' = Quick route (allows custom messages without template)
  }

  /**
   * Generate a 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to phone number
   * @param {string} phone - Phone number (10 digits, without country code)
   * @param {string} otp - OTP to send
   * @returns {Promise<Object>} Response from Fast2SMS
   */
  async sendOTP(phone, otp) {
    if (!this.apiKey) {
      throw new Error('Fast2SMS API key is not configured');
    }

    // Ensure phone number is 10 digits (Indian format)
    const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    if (cleanPhone.length !== 10) {
      throw new Error('Phone number must be 10 digits');
    }

    try {
      // Import node-fetch dynamically (v3 is ESM)
      const fetch = (await import('node-fetch')).default;

      // Create the OTP message
      const message = `Your exora verification code is ${otp}. Do not share this code with anyone. Valid for 10 minutes.`;

      // Fast2SMS bulkV2 API uses GET request with query parameters
      // For route 'q' (quick): send full message directly
      // For route 'otp': requires template ID (not used here)
      const url = new URL(this.baseURL);
      url.searchParams.append('authorization', this.apiKey);
      url.searchParams.append('route', this.route);
      url.searchParams.append('message', message); // Full message for route 'q'
      url.searchParams.append('numbers', cleanPhone);
      url.searchParams.append('flash', '0'); // 0 for normal SMS, 1 for flash SMS

      const response = await fetch(url.toString(), {
        method: 'GET'
      });

      const data = await response.json();

      // Fast2SMS returns { return: true } on success
      if (data.return === true || data.return === 'true' || (response.ok && data.return !== false)) {
        return {
          success: true,
          requestId: data.request_id || data.requestId,
          message: 'OTP sent successfully'
        };
      } else {
        // Handle error response - log full response for debugging
        console.error('Fast2SMS API Response:', JSON.stringify(data, null, 2));
        const errorMsg = data.message || data.msg || data.error || 'Failed to send OTP';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Fast2SMS Error:', error);
      // If it's already an Error with message, rethrow it
      if (error.message) {
        throw error;
      }
      throw new Error(`Failed to send OTP: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify OTP (this is handled by our backend, Fast2SMS doesn't verify)
   * This method is kept for consistency but verification happens in the controller
   */
  async verifyOTP(phone, otp) {
    // OTP verification is handled by the backend controller
    // This method is here for future use if needed
    return { success: true };
  }
}

module.exports = new Fast2SMSService();

