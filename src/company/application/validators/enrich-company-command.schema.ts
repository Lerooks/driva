import { z } from 'zod';

export const EnrichCompanyCommandSchema = z.object({
  cnpj: z
    .string()
    .min(14, 'CNPJ must have exactly 14 digits')
    .max(14, 'CNPJ must have exactly 14 digits'),
  // .refine(cnpj => CNPJ.validate(cnpj), {
  //   message: 'Invalid CNPJ number',
  // }),
  jobId: z
    .string()
    .min(1, 'Job ID is required')
    .uuid('Invalid UUID format for jobId'),
});
