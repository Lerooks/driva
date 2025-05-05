import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { UUID } from '~/shared/application/helpers/uuid.helper';
import { CreateEnrichmentJobCommand } from '../../create-enrichment-job.command';

describe('CreateEnrichmentJobCommand', () => {
  const validPayload = {
    jobId: UUID.generate(),
    status: EnrichmentJobStatus.PENDING,
    completedAt: null,
    cnpjs: ['12345678000195', '98765432000190'],
  };

  it('should create command with valid payload', () => {
    const command = CreateEnrichmentJobCommand.fromObject(validPayload);
    expect(command).toBeInstanceOf(CreateEnrichmentJobCommand);
    expect(command.jobId).toBe(validPayload.jobId);
    expect(command.status).toBe(validPayload.status);
    expect(command.completedAt).toBeNull();
    expect(command.cnpjs).toEqual(validPayload.cnpjs);
  });

  it('should throw validation error when jobId is invalid', () => {
    expect(() =>
      CreateEnrichmentJobCommand.fromObject({
        ...validPayload,
        jobId: 'invalid-uuid',
      }),
    ).toThrow(/jobId - Invalid UUID format/);
  });

  it('should throw validation error when status is invalid', () => {
    expect(() =>
      CreateEnrichmentJobCommand.fromObject({
        ...validPayload,
        status: 'COMPLETED',
      }),
    ).toThrow(/status - Invalid status value/);
  });

  it('should throw validation error when cnpjs is empty', () => {
    expect(() =>
      CreateEnrichmentJobCommand.fromObject({
        ...validPayload,
        cnpjs: [],
      }),
    ).toThrow(/cnpjs - At least one CNPJ is required/);
  });

  it('should throw validation error when cnpj is not 14 digits', () => {
    expect(() =>
      CreateEnrichmentJobCommand.fromObject({
        ...validPayload,
        cnpjs: ['1234'],
      }),
    ).toThrow(/cnpjs.0 - CNPJ must have exactly 14 digits/);
  });
});
