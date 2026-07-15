class OTPService {
  constructor() {
    this.otps = new Map(); // email -> { code, expiresAt }
    this.expiryDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generates a 6-digit verification code, stores it with expiration, and logs it.
   * @param {string} email 
   * @returns {string} 6-digit OTP code
   */
  generateOTP(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + this.expiryDuration;
    
    this.otps.set(email.toLowerCase(), { code, expiresAt });
    





    
    return code;
  }

  /**
   * Verifies the OTP code for a given email.
   * If correct and not expired, deletes it and returns true.
   * @param {string} email 
   * @param {string} code 
   * @returns {boolean}
   */
  verifyOTP(email, code) {
    const record = this.otps.get(email.toLowerCase());
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      this.otps.delete(email.toLowerCase());
      return false;
    }

    if (record.code === code.trim()) {
      this.otps.delete(email.toLowerCase());
      return true;
    }

    return false;
  }
}

module.exports = new OTPService();
