import { forwardRef, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitConsumer } from './rabbit.consumer';
import { CompanyModule } from '~/company/company.module';

@Module({
  imports: [forwardRef(() => CompanyModule)],
  providers: [RabbitMQService, RabbitConsumer],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
