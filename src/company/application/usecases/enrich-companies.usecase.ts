import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { EnrichCompaniesCommand } from '~/company/application/commands/enrich-companies-command';
import { Inject, Logger } from '@nestjs/common';
import { UUID } from '~/shared/application/helpers/uuid.helper';
import { RabbitMQService } from '~/shared/infrastructure/queues/rabbitmq/rabbitmq.service';
import { DateTime } from 'luxon';
import { CreateEnrichmentJobCommand } from '~/enrichment/application/commands/create-enrichment-job.command';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { CreateEnrichmentJob } from '~/enrichment/application/usecases/create-enrichment-job.usecase';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { default as Redis } from 'ioredis';

export namespace EnrichCompanies {
  export class Usecase {
    private readonly logger = new Logger('EnrichCompanies Usecase');
    private readonly REDIS_DUPLICATE_TTL = 86400; // 24 hours in seconds

    constructor(
      @Inject('CompanyRepository')
      private companyRepository: CompanyRepository,

      @Inject(RabbitMQService)
      private rabbitMQService: RabbitMQService,

      @Inject(CreateEnrichmentJob.Usecase)
      private createEnrichmentJobUseCase: CreateEnrichmentJob.Usecase,

      @InjectRedis()
      private readonly redis: Redis,
    ) {}

    async execute(command: EnrichCompaniesCommand): Promise<{
      jobId: string;
      totalCompanies: number;
      created_at: string;
    }> {
      const jobId = UUID.generate();

      const createEnrichmentJobCommand = CreateEnrichmentJobCommand.fromObject({
        jobId: jobId,
        status: EnrichmentJobStatus.IN_PROGRESS,
        completedAt: null,
        cnpjs: command.cnpjs,
      });

      // Create an enrichment job in the database
      await this.createEnrichmentJobUseCase.execute(createEnrichmentJobCommand);

      const queueName = 'cnpj_enrichment_queue';
      const uniqueCnpjs = await this.filterDuplicateCnpjs(jobId, command.cnpjs);

      await Promise.all(
        uniqueCnpjs.map(async cnpj => {
          try {
            await this.rabbitMQService.publishToQueue(queueName, {
              cnpj,
              jobId,
            });
            await this.markCnpjAsProcessed(jobId, cnpj);
            this.logger.log(`CNPJ ${cnpj} enqueued for job ${jobId}`);
          } catch (e) {
            const error = e as Error;
            this.logger.error(
              `Error enqueueing CNPJ ${cnpj}: ${error.message}`,
            );
            await this.clearCnpjProcessingFlag(jobId, cnpj);
          }
        }),
      );

      return {
        jobId: jobId,
        totalCompanies: uniqueCnpjs.length,
        created_at: DateTime.now().toISO(),
      };
    }

    private async filterDuplicateCnpjs(
      jobId: string,
      cnpjs: string[],
    ): Promise<string[]> {
      const results = await Promise.all(
        cnpjs.map(async cnpj => {
          const key = this.getRedisKey(cnpj);
          const exists = await this.redis.exists(key);
          return exists ? null : cnpj;
        }),
      );

      return results.filter(Boolean) as string[];
    }

    private async markCnpjAsProcessed(
      jobId: string,
      cnpj: string,
    ): Promise<void> {
      const key = this.getRedisKey(cnpj);
      await this.redis.set(key, '1', 'EX', this.REDIS_DUPLICATE_TTL);
    }

    private async clearCnpjProcessingFlag(
      jobId: string,
      cnpj: string,
    ): Promise<void> {
      const key = this.getRedisKey(cnpj);
      await this.redis.del(key);
    }

    private getRedisKey(cnpj: string): string {
      return `enrichment:lock:${cnpj}`;
    }
  }
}
