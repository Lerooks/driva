import { UUID } from '~/shared/application/helpers/uuid.helper';
import { EnrichCompanyCommand } from '../../enrich-company.command';

describe('EnrichCompanyCommand', () => {
  it('should create a valid command', () => {
    const data = {
      cnpj: '12345678000195',
      jobId: UUID.generate(),
    };

    const command = EnrichCompanyCommand.fromObject(data);

    expect(command).toBeInstanceOf(EnrichCompanyCommand);
    expect(command.cnpj).toBe(data.cnpj);
    expect(command.jobId).toBe(data.jobId);
  });

  it('should throw a validation error for invalid input', () => {
    const invalidData = {
      cnpj: 'invalid-cnpj',
      jobId: 123,
    };

    expect(() => EnrichCompanyCommand.fromObject(invalidData)).toThrow(
      /Validation error:/,
    );
  });
});
