import { Test, TestingModule } from '@nestjs/testing';
import { PrismaCompanyRepository } from '~/company/infrastructure/persistence/repositories/prisma/prisma.company.repository';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';

describe('PrismaCompanyRepository', () => {
  let repository: PrismaCompanyRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaCompanyRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaCompanyRepository>(PrismaCompanyRepository);
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

  describe('save()', () => {
    it('should save a valid company in the database', async () => {
      const validCNPJ = '11444777000161'; // Valid CNPJ
      await repository.save({
        cnpj: validCNPJ,
        corporateName: 'Test Company Ltda',
        city: 'São Paulo',
        segment: 'Technology',
        registrationStatus: 'ACTIVE',
      });

      const result = await prisma.company.findUnique({
        where: { cnpj: validCNPJ },
      });

      expect(result).toBeTruthy();
      expect(result?.cnpj).toBe(validCNPJ);
      expect(result?.corporateName).toBe('Test Company Ltda');
      expect(result?.city).toBe('São Paulo');
      expect(result?.segment).toBe('Technology');
      expect(result?.registrationStatus).toBe('ACTIVE');
    });

    it('should throw error when saving invalid CNPJ', async () => {
      const invalidCNPJ = '12F345678000195'; // Contains letter 'F'

      await expect(
        repository.save({
          cnpj: invalidCNPJ,
          corporateName: 'Invalid Company',
          city: 'Test',
          segment: 'Test',
          registrationStatus: 'ACTIVE',
        }),
      ).rejects.toThrow('Error creating company');
    });
  });

  describe('findByCnpj()', () => {
    it('should return a company with emails and phones', async () => {
      const validCNPJ = '11444777000161';
      await prisma.company.create({
        data: {
          cnpj: validCNPJ,
          corporateName: 'Test Company',
          city: 'São Paulo',
          segment: 'Technology',
          registrationStatus: 'ACTIVE',
          emails: {
            create: { address: 'contact@test.com', isValid: true },
          },
          phones: {
            create: { number: '11999999999', isValid: false },
          },
        },
      });

      const result = await repository.findByCnpj(validCNPJ);

      expect(result).toBeTruthy();
      expect(result?.cnpj).toBe(validCNPJ);
      expect(result?.emails[0]).toEqual({
        address: 'contact@test.com',
        valid: true,
      });
      expect(result?.phones[0]).toEqual({
        number: '11999999999',
        valid: false,
      });
    });

    it('should return null when company not found', async () => {
      const result = await repository.findByCnpj('99999999000199');
      expect(result).toBeNull();
    });
  });

  describe('addCompanyEmail()', () => {
    it('should add or update a company email', async () => {
      const validCNPJ = '11444777000161';
      await prisma.company.create({
        data: {
          cnpj: validCNPJ,
          corporateName: 'Company',
          city: 'Default City',
          segment: 'Default Segment',
          registrationStatus: 'ACTIVE',
        },
      });

      const email = await repository.addCompanyEmail({
        address: 'new@test.com',
        isValid: true,
        companyCnpj: validCNPJ,
      });

      expect(email).toEqual({
        address: 'new@test.com',
        valid: true,
      });

      // Test update scenario
      const updatedEmail = await repository.addCompanyEmail({
        address: 'new@test.com',
        isValid: false,
        companyCnpj: validCNPJ,
      });

      expect(updatedEmail).toEqual({
        address: 'new@test.com',
        valid: false,
      });
    });

    it('should throw error when company does not exist', async () => {
      await expect(
        repository.addCompanyEmail({
          address: 'test@test.com',
          isValid: true,
          companyCnpj: '99999999000199',
        }),
      ).rejects.toThrow();
    });
  });

  describe('addCompanyPhone()', () => {
    it('should add or update a company phone', async () => {
      const validCNPJ = '11444777000161';
      await prisma.company.create({
        data: {
          cnpj: validCNPJ,
          corporateName: 'Company',
          city: 'Default City',
          segment: 'Default Segment',
          registrationStatus: 'ACTIVE',
        },
      });

      const phone = await repository.addCompanyPhone({
        number: '11888888888',
        isValid: false,
        companyCnpj: validCNPJ,
      });

      expect(phone).toEqual({
        number: '11888888888',
        valid: false,
      });

      // Test update scenario
      const updatedPhone = await repository.addCompanyPhone({
        number: '11888888888',
        isValid: true,
        companyCnpj: validCNPJ,
      });

      expect(updatedPhone).toEqual({
        number: '11888888888',
        valid: true,
      });
    });

    it('should throw error when company does not exist', async () => {
      await expect(
        repository.addCompanyPhone({
          number: '11999999999',
          isValid: true,
          companyCnpj: '99999999000199',
        }),
      ).rejects.toThrow();
    });
  });
});
