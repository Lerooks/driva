import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { PrismaCompanyRepository } from '~/company/infrastructure/persistence/repositories/prisma/prisma.company.repository';
import { CreateCompanyCommand } from '~/company/application/commands/create-company.command';
import { CreateCompany } from '../../create-company.usecase';

describe('CreateCompany.Usecase', () => {
  let usecase: CreateCompany.Usecase;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: 'CompanyRepository',
          useFactory: (prismaService: PrismaService) => {
            return new PrismaCompanyRepository(prismaService);
          },
          inject: [PrismaService],
        },
        CreateCompany.Usecase,
      ],
    }).compile();

    usecase = module.get(CreateCompany.Usecase);
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

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new company', async () => {
    const command: CreateCompanyCommand = {
      cnpj: '12345678000199',
      corporateName: 'Nova Empresa',
      city: 'Curitiba',
      segment: 'Educação',
      registrationStatus: 'ACTIVE',
    };

    await usecase.execute(command);

    const company = await prisma.company.findUnique({
      where: { cnpj: command.cnpj },
    });

    expect(company).toBeDefined();
    expect(company?.corporateName).toBe(command.corporateName);
    expect(company?.city).toBe(command.city);
    expect(company?.segment).toBe(command.segment);
    expect(company?.registrationStatus).toBe(command.registrationStatus);
  });

  it('should throw if company already exists', async () => {
    const command: CreateCompanyCommand = {
      cnpj: '12345678000199',
      corporateName: 'Empresa Existente',
      city: 'São Paulo',
      segment: 'Finanças',
      registrationStatus: 'ACTIVE',
    };

    await prisma.company.create({ data: command });

    await expect(usecase.execute(command)).rejects.toThrow(
      `Company with CNPJ ${command.cnpj} already exists`,
    );
  });
});
