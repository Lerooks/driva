import { DateTime } from 'luxon';
import { z } from 'zod';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';

export const CreateEnrichmentJobCommandSchema = z.object({
  jobId: z
    .string()
    .min(1, 'Job ID is required')
    .uuid('Invalid UUID format for jobId'),

  status: z.enum(
    [EnrichmentJobStatus.PENDING, EnrichmentJobStatus.IN_PROGRESS],
    {
      message: 'Invalid status value',
    },
  ),
  cnpjs: z
    .array(
      z
        .string()
        .length(14, 'CNPJ must have exactly 14 digits')
        .regex(/^\d+$/, 'CNPJ must contain only numbers'),
      // .refine(cnpj => CNPJ.validate(cnpj), 'Invalid CNPJ'),
    )
    .nonempty('At least one CNPJ is required'),

  completedAt: z
    .date()
    .nullable()
    .refine(
      date =>
        date
          ? DateTime.fromJSDate(date).toMillis() <= DateTime.now().toMillis()
          : true,
      {
        message: 'Completion date cannot be in the future',
      },
    ),
});

export type CreateEnrichmentJobCommandInput = z.infer<
  typeof CreateEnrichmentJobCommandSchema
>;
