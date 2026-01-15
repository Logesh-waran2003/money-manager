import { extractAccountInfo } from '../AccountExtractor';

describe('AccountExtractor', () => {
  describe('Bank detection', () => {
    it('detects HDFC Bank', () => {
      const result = extractAccountInfo('From HDFC Bank A/C *0931');
      expect(result.bank).toBe('HDFC Bank');
    });

    it('detects Axis Bank', () => {
      const result = extractAccountInfo('Axis Bank Card no. XX9498');
      expect(result.bank).toBe('Axis Bank');
    });

    it('detects SBI', () => {
      const result = extractAccountInfo('SBI A/C XX5678');
      expect(result.bank).toBe('SBI');
    });

    it('detects ICICI Bank', () => {
      const result = extractAccountInfo('ICICI Bank A/C XX4321');
      expect(result.bank).toBe('ICICI Bank');
    });

    it('returns Unknown for unrecognized bank', () => {
      const result = extractAccountInfo('Some other bank A/C XX1234');
      expect(result.bank).toBe('Unknown');
    });
  });

  describe('Account number extraction', () => {
    it('extracts account with A/C pattern', () => {
      const result = extractAccountInfo('From A/C *0931');
      expect(result.account).toBe('0931');
    });

    it('extracts account with A/c pattern', () => {
      const result = extractAccountInfo('From A/c XX5678');
      expect(result.account).toBe('5678');
    });

    it('extracts account with asterisk', () => {
      const result = extractAccountInfo('A/C **0931');
      expect(result.account).toBe('0931');
    });

    it('extracts account with X masking', () => {
      const result = extractAccountInfo('A/C XXXX0931');
      expect(result.account).toBe('0931');
    });

    it('returns null when no account found', () => {
      const result = extractAccountInfo('No account info');
      expect(result.account).toBeNull();
    });
  });

  describe('Card number extraction', () => {
    it('extracts card with "Card ending" pattern', () => {
      const result = extractAccountInfo('Card ending 9498');
      expect(result.cardLast4).toBe('9498');
    });

    it('extracts card with "Card no." pattern', () => {
      const result = extractAccountInfo('Card no. XX9498');
      expect(result.cardLast4).toBe('9498');
    });

    it('extracts card with direct pattern', () => {
      const result = extractAccountInfo('Card 1234');
      expect(result.cardLast4).toBe('1234');
    });

    it('extracts card with asterisk masking', () => {
      const result = extractAccountInfo('Card no. **9498');
      expect(result.cardLast4).toBe('9498');
    });

    it('returns null when no card found', () => {
      const result = extractAccountInfo('No card info');
      expect(result.cardLast4).toBeNull();
    });
  });

  describe('Combined extraction', () => {
    it('extracts both bank and account', () => {
      const result = extractAccountInfo('From HDFC Bank A/C *0931');
      expect(result.bank).toBe('HDFC Bank');
      expect(result.account).toBe('0931');
      expect(result.cardLast4).toBeNull();
    });

    it('extracts both bank and card', () => {
      const result = extractAccountInfo('Axis Bank Card no. XX9498');
      expect(result.bank).toBe('Axis Bank');
      expect(result.cardLast4).toBe('9498');
      expect(result.account).toBeNull();
    });

    it('handles message with both account and card', () => {
      const result = extractAccountInfo('HDFC Bank A/C *0931 Card ending 9498');
      expect(result.bank).toBe('HDFC Bank');
      expect(result.account).toBe('0931');
      expect(result.cardLast4).toBe('9498');
    });
  });
});
