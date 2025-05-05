import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';
import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { Company } from '~/company/domain/entities/company.entity';
import { Email } from '~/company/domain/value-objects/email';
import { Phone } from '~/company/domain/value-objects/phone';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private prisma: PrismaService) {}

  async findByCnpj(cnpj: string): Promise<Company.Props | null> {
    const company = await this.prisma.company.findUnique({
      where: { cnpj },
      include: {
        phones: true,
        emails: true,
      },
    });

    if (!company) return null;

    return {
      ...company,
      phones: company.phones.map(phone => ({
        number: phone.number,
        valid: !!phone.isValid,
      })),
      emails: company.emails.map(email => ({
        address: email.address,
        valid: !!email.isValid,
      })),
    };
  }

  async save(data: Company.CreateProps): Promise<void> {
    try {
      await this.prisma.company.create({
        data,
      });
    } catch {
      throw new Error('Error creating company');
    }
  }

  async addCompanyEmail(email: {
    address: string;
    isValid: boolean;
    companyCnpj: string;
  }): Promise<Email> {
    const result = await this.prisma.email.upsert({
      where: {
        address_companyCnpj: {
          address: email.address,
          companyCnpj: email.companyCnpj,
        },
      },
      update: {
        isValid: email.isValid,
      },
      create: {
        address: email.address,
        isValid: email.isValid,
        companyCnpj: email.companyCnpj,
      },
    });

    return {
      address: result.address,
      valid: !!result.isValid,
    };
  }

  async addCompanyPhone(phone: {
    number: string;
    isValid: boolean;
    companyCnpj: string;
  }): Promise<Phone> {
    const result = await this.prisma.phone.upsert({
      where: {
        number_companyCnpj: {
          number: phone.number,
          companyCnpj: phone.companyCnpj,
        },
      },
      update: {
        isValid: phone.isValid,
      },
      create: {
        number: phone.number,
        isValid: phone.isValid,
        companyCnpj: phone.companyCnpj,
      },
    });

    return {
      number: result.number,
      valid: !!result.isValid,
    };
  }
}
