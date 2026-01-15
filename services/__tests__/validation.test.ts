import { validateAmount, validateMerchant, validateCategory, validateAccountId, validateTransaction } from '../validation';

describe('Validation', () => {
  describe('validateAmount', () => {
    it('accepts valid amounts', () => {
      expect(validateAmount('100').isValid).toBe(true);
      expect(validateAmount('1000.50').isValid).toBe(true);
      expect(validateAmount('0.01').isValid).toBe(true);
    });

    it('rejects empty amount', () => {
      const result = validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount is required');
    });

    it('rejects non-numeric amount', () => {
      const result = validateAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a valid number');
    });

    it('rejects zero or negative amount', () => {
      expect(validateAmount('0').isValid).toBe(false);
      expect(validateAmount('-100').isValid).toBe(false);
    });

    it('rejects amount exceeding limit', () => {
      const result = validateAmount('20000000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount exceeds maximum limit (1 crore)');
    });

    it('rejects more than 2 decimal places', () => {
      const result = validateAmount('100.123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount can have maximum 2 decimal places');
    });
  });

  describe('validateMerchant', () => {
    it('accepts valid merchant names', () => {
      expect(validateMerchant('Amazon').isValid).toBe(true);
      expect(validateMerchant('HDFC Bank').isValid).toBe(true);
    });

    it('rejects empty merchant', () => {
      const result = validateMerchant('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Merchant name is required');
    });

    it('rejects merchant name too long', () => {
      const result = validateMerchant('A'.repeat(101));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Merchant name too long (max 100 characters)');
    });
  });

  describe('validateCategory', () => {
    it('accepts valid categories', () => {
      expect(validateCategory('food_dining').isValid).toBe(true);
      expect(validateCategory('shopping').isValid).toBe(true);
      expect(validateCategory('utilities').isValid).toBe(true);
    });

    it('rejects invalid category', () => {
      const result = validateCategory('invalid_category');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid category selected');
    });

    it('rejects empty category', () => {
      const result = validateCategory('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateAccountId', () => {
    it('accepts valid account ID', () => {
      expect(validateAccountId('acc-123').isValid).toBe(true);
    });

    it('rejects empty account ID', () => {
      const result = validateAccountId('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account must be selected');
    });
  });

  describe('validateTransaction', () => {
    it('accepts valid transaction', () => {
      const result = validateTransaction({
        amount: '100',
        merchant: 'Amazon',
        category: 'shopping',
        accountId: 'acc-123',
      });
      expect(result.isValid).toBe(true);
    });

    it('rejects transaction with invalid amount', () => {
      const result = validateTransaction({
        amount: '-100',
        merchant: 'Amazon',
        category: 'shopping',
        accountId: 'acc-123',
      });
      expect(result.isValid).toBe(false);
    });

    it('rejects transaction with invalid merchant', () => {
      const result = validateTransaction({
        amount: '100',
        merchant: '',
        category: 'shopping',
        accountId: 'acc-123',
      });
      expect(result.isValid).toBe(false);
    });

    it('rejects transaction with invalid category', () => {
      const result = validateTransaction({
        amount: '100',
        merchant: 'Amazon',
        category: 'invalid',
        accountId: 'acc-123',
      });
      expect(result.isValid).toBe(false);
    });

    it('rejects transaction with invalid account', () => {
      const result = validateTransaction({
        amount: '100',
        merchant: 'Amazon',
        category: 'shopping',
        accountId: '',
      });
      expect(result.isValid).toBe(false);
    });
  });
});
