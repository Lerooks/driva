import { EnrichCompaniesCommandSchema } from '../../enrich-companies-command.schema';

describe('EnrichCompaniesCommandSchema', () => {
  it('should validate an array of valid CNPJs', () => {
    const result = EnrichCompaniesCommandSchema.safeParse({
      cnpjs: ['12345678000195', '98765432000199'],
    });

    expect(result.success).toBe(true);
  });

  it('should fail if cnpjs array is empty', () => {
    const result = EnrichCompaniesCommandSchema.safeParse({
      cnpjs: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /At least one CNPJ is required/,
    );
  });

  it('should fail if a CNPJ is shorter than 14 digits', () => {
    const result = EnrichCompaniesCommandSchema.safeParse({
      cnpjs: ['123'],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /CNPJ must have exactly 14 digits/,
    );
  });

  it('should fail if a CNPJ contains non-numeric characters', () => {
    const result = EnrichCompaniesCommandSchema.safeParse({
      cnpjs: ['12345678ABCD95'],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /CNPJ must contain only numbers/,
    );
  });
});
