import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { CreateCompanyCommand } from '~/company/application/commands/create-company.command';
import { Inject } from '@nestjs/common';

export namespace CreateCompany {
  export class Usecase {
    constructor(
      @Inject('CompanyRepository')
      private companyRepository: CompanyRepository,
    ) {}

    async execute(command: CreateCompanyCommand): Promise<void> {
      const companyExists = await this.companyRepository.findByCnpj(
        command.cnpj,
      );
      if (companyExists) {
        throw new Error(`Company with CNPJ ${command.cnpj} already exists`);
      }

      await this.companyRepository.save({
        cnpj: command.cnpj,
        corporateName: command.corporateName,
        city: command.city,
        segment: command.segment,
        registrationStatus: command.registrationStatus,
      });

      return;
    }
  }
}
