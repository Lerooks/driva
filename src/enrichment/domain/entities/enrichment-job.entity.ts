export enum EnrichmentJobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export namespace EnrichmentJob {
  export interface Props {
    id: string;
    jobId: string;
    status: EnrichmentJobStatus;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export type CreateProps = Pick<Props, 'jobId' | 'status' | 'completedAt'>;
}
