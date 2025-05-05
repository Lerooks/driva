import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PersistenceModule {
  static forTest(prismaClient: PrismaClient): DynamicModule {
    return {
      module: PersistenceModule,
      providers: [
        {
          provide: PrismaService,
          useFactory: () => prismaClient as PrismaService,
        },
      ],
    };
  }
}
