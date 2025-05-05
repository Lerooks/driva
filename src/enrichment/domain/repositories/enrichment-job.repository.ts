import { Company } from '~/company/domain/entities/company.entity';
import {
  EnrichmentJob,
  EnrichmentJobStatus,
} from '~/enrichment/domain/entities/enrichment-job.entity';

export interface CreateProps extends EnrichmentJob.CreateProps {
  cnpjs: string[];
}

export interface EnrichmentJobRepository {
  create(job: CreateProps): Promise<{ jobId: string }>;
  getStatus(jobId: string): Promise<{
    jobId: string;
    status: string;
    companies: number;
    completed: number;
    failed: number;
    pending: number;
    lastUpdate: string;
  } | null>;
  getResults(jobId: string): Promise<{
    jobId: string;
    createdAt: string;
    completedAt: string | null;
    totals: {
      companies: number;
      completed: number;
      failed: number;
    };
    items: Company.Props[];
  }>;
  updateStatus(params: {
    jobId: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    completedAt: Date;
  }): Promise<void>;
  updateEnrichmentCompanyStatus(params: {
    jobId: string;
    companyCnpj: string;
    status: EnrichmentJobStatus;
  }): Promise<void>;
}
