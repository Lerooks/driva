import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { GetCompany } from '../../get-company.usecase';
import { PrismaCompanyRepository } from '~/company/infrastructure/persistence/repositories/prisma/prisma.company.repository';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { BadRequestError } from '~/shared/domain/errors/bad-request.error';

describe('GetCompany.Usecase', () => {
  let module: TestingModule;
  let usecase: GetCompany.Usecase;
  let prisma: PrismaClient;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetCompany.Usecase,
        {
          provide: 'CompanyRepository',
          useClass: PrismaCompanyRepository,
        },
        PrismaService,
      ],
    }).compile();

    usecase = module.get<GetCompany.Usecase>(GetCompany.Usecase);
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
    await module.close();
  });

  it('should return company data with emails and phones', async () => {
    const company = await prisma.company.create({
      data: {
        cnpj: '11444777000161',
        corporateName: 'Test Company LTDA',
        city: 'São Paulo',
        segment: 'Technology',
        registrationStatus: 'ACTIVE',
      },
    });

    await prisma.email.create({
      data: {
        address: 'contact@testcompany.com',
        isValid: true,
        companyCnpj: company.cnpj,
      },
    });

    await prisma.phone.create({
      data: {
        number: '+5511999999999',
        isValid: true,
        companyCnpj: company.cnpj,
      },
    });

    const result = await usecase.execute(company.cnpj);

    expect(result.cnpj).toBe(company.cnpj);
    expect(result.corporateName).toBe(company.corporateName);
    expect(result.city).toBe(company.city);
    expect(result.segment).toBe(company.segment);
    expect(result.registrationStatus).toBe(company.registrationStatus);
    expect(result.updatedAt).toBeDefined();
    expect(typeof result.updatedAt.toISOString()).toBe('string');

    expect(result.emails).toHaveLength(1);
    expect(result.emails[0].address).toBe('contact@testcompany.com');
    expect(result.emails[0].valid).toBe(true);

    expect(result.phones).toHaveLength(1);
    expect(result.phones[0].number).toBe('+5511999999999');
    expect(result.phones[0].valid).toBe(true);
  });

  it('should throw BadRequestError when company not found', async () => {
    await expect(usecase.execute('99999999999999')).rejects.toThrow(
      BadRequestError,
    );
    await expect(usecase.execute('99999999999999')).rejects.toThrow(
      'Company not found',
    );
  });

  it('should return company without contacts if none exist', async () => {
    const company = await prisma.company.create({
      data: {
        cnpj: '11444777000161',
        corporateName: 'Test Company LTDA',
        city: 'São Paulo',
        segment: 'Technology',
        registrationStatus: 'ACTIVE',
      },
    });

    const result = await usecase.execute(company.cnpj);

    expect(result.cnpj).toBe(company.cnpj);
    expect(result.corporateName).toBe(company.corporateName);
    expect(result.city).toBe(company.city);
    expect(result.segment).toBe(company.segment);
    expect(result.registrationStatus).toBe(company.registrationStatus);
    expect(result.updatedAt).toBeDefined();
    expect(typeof result.updatedAt.toISOString()).toBe('string');
    expect(result.emails).toHaveLength(0);
    expect(result.phones).toHaveLength(0);
  });
});
