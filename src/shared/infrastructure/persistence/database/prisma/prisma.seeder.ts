import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.enrichmentCompany.deleteMany();
  await prisma.enrichment.deleteMany();
  await prisma.email.deleteMany();
  await prisma.phone.deleteMany();
  await prisma.company.deleteMany();

  // Seed companies
  const companies: {
    cnpj: string;
    corporateName: string;
    city: string;
    segment: string;
    registrationStatus: string;
  }[] = [];

  for (let i = 0; i < 10; i++) {
    const cnpj = faker.string.numeric(14);
    const company = await prisma.company.create({
      data: {
        cnpj,
        corporateName: faker.company.name(),
        city: faker.location.city(),
        segment: faker.commerce.department(),
        registrationStatus: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']),
      },
    });

    // Add emails
    for (let j = 0; j < 2; j++) {
      await prisma.email.create({
        data: {
          address: faker.internet.email(),
          isValid: faker.datatype.boolean(),
          companyCnpj: cnpj,
        },
      });
    }

    // Add phones
    for (let j = 0; j < 2; j++) {
      await prisma.phone.create({
        data: {
          number: faker.phone.number(),
          isValid: faker.datatype.boolean(),
          companyCnpj: cnpj,
        },
      });
    }

    companies.push(company);
  }

  // Seed enrichment jobs
  for (let i = 0; i < 3; i++) {
    const enrichment = await prisma.enrichment.create({
      data: {
        jobId: faker.string.uuid(),
        status: 'PENDING',
        completedAt: null,
      },
    });

    // Link to random companies
    for (const company of faker.helpers.arrayElements(companies, 5)) {
      await prisma.enrichmentCompany.create({
        data: {
          enrichmentId: enrichment.id,
          companyCnpj: company.cnpj,
          status: 'PENDING',
        },
      });
    }
  }

  console.log('Seed completed');
}

void (async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
