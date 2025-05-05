import { EnrichCompaniesCommand } from '../../enrich-companies-command';

describe('EnrichCompaniesCommand', () => {
  it('should create a valid command with cnpjs', () => {
    const data = {
      cnpjs: ['12345678000195', '98765432000196'],
    };

    const command = EnrichCompaniesCommand.fromObject(data);

    expect(command).toBeInstanceOf(EnrichCompaniesCommand);
    expect(command.cnpjs).toEqual(data.cnpjs);
  });

  it('should throw a validation error if cnpjs is not an array', () => {
    const invalidData = {
      cnpjs: 'not-an-array',
    };

    expect(() => EnrichCompaniesCommand.fromObject(invalidData)).toThrow(
      /Validation error:/,
    );
  });

  it('should throw a validation error if cnpjs contains invalid entries', () => {
    const invalidData = {
      cnpjs: ['123', '', 'abc'],
    };

    expect(() => EnrichCompaniesCommand.fromObject(invalidData)).toThrow(
      /Validation error:/,
    );
  });

  it('should throw a validation error if cnpjs is empty', () => {
    const invalidData = {
      cnpjs: [],
    };

    expect(() => EnrichCompaniesCommand.fromObject(invalidData)).toThrow(
      /Validation error:/,
    );
  });
});
