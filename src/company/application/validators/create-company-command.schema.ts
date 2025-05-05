import { z } from 'zod';

export const RegistrationStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const CreateCompanyCommandSchema = z.object({
  cnpj: z
    .string()
    .min(14, 'CNPJ must have exactly 14 digits')
    .max(14, 'CNPJ must have exactly 14 digits'),
  corporateName: z
    .string()
    .min(3, 'Corporate name must be at least 3 characters')
    .max(255, 'Corporate name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s.,-]+$/, 'Invalid characters in corporate name'),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  segment: z
    .string()
    .min(2, 'Segment must be at least 2 characters')
    .max(100, 'Segment must be less than 100 characters'),
  registrationStatus: RegistrationStatusSchema,
});

export type CreateUserCommandInput = z.infer<typeof CreateCompanyCommandSchema>;
