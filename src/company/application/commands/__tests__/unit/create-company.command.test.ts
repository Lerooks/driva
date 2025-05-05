import { CreateCompanyCommand } from '../../create-company.command';

describe('CreateCompanyCommand', () => {
  it('should create a valid command', () => {
    const data = {
      cnpj: '12345678000195',
      corporateName: 'Empresa Teste LTDA',
      city: 'São Paulo',
      segment: 'Tecnologia',
      registrationStatus: 'ACTIVE',
    };

    const command = CreateCompanyCommand.fromObject(data);

    expect(command).toBeInstanceOf(CreateCompanyCommand);
    expect(command.cnpj).toBe(data.cnpj);
    expect(command.corporateName).toBe(data.corporateName);
  });

  it('should throw a Zod error for invalid data', () => {
    const invalidData = {
      cnpj: 'invalid-cnpj',
      corporateName: '',
      city: 'São Paulo',
      segment: '',
      registrationStatus: 'INVALID_STATUS',
    };

    expect(() => CreateCompanyCommand.fromObject(invalidData)).toThrow();
  });
});
