import { CNPJ } from '../../cnpj.validator';

describe('CNPJ', () => {
  it('should return true for a valid CNPJ', () => {
    const validCNPJ = '12.345.678/0001-95';
    const isValid = CNPJ.validate(validCNPJ);
    expect(isValid).toBe(true);
  });

  it('should return false for an invalid CNPJ', () => {
    const invalidCNPJ = '12.345.678/0001-00';
    const isValid = CNPJ.validate(invalidCNPJ);
    expect(isValid).toBe(false);
  });

  it('should return false for a CNPJ with incorrect length', () => {
    const invalidCNPJ = '12345678'; // Shorter than 14 digits
    const isValid = CNPJ.validate(invalidCNPJ);
    expect(isValid).toBe(false);
  });

  it('should return false for a CNPJ with non-numeric characters', () => {
    const invalidCNPJ = '12F345678/0001-95';
    const isValid = CNPJ.validate(invalidCNPJ);
    expect(isValid).toBe(false);
  });

  it('should return true for another valid CNPJ', () => {
    const validCNPJ = '66.458.494/0001-60';
    const isValid = CNPJ.validate(validCNPJ);
    expect(isValid).toBe(true);
  });

  it('should return true for a valid CNPJ with correct second check digit', () => {
    const validCNPJ = '66.458.494/0001-60';
    const isValid = CNPJ.validate(validCNPJ);
    expect(isValid).toBe(true);
  });

  it('should return false for a CNPJ with incorrect second check digit', () => {
    const invalidCNPJ = '12.345.678/0001-94';
    const isValid = CNPJ.validate(invalidCNPJ);
    expect(isValid).toBe(false);
  });
});
