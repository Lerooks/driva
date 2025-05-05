import { ZodError } from 'zod';
import { EnrichCompaniesCommandSchema } from '~/company/application/validators/enrich-companies-command.schema';

export class EnrichCompaniesCommand {
  cnpjs: string[] = [];

  constructor(props: { cnpjs: string[] }) {
    this.cnpjs = props.cnpjs;
  }

  static fromObject(data: unknown): EnrichCompaniesCommand {
    try {
      const parsed = EnrichCompaniesCommandSchema.parse(data);
      return new EnrichCompaniesCommand(parsed);
    } catch (e) {
      const error = e as ZodError;
      const message = error.issues
        .map(issue => `• ${issue.path.join('.')} - ${issue.message}`)
        .join(' ');
      throw new Error(`Validation error: ${message}`);
    }
  }
}
