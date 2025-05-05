import { Test, TestingModule } from '@nestjs/testing';
import { CreateEnrichmentJob } from '~/enrichment/application/usecases/create-enrichment-job.usecase';
import { GetEnrichmentResults } from '~/enrichment/application/usecases/get-enrichment-results.usecase';
import { GetEnrichmentStatus } from '~/enrichment/application/usecases/get-enrichment-status.usecase';
import { EnrichmentModule } from '~/enrichment/enrichment.module';

import { EnrichmentController } from '~/enrichment/infrastructure/http/controllers/enrichment.controller';

describe('EnrichmentModule', () => {
  let controller: EnrichmentController;
  let createEnrichmentJobUsecase: CreateEnrichmentJob.Usecase;
  let getEnrichmentStatusUsecase: GetEnrichmentStatus.Usecase;
  let getEnrichmentResultsUsecase: GetEnrichmentResults.Usecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EnrichmentModule],
    }).compile();

    controller = module.get<EnrichmentController>(EnrichmentController);
    createEnrichmentJobUsecase = module.get<CreateEnrichmentJob.Usecase>(
      CreateEnrichmentJob.Usecase,
    );
    getEnrichmentStatusUsecase = module.get<GetEnrichmentStatus.Usecase>(
      GetEnrichmentStatus.Usecase,
    );
    getEnrichmentResultsUsecase = module.get<GetEnrichmentResults.Usecase>(
      GetEnrichmentResults.Usecase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createEnrichmentJobUsecase).toBeDefined();
    expect(getEnrichmentStatusUsecase).toBeDefined();
    expect(getEnrichmentResultsUsecase).toBeDefined();
  });
});
