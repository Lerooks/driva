import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { PrismaEnrichmentJobRepository } from '../../prisma.enrichment.repository';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import { UUID } from '~/shared/application/helpers/uuid.helper';

describe('PrismaEnrichmentJobRepository', () => {
  let repository: PrismaEnrichmentJobRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaEnrichmentJobRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaEnrichmentJobRepository>(
      PrismaEnrichmentJobRepository,
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

  describe('create()', () => {
    it('should create a new enrichment job with companies', async () => {
      const jobId = '123e4567-e89b-12d3-a456-426614174000';
      const cnpjs = ['11444777000161', '11222333000144'];

      // First create the companies
      await prisma.company.createMany({
        data: cnpjs.map(cnpj => ({
          cnpj,
          corporateName: `Company ${cnpj}`,
          city: 'Test City',
          segment: 'Test Segment',
          registrationStatus: 'ACTIVE',
        })),
      });

      const result = await repository.create({
        jobId,
        status: EnrichmentJobStatus.PENDING,
        cnpjs,
        completedAt: null,
      });

      expect(result).toEqual({ jobId });

      const createdJob = await prisma.enrichment.findFirst({
        where: { jobId },
        include: { enrichmentCompanies: true },
      });

      expect(createdJob).toBeTruthy();
      expect(createdJob?.status).toBe('PENDING');
      expect(createdJob?.enrichmentCompanies).toHaveLength(2);
      expect(createdJob?.enrichmentCompanies.map(ec => ec.companyCnpj)).toEqual(
        expect.arrayContaining(cnpjs),
      );
    });

    it('should throw error when creating job with invalid CNPJ', async () => {
      const jobId = UUID.generate();
      const invalidCnpjs = ['12F345678000195', '00000000000000'];

      await expect(
        repository.create({
          jobId,
          status: EnrichmentJobStatus.PENDING,
          cnpjs: invalidCnpjs,
          completedAt: null,
        }),
      ).rejects.toThrow();
    });
  });

  describe('getStatus()', () => {
    describe('getStatus()', () => {
      it('should return job status with counts', async () => {
        const jobId = '123e4567-e89b-12d3-a456-426614174000';
        const cnpjs = ['11444777000161', '11222333000144', '66777888000199'];

        // First create the companies
        await prisma.company.createMany({
          data: cnpjs.map(cnpj => ({
            cnpj,
            corporateName: `Company ${cnpj}`,
            city: 'Test City',
            segment: 'Test Segment',
            registrationStatus: 'ACTIVE',
          })),
        });

        // Then create the enrichment job with companies
        await prisma.enrichment.create({
          data: {
            jobId,
            status: 'IN_PROGRESS',
            enrichmentCompanies: {
              create: [
                { companyCnpj: cnpjs[0], status: 'COMPLETED' },
                { companyCnpj: cnpjs[1], status: 'FAILED' },
                { companyCnpj: cnpjs[2], status: 'PENDING' },
              ],
            },
          },
        });

        const result = await repository.getStatus(jobId);

        expect(result?.jobId).toBe(jobId);
        expect(result?.status).toBe('IN_PROGRESS');
        expect(result?.companies).toBe(3);
        expect(result?.completed).toBe(1);
        expect(result?.failed).toBe(1);
        expect(result?.pending).toBe(1);
      });

      it('should return null when job not found', async () => {
        const uuid = UUID.generate();
        const result = await repository.getStatus(uuid);
        expect(result).toBeNull();
      });
    });

    it('should return null when job not found', async () => {
      const uuid = UUID.generate();
      const result = await repository.getStatus(uuid);
      expect(result).toBeNull();
    });
  });

  describe('getResults()', () => {
    it('should return job results with companies', async () => {
      const jobId = UUID.generate();
      const cnpj = '11444777000161';

      // Create test data
      await prisma.company.create({
        data: {
          cnpj,
          corporateName: 'Test Company',
          city: 'São Paulo',
          segment: 'Technology',
          registrationStatus: 'ACTIVE',
          phones: {
            create: { number: '11999999999', isValid: true },
          },
          emails: {
            create: { address: 'test@test.com', isValid: true },
          },
        },
      });

      await prisma.enrichment.create({
        data: {
          jobId,
          status: EnrichmentJobStatus.COMPLETED,
          completedAt: null,
          enrichmentCompanies: {
            create: {
              companyCnpj: cnpj,
              status: EnrichmentJobStatus.COMPLETED,
            },
          },
        },
      });

      const result = await repository.getResults(jobId);

      expect(result.jobId).toBe(jobId);
      expect(result.totals.companies).toBe(1);
      expect(result.totals.completed).toBe(1);
      expect(result.totals.failed).toBe(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        cnpj,
        corporateName: 'Test Company',
        city: 'São Paulo',
        segment: 'Technology',
        registrationStatus: 'ACTIVE',
        phones: [{ number: '11999999999', valid: true }],
        emails: [{ address: 'test@test.com', valid: true }],
      });
    });

    it('should throw error when job not found', async () => {
      const uuid = UUID.generate();
      await expect(repository.getResults(uuid)).rejects.toThrow(
        `Enrichment job with jobId ${uuid} not found.`,
      );
    });
  });

  describe('updateStatus()', () => {
    it('should update job status', async () => {
      const jobId = UUID.generate();
      const completedAt = new Date();

      await prisma.enrichment.create({
        data: {
          jobId,
          status: 'IN_PROGRESS',
        },
      });

      await repository.updateStatus({
        jobId,
        status: EnrichmentJobStatus.COMPLETED,
        completedAt,
      });

      const updatedJob = await prisma.enrichment.findFirst({
        where: { jobId },
      });

      expect(updatedJob?.status).toBe('COMPLETED');
      expect(updatedJob?.completedAt).toEqual(completedAt);
    });
  });

  describe('updateEnrichmentCompanyStatus()', () => {
    it('should update company status in enrichment job', async () => {
      const jobId = UUID.generate();
      const cnpj = '22511862000111';

      // First create the company
      await prisma.company.create({
        data: {
          cnpj,
          corporateName: `Company ${cnpj}`,
          city: 'Test City',
          segment: 'Test Segment',
          registrationStatus: 'ACTIVE',
        },
      });

      await prisma.enrichment.create({
        data: {
          jobId,
          status: 'IN_PROGRESS',
          enrichmentCompanies: {
            create: {
              companyCnpj: cnpj,
              status: 'PENDING',
            },
          },
        },
      });

      await repository.updateEnrichmentCompanyStatus({
        jobId,
        companyCnpj: cnpj,
        status: EnrichmentJobStatus.COMPLETED,
      });

      const updatedCompany = await prisma.enrichmentCompany.findFirst({
        where: {
          companyCnpj: cnpj,
          enrichment: { jobId },
        },
      });

      expect(updatedCompany?.status).toBe('COMPLETED');

      await prisma.enrichmentCompany.deleteMany();
      await prisma.enrichment.deleteMany();
      await prisma.phone.deleteMany();
      await prisma.email.deleteMany();
      await prisma.company.deleteMany();
    });
  });
});
