import { Company } from '~/company/domain/entities/company.entity';
import { Email } from '~/company/domain/value-objects/email';
import { Phone } from '~/company/domain/value-objects/phone';

export interface CompanyRepository {
  findByCnpj(cnpj: string): Promise<Company.Props | null>;
  save(data: Company.CreateProps): Promise<void>;
  addCompanyEmail(email: {
    address: string;
    isValid: boolean;
    companyCnpj: string;
  }): Promise<Email>;
  addCompanyPhone(phone: {
    number: string;
    isValid: boolean;
    companyCnpj: string;
  }): Promise<Phone>;
}
