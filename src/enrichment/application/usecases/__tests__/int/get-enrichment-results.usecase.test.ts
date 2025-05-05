import { Test, TestingModule } from '@nestjs/testing';
import { GetEnrichmentResults } from '../../get-enrichment-results.usecase';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { PrismaEnrichmentJobRepository } from '~/enrichment/infrastructure/persistence/repositories/prisma/prisma.enrichment.repository';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { UUID } from '~/shared/application/helpers/uuid.helper';

describe('GetEnrichmentResults', () => {
  let usecase: GetEnrichmentResults.Usecase;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useClass: PrismaService,
        },
        {
          provide: 'EnrichmentJobRepository',
          useFactory: (prismaService: PrismaService) => {
            return new PrismaEnrichmentJobRepository(prismaService);
          },
          inject: [PrismaService],
        },
        {
          provide: GetEnrichmentResults.Usecase,
          useFactory: (companyRepository: EnrichmentJobRepository) => {
            return new GetEnrichmentResults.Usecase(companyRepository);
          },
          inject: ['EnrichmentJobRepository'],
        },
      ],
    }).compile();

    usecase = module.get(GetEnrichmentResults.Usecase);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.enrichmentCompany.deleteMany(),
      prisma.email.deleteMany(),
      prisma.phone.deleteMany(),
      prisma.company.deleteMany(),
      prisma.enrichment.deleteMany(),
    ]);
  });

  it('should return results of an enrichment job with associated companies', async () => {
    await prisma.company.create({
      data: {
        cnpj: '12345678901234',
        corporateName: 'Company A',
        city: 'São Paulo',
        segment: 'Tech',
        registrationStatus: 'ACTIVE',
        updatedAt: new Date(),
        phones: {
          create: [{ number: '11999999999' }],
        },
        emails: {
          create: [{ address: 'contact@company.com' }],
        },
      },
    });

    const jobId = UUID.generate();

    await prisma.enrichment.create({
      data: {
        jobId,
        status: EnrichmentJobStatus.COMPLETED,
        createdAt: new Date(),
        completedAt: new Date(),
        enrichmentCompanies: {
          create: {
            companyCnpj: '12345678901234',
            status: EnrichmentJobStatus.COMPLETED,
          },
        },
      },
    });

    const result = await usecase.execute(jobId);

    expect(result.jobId).toBe(jobId);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].cnpj).toBe('12345678901234');
    expect(result.items[0].phones?.[0].number).toBe('11999999999');
    expect(result.items[0].emails?.[0].address).toBe('contact@company.com');
    expect(result.totals.companies).toBe(1);
    expect(result.totals.completed).toBe(1);
    expect(result.totals.failed).toBe(0);
  });
});
