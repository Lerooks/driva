import { Inject } from '@nestjs/common';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';

export namespace GetEnrichmentStatus {
  export interface ResponseProps {
    jobId: string;
    status: string;
    progress: number;
    totals: {
      companies: number;
      completed: number;
      failed: number;
      pending: number;
    };
    lastUpdate: string | null;
  }

  export class Usecase {
    constructor(
      @Inject('EnrichmentJobRepository')
      private enrichmentJobRepository: EnrichmentJobRepository,
    ) {}

    async execute(jobId: string): Promise<ResponseProps> {
      const result = await this.enrichmentJobRepository.getStatus(jobId);

      if (!result) {
        throw new Error('Enrichment job not found');
      }

      return {
        jobId: result.jobId,
        status: result.status,
        progress: Math.round((result.completed / result.companies) * 100) / 100,
        totals: {
          companies: result.companies,
          completed: result.completed,
          failed: result.failed,
          pending: result.pending,
        },
        lastUpdate: result.lastUpdate || null,
      };
    }
  }
}
