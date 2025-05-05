import { Module } from '@nestjs/common';
import { CompanyController } from './infrastructure/http/controllers/company.controller';
import { CompanyRepository } from './domain/repositories/company.repository';
import { CreateCompany } from './application/usecases/create-company.usecase';
import { EnrichCompanies } from './application/usecases/enrich-companies.usecase';
import { GetCompany } from './application/usecases/get-company.usecase';
import { PrismaCompanyRepository } from './infrastructure/persistence/repositories/prisma/prisma.company.repository';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { RabbitMQService } from '~/shared/infrastructure/queues/rabbitmq/rabbitmq.service';
import { RabbitMQModule } from '~/shared/infrastructure/queues/rabbitmq/rabbitmq.module';
import { EnrichCompany } from './application/usecases/enrich-company.usecase';
import { EnrichmentModule } from '~/enrichment/enrichment.module';
import { SharedModule } from '~/shared/shared.module';
import { EmailService } from '~/shared/infrastructure/http/services/email.service';
import { PhoneService } from '~/shared/infrastructure/http/services/phone.service';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { CreateEnrichmentJob } from '~/enrichment/application/usecases/create-enrichment-job.usecase';
import Redis from 'ioredis';

@Module({
  imports: [RabbitMQModule, EnrichmentModule, SharedModule],
  controllers: [CompanyController],
  providers: [
    PrismaService,
    {
      provide: 'CompanyRepository',
      useFactory: (prismaService: PrismaService) => {
        return new PrismaCompanyRepository(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: CreateCompany.Usecase,
      useFactory: (repository: CompanyRepository) => {
        return new CreateCompany.Usecase(repository);
      },
      inject: ['CompanyRepository'],
    },
    {
      provide: EnrichCompanies.Usecase,
      useFactory: (
        repository: CompanyRepository,
        rabbitMQService: RabbitMQService,
        createEnrichmentJobUseCase: CreateEnrichmentJob.Usecase,
        redis: Redis,
      ) => {
        return new EnrichCompanies.Usecase(
          repository,
          rabbitMQService,
          createEnrichmentJobUseCase,
          redis,
        );
      },
      inject: [
        'CompanyRepository',
        RabbitMQService,
        CreateEnrichmentJob.Usecase,
        'default_IORedisModuleConnectionToken',
      ],
    },
    {
      provide: GetCompany.Usecase,
      useFactory: (repository: CompanyRepository) => {
        return new GetCompany.Usecase(repository);
      },
      inject: ['CompanyRepository'],
    },
    {
      provide: EnrichCompany.Usecase,
      useFactory: (
        companyRepository: CompanyRepository,
        enrichmentJobRepository: EnrichmentJobRepository,
        emailService: EmailService,
        phoneService: PhoneService,
      ) => {
        return new EnrichCompany.Usecase(
          companyRepository,
          enrichmentJobRepository,
          emailService,
          phoneService,
        );
      },
      inject: [
        'CompanyRepository',
        'EnrichmentJobRepository',
        EmailService,
        PhoneService,
      ],
    },
  ],
  exports: [
    'CompanyRepository',
    EnrichCompany.Usecase,
    CreateCompany.Usecase,
    EnrichCompanies.Usecase,
    GetCompany.Usecase,
  ],
})
export class CompanyModule {}
