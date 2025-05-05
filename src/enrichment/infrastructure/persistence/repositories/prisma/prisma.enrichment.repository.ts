import { Injectable } from '@nestjs/common';
import { Company } from '~/company/domain/entities/company.entity';

import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';
import {
  CreateProps,
  EnrichmentJobRepository,
} from '~/enrichment/domain/repositories/enrichment-job.repository';
import { PrismaService } from '~/shared/infrastructure/persistence/database/prisma/prisma.service';

@Injectable()
export class PrismaEnrichmentJobRepository implements EnrichmentJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(job: CreateProps): Promise<{ jobId: string }> {
    await this.prisma.enrichment.create({
      data: {
        jobId: job.jobId,
        status: job.status,
        completedAt: job.completedAt || null,
        enrichmentCompanies: {
          createMany: {
            data: job.cnpjs.map(cnpj => ({
              companyCnpj: cnpj,
              status: 'PENDING',
            })),
          },
        },
      },
    });

    return { jobId: job.jobId };
  }

  async getStatus(jobId: string): Promise<{
    jobId: string;
    status: string;
    companies: number;
    completed: number;
    failed: number;
    pending: number;
    lastUpdate: string;
  } | null> {
    const result = await this.prisma.$queryRawUnsafe<
      Array<{
        jobId: string;
        status: string;
        companies: number;
        completed: number;
        failed: number;
        pending: number;
        lastUpdate: string;
      }>
    >(
      `
    SELECT
      ej."jobId" AS "jobId",
      ej.status,
      COUNT(ec.id) AS companies,
      SUM(CASE WHEN ec.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN ec.status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN ec.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
      ec."updatedAt" AS "lastUpdate"
    FROM enrichments ej
    LEFT JOIN enrichment_companies ec ON ec."enrichmentId" = ej.id
    WHERE ej."jobId" = $1::uuid
    GROUP BY ej."id", ej.status, ec."updatedAt"
    `,
      jobId,
    );

    if (result.length === 0) return null;

    const row = result[0];

    return {
      jobId: row.jobId,
      status: row.status,
      companies: Number(row.companies),
      completed: Number(row.completed),
      failed: Number(row.failed),
      pending: Number(row.pending),
      lastUpdate: row.lastUpdate,
    };
  }

  async getResults(jobId: string): Promise<{
    jobId: string;
    createdAt: string;
    completedAt: string | null;
    totals: {
      companies: number;
      completed: number;
      failed: number;
    };
    items: Company.Props[];
  }> {
    const enrichment = await this.prisma.enrichment.findFirst({
      where: { jobId },
      include: {
        enrichmentCompanies: {
          include: {
            company: {
              include: {
                phones: true,
                emails: true,
              },
            },
          },
        },
      },
    });

    if (!enrichment) {
      throw new Error(`Enrichment job with jobId ${jobId} not found.`);
    }

    return {
      jobId: enrichment.jobId,
      completedAt: enrichment.completedAt?.toISOString() || null,
      createdAt: enrichment.createdAt.toISOString(),
      totals: {
        companies: enrichment.enrichmentCompanies.length,
        completed: enrichment.enrichmentCompanies.filter(
          company => company.status === 'COMPLETED',
        ).length,
        failed: enrichment.enrichmentCompanies.filter(
          company => company.status === 'FAILED',
        ).length,
      },
      items: enrichment.enrichmentCompanies.map(ec => {
        const company = ec.company;

        return {
          cnpj: company.cnpj,
          corporateName: company.corporateName,
          city: company.city,
          segment: company.segment,
          registrationStatus: company.registrationStatus,
          updatedAt: new Date(company.updatedAt),
          phones: company.phones.map(p => ({
            number: p.number,
            valid: !!p.isValid,
          })),
          emails: company.emails.map(e => ({
            address: e.address,
            valid: !!e.isValid,
          })),
        };
      }),
    };
  }

  async updateStatus({
    jobId,
    status,
    completedAt,
  }: {
    jobId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    completedAt: Date | null;
  }): Promise<void> {
    await this.prisma.enrichment.updateMany({
      where: { jobId },
      data: { status, completedAt },
    });
  }

  async updateEnrichmentCompanyStatus(params: {
    jobId: string;
    companyCnpj: string;
    status: EnrichmentJobStatus;
  }): Promise<void> {
    const { jobId, companyCnpj, status } = params;

    await this.prisma.enrichmentCompany.updateMany({
      where: {
        companyCnpj,
        enrichment: {
          jobId,
        },
      },
      data: {
        status,
      },
    });
  }
}
