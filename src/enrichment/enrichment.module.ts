import { Module } from '@nestjs/common';
import { EnrichmentController } from './infrastructure/http/controllers/enrichment.controller';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { CreateEnrichmentJob } from './application/usecases/create-enrichment-job.usecase';
import { GetEnrichmentStatus } from './application/usecases/get-enrichment-status.usecase';
import { PrismaEnrichmentJobRepository } from './infrastructure/persistence/repositories/prisma/prisma.enrichment.repository';
import { PersistenceModule } from '~/shared/infrastructure/persistence/persistence.module';
import { EnrichmentJobRepository } from './domain/repositories/enrichment-job.repository';
import { GetEnrichmentResults } from './application/usecases/get-enrichment-results.usecase';

@Module({
  controllers: [EnrichmentController],
  imports: [PersistenceModule],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'EnrichmentJobRepository',
      useFactory: (prismaService: PrismaService) => {
        return new PrismaEnrichmentJobRepository(prismaService);
      },
      inject: ['PrismaService'],
    },
    {
      provide: CreateEnrichmentJob.Usecase,
      useFactory: (companyRepository: EnrichmentJobRepository) => {
        return new CreateEnrichmentJob.Usecase(companyRepository);
      },
      inject: ['EnrichmentJobRepository'],
    },
    {
      provide: GetEnrichmentStatus.Usecase,
      useFactory: (companyRepository: EnrichmentJobRepository) => {
        return new GetEnrichmentStatus.Usecase(companyRepository);
      },
      inject: ['EnrichmentJobRepository'],
    },
    {
      provide: GetEnrichmentResults.Usecase,
      useFactory: (companyRepository: EnrichmentJobRepository) => {
        return new GetEnrichmentResults.Usecase(companyRepository);
      },
      inject: ['EnrichmentJobRepository'],
    },
  ],
  exports: ['EnrichmentJobRepository', CreateEnrichmentJob.Usecase],
})
export class EnrichmentModule {}
