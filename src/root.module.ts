import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { RabbitMQModule } from './shared/infrastructure/queues/rabbitmq/rabbitmq.module';
import { PersistenceModule } from './shared/infrastructure/persistence/persistence.module';
import { SharedModule } from './shared/shared.module';
import { RedisModule } from './shared/infrastructure/persistence/cache/redis/redis.module';

@Module({
  imports: [
    SharedModule,
    PersistenceModule,
    RabbitMQModule,
    RedisModule,
    CompanyModule,
    EnrichmentModule,
  ],
})
export class RootModule {}
