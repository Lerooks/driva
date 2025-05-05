import { Inject } from '@nestjs/common';
import { Company } from '~/company/domain/entities/company.entity';
import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { BadRequestError } from '~/shared/domain/errors/bad-request.error';

export namespace GetCompany {
  export type ResponseProps = Company.Props;

  export class Usecase {
    constructor(
      @Inject('CompanyRepository')
      private companyRepository: CompanyRepository,
    ) {}

    async execute(cnpj: string): Promise<ResponseProps> {
      // const isCNPJValid = CNPJ.validate(cnpj);

      // if (!isCNPJValid) {
      //   throw new Error('Invalid CNPJ');
      // }

      const company = await this.companyRepository.findByCnpj(cnpj);

      if (!company) {
        throw new BadRequestError('Company not found');
      }

      return {
        cnpj: company.cnpj,
        corporateName: company.corporateName,
        city: company.city,
        segment: company.segment,
        registrationStatus: company.registrationStatus,
        updatedAt: company.updatedAt,
        emails: company.emails,
        phones: company.phones,
      };
    }
  }
}
