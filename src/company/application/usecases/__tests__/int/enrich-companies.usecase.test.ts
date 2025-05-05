/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from '~/shared/infrastructure/queues/rabbitmq/rabbitmq.service';
import { CreateEnrichmentJob } from '~/enrichment/application/usecases/create-enrichment-job.usecase';
import { EnrichCompanies } from '../../enrich-companies.usecase';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { PrismaCompanyRepository } from '~/company/infrastructure/persistence/repositories/prisma/prisma.company.repository';
import { PrismaEnrichmentJobRepository } from '~/enrichment/infrastructure/persistence/repositories/prisma/prisma.enrichment.repository';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { DateTime } from 'luxon';
import { default as Redis } from 'ioredis';

describe('EnrichCompanies.Usecase', () => {
  let module: TestingModule;
  let usecase: EnrichCompanies.Usecase;
  let rabbitMQService: RabbitMQService;
  let prisma: PrismaService;
  let redis: Redis;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        // Services
        PrismaService,
        RabbitMQService,

        // Repositories
        {
          provide: 'CompanyRepository',
          useFactory: (prismaService: PrismaService) => {
            return new PrismaCompanyRepository(prismaService);
          },
          inject: [PrismaService],
        },
        {
          provide: 'EnrichmentJobRepository',
          useFactory: (prismaService: PrismaService) => {
            return new PrismaEnrichmentJobRepository(prismaService);
          },
          inject: [PrismaService],
        },

        // Use cases
        EnrichCompanies.Usecase,
        {
          provide: CreateEnrichmentJob.Usecase,
          useFactory: (companyRepository: EnrichmentJobRepository) => {
            return new CreateEnrichmentJob.Usecase(companyRepository);
          },
          inject: ['EnrichmentJobRepository'],
        },

        // Redis mock
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            exists: jest.fn().mockResolvedValue(0),
            set: jest.fn().mockResolvedValue('OK'),
            del: jest.fn().mockResolvedValue(1),
            quit: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    usecase = module.get<EnrichCompanies.Usecase>(EnrichCompanies.Usecase);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<Redis>('default_IORedisModuleConnectionToken');

    jest
      .spyOn(rabbitMQService, 'publishToQueue')
      .mockImplementation(() => Promise.resolve(true));
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await prisma.$transaction([
      prisma.enrichmentCompany.deleteMany(),
      prisma.email.deleteMany(),
      prisma.phone.deleteMany(),
      prisma.company.deleteMany(),
      prisma.enrichment.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await module.close();

    if (typeof redis.quit === 'function') {
      await redis.quit();
    }
  });

  it('should create enrichment job in database', async () => {
    const companies = await Promise.all(
      ['11444777000161', '22444888000162'].map(cnpj =>
        prisma.company.create({
          data: {
            cnpj,
            corporateName: `Company ${cnpj}`,
            city: 'São Paulo',
            segment: 'Tech',
            registrationStatus: 'ACTIVE',
          },
        }),
      ),
    );

    const command = { cnpjs: companies.map(c => c.cnpj) };

    const result = await usecase.execute(command);

    const job = await prisma.enrichment.findFirst({
      where: { jobId: result.jobId },
    });

    expect(job).toBeDefined();
    expect(job?.status).toBe('IN_PROGRESS');
    expect(job?.completedAt).toBeNull();
  });

  it('should skip duplicate CNPJs using Redis cache', async () => {
    const cnpjs = ['11444777000161', '22444888000162'];

    const companies = await Promise.all(
      cnpjs.map(cnpj =>
        prisma.company.create({
          data: {
            cnpj,
            corporateName: `Company ${cnpj}`,
            city: 'São Paulo',
            segment: 'Tech',
            registrationStatus: 'ACTIVE',
          },
        }),
      ),
    );

    const command = { cnpjs: companies.map(c => c.cnpj) };

    // Mock Redis to return "exists" for the second CNPJ
    (redis.exists as jest.Mock)
      .mockResolvedValueOnce(0) // First call - doesn't exist
      .mockResolvedValueOnce(1); // Second call - exists

    const result = await usecase.execute(command);

    expect(rabbitMQService.publishToQueue).toHaveBeenCalledTimes(1);
    expect(result.totalCompanies).toBe(1);
  });

  it('should clear Redis flag if queue publish fails', async () => {
    const cnpj = '11444777000161';
    await prisma.company.create({
      data: {
        cnpj,
        corporateName: `Company ${cnpj}`,
        city: 'São Paulo',
        segment: 'Tech',
        registrationStatus: 'ACTIVE',
      },
    });

    // Make queue publish fail
    const queueError = new Error('Queue error');
    jest
      .spyOn(rabbitMQService, 'publishToQueue')
      .mockRejectedValueOnce(queueError);

    // Mock the logger error to prevent console pollution
    jest.spyOn(usecase['logger'], 'error').mockImplementation(() => {});

    const command = { cnpjs: [cnpj] };

    await expect(usecase.execute(command)).resolves.not.toThrow();

    expect(redis.del).toHaveBeenCalled();

    expect(usecase['logger'].error).toHaveBeenCalledWith(
      `Error enqueueing CNPJ ${cnpj}: ${queueError.message}`,
    );
  });

  it('should return correct response format', async () => {
    const cnpj = '11444777000161';
    await prisma.company.create({
      data: {
        cnpj,
        corporateName: `Company ${cnpj}`,
        city: 'São Paulo',
        segment: 'Tech',
        registrationStatus: 'ACTIVE',
      },
    });

    const command = { cnpjs: [cnpj] };
    const result = await usecase.execute(command);

    expect(result).toEqual({
      jobId: expect.any(String),
      totalCompanies: 1,
      created_at: expect.any(String),
    });
    expect(DateTime.fromISO(result.created_at).isValid).toBeTruthy();
  });
});
