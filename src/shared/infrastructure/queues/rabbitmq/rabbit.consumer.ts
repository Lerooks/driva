import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { EnrichCompanyCommand } from '~/company/application/commands/enrich-company.command';
import { EnrichCompany } from '~/company/application/usecases/enrich-company.usecase';

@Injectable()
export class RabbitConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitConsumer.name);

  constructor(
    @Inject(RabbitMQService)
    private readonly rabbitMQService: RabbitMQService,

    @Inject(EnrichCompany.Usecase)
    private readonly enrichCompanyUseCase: EnrichCompany.Usecase,
  ) {}

  async onModuleInit() {
    await this.rabbitMQService.consumeFromQueue(
      'cnpj_enrichment_queue',
      data => {
        void (async () => {
          try {
            const command = EnrichCompanyCommand.fromObject(data);
            await this.enrichCompanyUseCase.execute(command);
          } catch (error) {
            this.logger.error('Error processing message', error);
          }
        })();
      },
    );
  }
}
