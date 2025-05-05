import { ZodError } from 'zod';
import {
  Company,
  RegistrationStatus,
} from '~/company/domain/entities/company.entity';
import { CreateCompanyCommandSchema } from '~/company/application/validators/create-company-command.schema';

export class CreateCompanyCommand implements Company.CreateProps {
  cnpj: string;
  corporateName: string;
  city: string;
  segment: string;
  registrationStatus: RegistrationStatus;

  constructor(props: Company.CreateProps) {
    this.cnpj = props.cnpj;
    this.corporateName = props.corporateName;
    this.city = props.city;
    this.segment = props.segment;
    this.registrationStatus = props.registrationStatus;
  }

  static fromObject(data: unknown): CreateCompanyCommand {
    try {
      const parsed = CreateCompanyCommandSchema.parse(data);
      return new CreateCompanyCommand(parsed);
    } catch (e) {
      const error = e as ZodError;
      const message = error.issues
        .map(issue => `• ${issue.path.join('.')} - ${issue.message}`)
        .join(' ');
      throw new Error(`Validation error: ${message}`);
    }
  }
}
