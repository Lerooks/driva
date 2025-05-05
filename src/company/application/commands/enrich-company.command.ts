import { ZodError } from 'zod';
import { EnrichCompanyCommandSchema } from '~/company/application/validators/enrich-company-command.schema';

export class EnrichCompanyCommand {
  cnpj: string;
  jobId: string;

  constructor(props: { cnpj: string; jobId: string }) {
    this.cnpj = props.cnpj;
    this.jobId = props.jobId;
  }

  static fromObject(data: unknown): EnrichCompanyCommand {
    try {
      const parsed = EnrichCompanyCommandSchema.parse(data);
      return new EnrichCompanyCommand(parsed);
    } catch (e) {
      const error = e as ZodError;
      const message = error.issues
        .map(issue => `• ${issue.path.join('.')} - ${issue.message}`)
        .join(' ');
      throw new Error(`Validation error: ${message}`);
    }
  }
}
