import { Inject } from '@nestjs/common';
import { CreateEnrichmentJobCommand } from '~/enrichment/application/commands/create-enrichment-job.command';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';

export namespace CreateEnrichmentJob {
  export class Usecase {
    constructor(
      @Inject('EnrichmentJobRepository')
      private enrichmentJobRepository: EnrichmentJobRepository,
    ) {}

    async execute(command: CreateEnrichmentJobCommand) {
      await this.enrichmentJobRepository.create({
        jobId: command.jobId,
        completedAt: command.completedAt,
        status: command.status,
        cnpjs: command.cnpjs,
      });
    }
  }
}
