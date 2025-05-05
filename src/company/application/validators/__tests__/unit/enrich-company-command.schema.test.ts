import { EnrichCompanyCommandSchema } from '../../enrich-company-command.schema';

describe('EnrichCompanyCommandSchema', () => {
  it('should validate a correct input', () => {
    const result = EnrichCompanyCommandSchema.safeParse({
      cnpj: '12345678000195',
      jobId: 'b19c54f8-e909-4111-aaa1-abcabcabcabc',
    });

    expect(result.success).toBe(true);
  });

  it('should fail if cnpj is less than 14 digits', () => {
    const result = EnrichCompanyCommandSchema.safeParse({
      cnpj: '123',
      jobId: 'b19c54f8-e909-4111-aaa1-abcabcabcabc',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /CNPJ must have exactly 14 digits/,
    );
  });

  it('should fail if cnpj is more than 14 digits', () => {
    const result = EnrichCompanyCommandSchema.safeParse({
      cnpj: '123456789012345',
      jobId: 'b19c54f8-e909-4111-aaa1-abcabcabcabc',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /CNPJ must have exactly 14 digits/,
    );
  });

  it('should fail if jobId is empty', () => {
    const result = EnrichCompanyCommandSchema.safeParse({
      cnpj: '12345678000195',
      jobId: '',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Job ID is required/);
  });

  it('should fail if jobId is not a valid UUID', () => {
    const result = EnrichCompanyCommandSchema.safeParse({
      cnpj: '12345678000195',
      jobId: 'invalid-uuid',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /Invalid UUID format for jobId/,
    );
  });
});
