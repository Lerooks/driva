import { CreateCompanyCommandSchema } from '../../create-company-command.schema';

describe('CreateCompanyCommandSchema', () => {
  const validInput = {
    cnpj: '12345678000195',
    corporateName: 'Empresa Teste Ltda',
    city: 'São Paulo',
    segment: 'Tecnologia',
    registrationStatus: 'ACTIVE',
  };

  it('should validate a correct input', () => {
    const result = CreateCompanyCommandSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should fail if cnpj is not 14 digits', () => {
    const input = { ...validInput, cnpj: '123' };
    const result = CreateCompanyCommandSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /CNPJ must have exactly 14 digits/,
    );
  });

  it('should fail if corporateName has invalid characters', () => {
    const input = { ...validInput, corporateName: 'Empresa @$%' };
    const result = CreateCompanyCommandSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /Invalid characters in corporate name/,
    );
  });

  it('should fail if city is too short', () => {
    const input = { ...validInput, city: 'S' };
    const result = CreateCompanyCommandSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /City must be at least 2 characters/,
    );
  });

  it('should fail if segment is too long', () => {
    const input = { ...validInput, segment: 'a'.repeat(101) };
    const result = CreateCompanyCommandSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(
      /Segment must be less than 100 characters/,
    );
  });

  it('should fail if registrationStatus is invalid', () => {
    const input = { ...validInput, registrationStatus: 'PENDING' };
    const result = CreateCompanyCommandSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/Invalid enum value/);
  });
});
