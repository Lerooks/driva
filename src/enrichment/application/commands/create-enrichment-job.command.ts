import { ZodError } from 'zod';
import {
  EnrichmentJob,
  EnrichmentJobStatus,
} from '~/enrichment/domain/entities/enrichment-job.entity';
import { CreateEnrichmentJobCommandSchema } from '~/enrichment/application/validators/create-enrichment-job-command.schema';

interface CommandProps extends EnrichmentJob.CreateProps {
  status: EnrichmentJobStatus.PENDING | EnrichmentJobStatus.IN_PROGRESS;
  cnpjs: string[];
}

export class CreateEnrichmentJobCommand implements CommandProps {
  jobId: string;
  status: EnrichmentJobStatus.PENDING | EnrichmentJobStatus.IN_PROGRESS;
  completedAt: Date | null;
  cnpjs: string[];

  constructor(props: CommandProps) {
    this.jobId = props.jobId;
    this.status = props.status;
    this.completedAt = props.completedAt;
    this.cnpjs = props.cnpjs;
  }

  static fromObject(data: unknown): CreateEnrichmentJobCommand {
    try {
      const parsed = CreateEnrichmentJobCommandSchema.parse(data);
      return new CreateEnrichmentJobCommand(parsed);
    } catch (e) {
      const error = e as ZodError;
      const message = error.issues
        .map(issue => `• ${issue.path.join('.')} - ${issue.message}`)
        .join(' ');
      throw new Error(`Validation error: ${message}`);
    }
  }
}
