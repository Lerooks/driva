import { z } from 'zod';

export const EnrichCompaniesCommandSchema = z.object({
  cnpjs: z
    .array(
      z
        .string()
        .length(14, 'CNPJ must have exactly 14 digits')
        .regex(/^\d+$/, 'CNPJ must contain only numbers'),
      // .refine(cnpj => CNPJ.validate(cnpj), 'Invalid CNPJ'),
    )
    .nonempty('At least one CNPJ is required'),
});
