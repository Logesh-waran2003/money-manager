import { isValidTransaction, detectTransactionType } from '../TransactionValidator';

describe('TransactionValidator', () => {
  describe('isValidTransaction', () => {
    it('rejects empty amount', () => {
      expect(isValidTransaction('Some body', '', 'Merchant')).toBe(false);
    });

    it('rejects zero amount', () => {
      expect(isValidTransaction('Some body', '0', 'Merchant')).toBe(false);
    });

    it('rejects OTP messages', () => {
      expect(isValidTransaction('Your OTP is 123456', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('One Time Password: 456789', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('verification code 789012', '100', 'Merchant')).toBe(false);
    });

    it('rejects promotional messages', () => {
      expect(isValidTransaction('Special offer! Get 50% discount', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('Sale now on! Click here', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('Apply now for credit card', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('T&C apply', '100', 'Merchant')).toBe(false);
    });

    it('rejects alert messages without transaction keywords', () => {
      expect(isValidTransaction('Alert: Your credit card limit is 80% utilized', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('Balance alert: Low balance', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('Due alert: Payment pending', '100', 'Merchant')).toBe(false);
    });

    it('accepts alert messages with transaction keywords', () => {
      expect(isValidTransaction('Alert: Rs.100 debited from account', '100', 'Merchant')).toBe(true);
      expect(isValidTransaction('Balance alert: Rs.500 credited', '500', 'Merchant')).toBe(true);
    });

    it('rejects messages without transaction keywords', () => {
      expect(isValidTransaction('Your account is active', '100', 'Merchant')).toBe(false);
      expect(isValidTransaction('Thank you for banking with us', '100', 'Merchant')).toBe(false);
    });

    it('rejects promotional merchants', () => {
      expect(isValidTransaction('Rs.100 debited', '100', 'Promotional')).toBe(false);
      expect(isValidTransaction('Rs.100 debited', '100', 'PROMO OFFER')).toBe(false);
      expect(isValidTransaction('Rs.100 debited', '100', 'SALE MERCHANT')).toBe(false);
    });

    it('accepts valid debit transactions', () => {
      expect(isValidTransaction('Rs.100 debited from account', '100', 'Merchant')).toBe(true);
      expect(isValidTransaction('Spent Rs.500 at merchant', '500', 'Merchant')).toBe(true);
      expect(isValidTransaction('Rs.200 paid to merchant', '200', 'Merchant')).toBe(true);
    });

    it('accepts valid credit transactions', () => {
      expect(isValidTransaction('Rs.1000 credited to account', '1000', 'Merchant')).toBe(true);
      expect(isValidTransaction('Received Rs.500 from merchant', '500', 'Merchant')).toBe(true);
      expect(isValidTransaction('Refund of Rs.200 processed', '200', 'Merchant')).toBe(true);
    });

    it('accepts withdrawal transactions', () => {
      expect(isValidTransaction('Rs.500 withdrawn from ATM', '500', 'ATM')).toBe(true);
    });

    it('accepts deposit transactions', () => {
      expect(isValidTransaction('Rs.10000 deposited to account', '10000', 'Bank')).toBe(true);
    });
  });

  describe('detectTransactionType', () => {
    it('detects credit from credit keywords', () => {
      expect(detectTransactionType('Rs.1000 credited to account')).toBe('credit');
      expect(detectTransactionType('Credit alert: Rs.500')).toBe('credit');
      expect(detectTransactionType('Received Rs.200')).toBe('credit');
      expect(detectTransactionType('Refund of Rs.100')).toBe('credit');
      expect(detectTransactionType('Salary deposited Rs.50000')).toBe('credit');
    });

    it('detects debit from debit keywords', () => {
      expect(detectTransactionType('Rs.100 debited from account')).toBe('debit');
      expect(detectTransactionType('Spent Rs.500')).toBe('debit');
      expect(detectTransactionType('Paid Rs.200')).toBe('debit');
      expect(detectTransactionType('Withdrawn Rs.1000')).toBe('debit');
      expect(detectTransactionType('Purchase of Rs.300')).toBe('debit');
    });

    it('detects debit from sent/paid patterns', () => {
      expect(detectTransactionType('Sent Rs.500 to merchant')).toBe('debit');
      expect(detectTransactionType('Paid Rs.200 via UPI')).toBe('debit');
      expect(detectTransactionType('Spent Rs.100 at store')).toBe('debit');
    });

    it('defaults to debit when unclear', () => {
      expect(detectTransactionType('Rs.100 transaction')).toBe('debit');
      expect(detectTransactionType('Amount: Rs.500')).toBe('debit');
      expect(detectTransactionType('Some random message')).toBe('debit');
    });
  });
});
