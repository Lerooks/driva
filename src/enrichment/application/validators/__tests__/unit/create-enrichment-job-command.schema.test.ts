import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { CreateEnrichmentJobCommandSchema } from '../../create-enrichment-job-command.schema';

describe('CreateEnrichmentJobCommandSchema', () => {
  const validPayload = {
    jobId: 'c0e1a6f2-9a6d-4c3c-9bfc-a2bbf8188f13',
    status: EnrichmentJobStatus.PENDING,
    completedAt: null,
    cnpjs: ['12345678000195', '98765432000190'],
  };

  it('should validate valid data', () => {
    const result = CreateEnrichmentJobCommandSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should throw error when jobId is invalid', () => {
    const invalidPayload = {
      ...validPayload,
      jobId: 'invalid-uuid',
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Invalid UUID format for jobId',
    );
  });

  it('should throw error when status is invalid', () => {
    const invalidPayload = {
      ...validPayload,
      status: 'COMPLETED',
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid status value');
  });

  it('should throw error when cnpjs array is empty', () => {
    const invalidPayload = {
      ...validPayload,
      cnpjs: [],
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'At least one CNPJ is required',
    );
  });

  it('should throw error when cnpjs contains invalid length', () => {
    const invalidPayload = {
      ...validPayload,
      cnpjs: ['1234'],
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'CNPJ must have exactly 14 digits',
    );
  });

  it('should throw error when cnpjs contains non-numeric characters', () => {
    const invalidPayload = {
      ...validPayload,
      cnpjs: ['12345678A00195'],
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'CNPJ must contain only numbers',
    );
  });

  it('should throw error when completedAt is a future date', () => {
    const futureDate = new Date(Date.now() + 100000); // future date
    const invalidPayload = {
      ...validPayload,
      completedAt: futureDate,
    };
    const result = CreateEnrichmentJobCommandSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Completion date cannot be in the future',
    );
  });

  it('should pass when completedAt is null or in the past', () => {
    const pastDate = new Date(Date.now() - 100000); // past date
    const validPayloadWithNullDate = {
      ...validPayload,
      completedAt: null,
    };
    const validPayloadWithPastDate = {
      ...validPayload,
      completedAt: pastDate,
    };

    const resultNull = CreateEnrichmentJobCommandSchema.safeParse(
      validPayloadWithNullDate,
    );
    const resultPast = CreateEnrichmentJobCommandSchema.safeParse(
      validPayloadWithPastDate,
    );

    expect(resultNull.success).toBe(true);
    expect(resultPast.success).toBe(true);
  });
});
