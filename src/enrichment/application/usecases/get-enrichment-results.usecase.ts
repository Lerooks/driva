import { Inject } from '@nestjs/common';
import { Company } from '~/company/domain/entities/company.entity';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';

export namespace GetEnrichmentResults {
  export interface ResponseProps {
    jobId: string;
    createdAt: string;
    completedAt: string | null;
    totals: {
      companies: number;
      completed: number;
      failed: number;
    };
    items: Company.Props[];
  }

  export class Usecase {
    constructor(
      @Inject('EnrichmentJobRepository')
      private enrichmentJobRepository: EnrichmentJobRepository,
    ) {}

    async execute(jobId: string): Promise<ResponseProps> {
      const result = await this.enrichmentJobRepository.getResults(jobId);

      return {
        jobId: result.jobId,
        createdAt: result.createdAt,
        completedAt: result.completedAt || null,
        totals: {
          companies: result.totals.companies,
          completed: result.totals.completed,
          failed: result.totals.failed,
        },
        items: result.items.map((item: Company.Props) => ({
          cnpj: item.cnpj,
          corporateName: item.corporateName,
          city: item.city,
          segment: item.segment,
          registrationStatus: item.registrationStatus,
          updatedAt: item.updatedAt,
          phones: item.phones,
          emails: item.emails,
        })),
      };
    }
  }
}
