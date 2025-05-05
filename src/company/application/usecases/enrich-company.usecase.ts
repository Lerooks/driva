import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { EnrichCompanyCommand } from '~/company/application/commands/enrich-company.command';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { EmailService } from '~/shared/infrastructure/http/services/email.service';
import { PhoneService } from '~/shared/infrastructure/http/services/phone.service';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { DateTime } from 'luxon';

export namespace EnrichCompany {
  @Injectable()
  export class Usecase {
    private readonly logger = new Logger('EnrichCompany UseCase');

    constructor(
      @Inject('CompanyRepository')
      private companyRepository: CompanyRepository,

      @Inject('EnrichmentJobRepository')
      private enrichmentJobRepository: EnrichmentJobRepository,

      @Inject(EmailService)
      private emailService: EmailService,

      @Inject(PhoneService)
      private phoneService: PhoneService,
    ) {}

    async execute(command: EnrichCompanyCommand): Promise<void> {
      try {
        this.logger.log(
          `Executing EnrichCompany UseCase for CNPJ: ${command.cnpj}`,
        );

        // Update EnrichmentCompany status to IN_PROGRESS
        await this.enrichmentJobRepository.updateEnrichmentCompanyStatus({
          jobId: command.jobId,
          companyCnpj: command.cnpj,
          status: EnrichmentJobStatus.IN_PROGRESS,
        });

        // Get company emails in the external service
        const emails = await this.emailService.getCompanyEmails(command.cnpj);

        // Validate emails using the external service
        const validatedEmails = await this.emailService.validateEmails(emails);

        // Update the company with the validated emails
        for (const email of validatedEmails) {
          await this.companyRepository.addCompanyEmail({
            address: email.email,
            isValid: email.valid,
            companyCnpj: command.cnpj,
          });
        }

        // Get company phones in the external service
        const phones = await this.phoneService.getCompanyPhones(command.cnpj);

        // Validate phones using the external service
        const validatedPhones = await this.phoneService.validatePhones(phones);

        // Update the company with the validated phones
        for (const phone of validatedPhones) {
          await this.companyRepository.addCompanyPhone({
            number: phone.phone,
            isValid: phone.valid,
            companyCnpj: command.cnpj,
          });
        }

        this.logger.log(
          `Completed EnrichCompany UseCase for CNPJ: ${command.cnpj}`,
        );

        // Update EnrichmentCompany status to COMPLETED
        await this.enrichmentJobRepository.updateEnrichmentCompanyStatus({
          jobId: command.jobId,
          companyCnpj: command.cnpj,
          status: EnrichmentJobStatus.COMPLETED,
        });

        // Update the enrichment job with the results
        await this.enrichmentJobRepository.updateStatus({
          jobId: command.jobId,
          status: EnrichmentJobStatus.COMPLETED,
          completedAt: DateTime.now().toJSDate(),
        });

        return;
      } catch {
        await this.enrichmentJobRepository.updateEnrichmentCompanyStatus({
          jobId: command.jobId,
          companyCnpj: command.cnpj,
          status: EnrichmentJobStatus.FAILED,
        });
      }
    }
  }
}
