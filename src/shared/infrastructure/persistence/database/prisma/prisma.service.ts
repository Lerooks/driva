import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    await this.$transaction([
      this.enrichmentCompany.deleteMany(),
      this.email.deleteMany(),
      this.phone.deleteMany(),
      this.company.deleteMany(),
      this.enrichment.deleteMany(),
    ]);
  }
}
