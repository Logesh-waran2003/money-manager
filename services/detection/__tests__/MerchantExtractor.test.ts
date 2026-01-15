import { extractMerchant } from '../MerchantExtractor';

describe('MerchantExtractor', () => {
  describe('HDFC Bank patterns', () => {
    it('extracts merchant from UPI sent pattern', () => {
      expect(extractMerchant('Sent Rs.13150.00 From HDFC Bank A/C *0931 To SELVA DHANARASI CHIT FUND On 13/01/26', 'JX-HDFCBK-S')).toBe('SELVA DHANARASI CHIT FUND');
    });

    it('extracts merchant from UPI credit pattern', () => {
      expect(extractMerchant('Rs.500 credited from VPA rajesh@paytm', 'JX-HDFCBK')).toBe('rajesh');
    });

    it('handles HDFC sender ID', () => {
      expect(extractMerchant('Sent Rs.100 To MERCHANT NAME On 15/01/26', 'JX-HDFCBK-S')).toBe('MERCHANT NAME');
    });

    it('extracts from body with HDFC Bank keyword', () => {
      expect(extractMerchant('Sent Rs.100 From HDFC Bank To TEST MERCHANT On 15/01/26', 'OTHER')).toBe('TEST MERCHANT');
    });

    it('falls back to sender when HDFC patterns do not match', () => {
      expect(extractMerchant('Some HDFC Bank message without merchant', 'JX-HDFCBK')).toBe('HDFCBK');
    });
  });

  describe('Axis Bank patterns', () => {
    it('extracts merchant from Axis card transaction', () => {
      expect(extractMerchant('Spent INR 80 Axis Bank Card no. XX9498 13-01-26 22:46:26 IST SANTHI Avl Limit: INR 59155.39', 'AD-AXISBK-S')).toBe('SANTHI');
    });

    it('extracts merchant with multiple words', () => {
      expect(extractMerchant('Spent INR 1200 13-01-26 IST HOTEL KUMAR Avl Limit: INR 50000', 'AD-AXISBK')).toBe('HOTEL KUMAR');
    });

    it('handles Axis sender ID', () => {
      expect(extractMerchant('Spent Rs.500 IST MERCHANT NAME Avl Limit', 'AD-AXISBK-S')).toBe('MERCHANT NAME');
    });

    it('falls back to sender when no pattern matches', () => {
      const body = 'Spent INR 80 IST SANTHI Not you? SMS BLOCK';
      expect(extractMerchant(body, 'AD-AXISBK')).toBe('AXISBK');
    });
  });

  describe('SBI Bank patterns', () => {
    it('extracts merchant from SBI transaction', () => {
      expect(extractMerchant('Rs 299 debited from A/C XX5678 at REDBUS on 14-Jan-26 -SBI', 'VM-SBIINB')).toBe('REDBUS');
    });

    it('falls back to sender when pattern does not match', () => {
      expect(extractMerchant('Rs 100 debited from SBI A/C on 15-Jan', 'VM-SBIINB')).toBe('SBIINB');
    });

    it('extracts from body with SBI keyword', () => {
      expect(extractMerchant('Rs 100 debited from SBI A/C at TEST MERCHANT on 15-Jan', 'OTHER')).toBe('TEST MERCHANT');
    });
  });

  describe('Special merchants', () => {
    it('detects Amazon Pay', () => {
      expect(extractMerchant('Spent Rs.500 at AMAZON PAY', 'AD-AXISBK')).toBe('Amazon Pay');
    });

    it('detects RedBus', () => {
      expect(extractMerchant('Rs 299 at redbus', 'VM-SBIINB')).toBe('RedBus');
    });

    it('detects The Deconstruct', () => {
      expect(extractMerchant('Spent Rs.8500 at The Deconstruct', 'AD-AXISBK')).toBe('The Deconstruct');
    });

    it('detects GoKwik', () => {
      expect(extractMerchant('Spent Rs.6500 at GoKwik merchant', 'AD-AXISBK')).toBe('GoKwik');
    });
  });

  describe('Generic UPI patterns', () => {
    it('extracts from "paid to" pattern', () => {
      expect(extractMerchant('Rs.750 paid to UBER via UPI', 'OTHER')).toBe('UBER');
    });

    it('extracts from "sent to" pattern', () => {
      expect(extractMerchant('Rs.3000 sent to RAJESH KUMAR via UPI', 'OTHER')).toBe('RAJESH KUMAR');
    });
  });

  describe('Fallback sender cleaning', () => {
    it('cleans promotional sender', () => {
      expect(extractMerchant('Some message', 'AD-PROMO-P')).toBe('Promotional');
    });

    it('removes bank prefix from sender', () => {
      expect(extractMerchant('Some message', 'VM-MERCHANT')).toBe('MERCHANT');
    });

    it('removes prefix and suffix correctly', () => {
      expect(extractMerchant('Some message', 'AD-MERCHANT-S')).toBe('MERCHANT');
    });
  });

  describe('Edge cases', () => {
    it('handles newline characters', () => {
      expect(extractMerchant('Sent Rs.100\\nTo MERCHANT NAME\\nOn 15/01/26', 'JX-HDFCBK-S')).toBe('MERCHANT NAME');
    });

    it('handles multiple spaces in merchant extraction', () => {
      const result = extractMerchant('Spent Rs.100   IST   MERCHANT   NAME Avl', 'AD-AXISBK');
      expect(result).toContain('MERCHANT');
    });

    it('returns cleaned sender when no pattern matches', () => {
      expect(extractMerchant('No merchant info', 'VM-UNKNOWN')).toBe('UNKNOWN');
    });
  });
});
