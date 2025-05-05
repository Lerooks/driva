import { Test, TestingModule } from '@nestjs/testing';
import { PersistenceModule } from '../../persistence.module';
import { PrismaService } from '../../database/prisma/prisma.service';

describe('PersistenceModule', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PersistenceModule],
    }).compile();

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

  it('should be defined and connect to database', async () => {
    expect(prisma).toBeDefined();
    const result = await prisma.$queryRawUnsafe('SELECT 1');
    expect(result).toBeDefined();
  });

  it('should allow basic operations (e2e-like)', async () => {
    await prisma.company.create({
      data: {
        cnpj: '12345678901234',
        corporateName: 'Test Company',
        city: 'São Paulo',
        segment: 'Tech',
        registrationStatus: 'ACTIVE',
      },
    });

    const companies = await prisma.company.findMany();
    expect(companies).toHaveLength(1);
    expect(companies[0].cnpj).toBe('12345678901234');
  });
});
