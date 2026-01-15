import { detectCategory } from '../CategoryDetector';

describe('CategoryDetector', () => {
  it('detects food_dining from merchant name', () => {
    expect(detectCategory('SANTHI', '')).toBe('food_dining');
    expect(detectCategory('HOTEL KUMAR', '')).toBe('food_dining');
    expect(detectCategory('ANANDH RESTAURANT', '')).toBe('food_dining');
  });

  it('detects transportation merchants', () => {
    expect(detectCategory('redbus', '')).toBe('transportation');
    expect(detectCategory('uber', '')).toBe('transportation');
    expect(detectCategory('ola', '')).toBe('transportation');
  });

  it('detects shopping merchants', () => {
    expect(detectCategory('amazon', '')).toBe('shopping');
    expect(detectCategory('westside', '')).toBe('shopping');
    expect(detectCategory('flipkart', '')).toBe('shopping');
    expect(detectCategory('deconstruct', '')).toBe('shopping');
  });

  it('detects utilities from merchant and body', () => {
    expect(detectCategory('airtel', '')).toBe('utilities');
    expect(detectCategory('jio', '')).toBe('utilities');
    expect(detectCategory('UNKNOWN', 'recharge')).toBe('utilities');
    expect(detectCategory('UNKNOWN', 'bill payment')).toBe('utilities');
  });

  it('detects financial merchants', () => {
    expect(detectCategory('SELVA DHANARASI CHIT FUND', '')).toBe('financial');
    expect(detectCategory('mutual fund', '')).toBe('financial');
  });

  it('detects personal transfers for simple all-caps names', () => {
    expect(detectCategory('RAJESH', '')).toBe('personal');
    expect(detectCategory('PRIYA', '')).toBe('personal');
    expect(detectCategory('JOHN DOE', '')).toBe('personal');
  });

  it('prioritizes food_dining over personal for names with food keywords', () => {
    expect(detectCategory('RAJESH KUMAR', '')).toBe('food_dining');
  });

  it('detects personal for all-caps names without specific keywords', () => {
    expect(detectCategory('AMIT SHAH', '')).toBe('personal');
  });

  it('detects healthcare for lowercase merchants', () => {
    expect(detectCategory('hospital', '')).toBe('healthcare');
    expect(detectCategory('clinic', '')).toBe('healthcare');
    expect(detectCategory('apollo pharmacy', '')).toBe('healthcare');
  });

  it('detects entertainment for lowercase merchants', () => {
    expect(detectCategory('netflix', '')).toBe('entertainment');
    expect(detectCategory('cinema', '')).toBe('entertainment');
    expect(detectCategory('movie', '')).toBe('entertainment');
  });

  it('personal category takes precedence for all-caps names', () => {
    // All-caps names match personal pattern before healthcare/entertainment
    expect(detectCategory('HOSPITAL', '')).toBe('personal');
    expect(detectCategory('NETFLIX', '')).toBe('personal');
  });

  it('handles case insensitivity for food_dining', () => {
    expect(detectCategory('santhi', '')).toBe('food_dining');
    expect(detectCategory('SANTHI', '')).toBe('food_dining');
  });

  it('excludes business keywords from personal category', () => {
    expect(detectCategory('KUMAR STORE', '')).not.toBe('personal');
    expect(detectCategory('SHARMA LTD', '')).not.toBe('personal');
    expect(detectCategory('MERCHANT PAY', '')).not.toBe('personal');
  });

  it('returns others for merchants not matching any pattern', () => {
    expect(detectCategory('XYZ123', '')).toBe('others');
    expect(detectCategory('RANDOM MERCHANT 123', '')).toBe('others');
  });

  it('handles merchants with more than 3 words', () => {
    expect(detectCategory('VERY LONG MERCHANT NAME HERE', '')).toBe('others');
  });
});
