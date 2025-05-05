import { Test, TestingModule } from '@nestjs/testing';
import { CreateEnrichmentJob } from '../../create-enrichment-job.usecase';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { PrismaEnrichmentJobRepository } from '~/enrichment/infrastructure/persistence/repositories/prisma/prisma.enrichment.repository';
import { CreateEnrichmentJobCommand } from '~/enrichment/application/commands/create-enrichment-job.command';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';

describe('CreateEnrichmentJob', () => {
  let usecase: CreateEnrichmentJob.Usecase;
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
          provide: CreateEnrichmentJob.Usecase,
          useFactory: (companyRepository: EnrichmentJobRepository) => {
            return new CreateEnrichmentJob.Usecase(companyRepository);
          },
          inject: ['EnrichmentJobRepository'],
        },
      ],
    }).compile();

    usecase = module.get<CreateEnrichmentJob.Usecase>(
      CreateEnrichmentJob.Usecase,
    );
    prisma = module.get<PrismaService>(PrismaService);
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

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new enrichment job with companies', async () => {
      await prisma.company.createMany({
        data: [
          {
            cnpj: '12345678901234',
            corporateName: 'Test Company 1',
            city: 'São Paulo',
            segment: 'Technology',
            registrationStatus: 'ACTIVE',
          },
          {
            cnpj: '98765432109876',
            corporateName: 'Test Company 2',
            city: 'Rio de Janeiro',
            segment: 'Finance',
            registrationStatus: 'ACTIVE',
          },
        ],
      });

      const command: CreateEnrichmentJobCommand = {
        jobId: '550e8400-e29b-41d4-a716-446655440000',
        cnpjs: ['12345678901234', '98765432109876'],
        status: EnrichmentJobStatus.PENDING,
        completedAt: null,
      };

      await usecase.execute(command);

      const createdJob = await prisma.enrichment.findFirst({
        where: { jobId: command.jobId },
        include: { enrichmentCompanies: true },
      });
      expect(createdJob).toBeDefined();
      expect(createdJob?.status).toBe('PENDING');
      expect(createdJob?.enrichmentCompanies).toHaveLength(2);
      expect(createdJob?.enrichmentCompanies.map(ec => ec.companyCnpj)).toEqual(
        expect.arrayContaining(command.cnpjs),
      );
    });

    it('should fail when trying to create job with non-existent company', async () => {
      const command: CreateEnrichmentJobCommand = {
        jobId: '550e8400-e29b-41d4-a716-446655440000',
        cnpjs: ['99999999999999'],
        status: EnrichmentJobStatus.PENDING,
        completedAt: null,
      };
      await expect(usecase.execute(command)).rejects.toThrow();
    });

    it('should create completed job with timestamp', async () => {
      await prisma.company.create({
        data: {
          cnpj: '12345678901234',
          corporateName: 'Test Company',
          city: 'São Paulo',
          segment: 'Tech',
          registrationStatus: 'ACTIVE',
        },
      });

      const now = new Date();
      const command: CreateEnrichmentJobCommand = {
        jobId: '550e8400-e29b-41d4-a716-446655440000',
        cnpjs: ['12345678901234'],
        status: EnrichmentJobStatus.PENDING,
        completedAt: now,
      };

      await usecase.execute(command);

      const createdJob = await prisma.enrichment.findFirst({
        where: { jobId: command.jobId },
      });

      expect(createdJob?.status).toBe('PENDING');
      expect(createdJob?.completedAt).toEqual(now);
    });
  });
});
