import { Test, TestingModule } from '@nestjs/testing';
import { CompanyModule } from '~/company/company.module';
import { EnrichmentModule } from '~/enrichment/enrichment.module';
import { RootModule } from '~/root.module';
import { PersistenceModule } from '~/shared/infrastructure/persistence/persistence.module';
import { RabbitMQModule } from '~/shared/infrastructure/queues/rabbitmq/rabbitmq.module';
import { SharedModule } from '~/shared/shared.module';

describe('RootModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [RootModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import CompanyModule', () => {
    const companyModule = module.select(CompanyModule);
    expect(companyModule).toBeDefined();
  });

  it('should import EnrichmentModule', () => {
    const enrichmentModule = module.select(EnrichmentModule);
    expect(enrichmentModule).toBeDefined();
  });

  it('should import RabbitMQModule', () => {
    const rabbitModule = module.select(RabbitMQModule);
    expect(rabbitModule).toBeDefined();
  });

  it('should import PersistenceModule', () => {
    const persistenceModule = module.select(PersistenceModule);
    expect(persistenceModule).toBeDefined();
  });

  it('should import SharedModule', () => {
    const sharedModule = module.select(SharedModule);
    expect(sharedModule).toBeDefined();
  });
});
