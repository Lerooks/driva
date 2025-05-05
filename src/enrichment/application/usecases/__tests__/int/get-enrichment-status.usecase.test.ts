/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { GetEnrichmentStatus } from '../../get-enrichment-status.usecase';
import { UUID } from '~/shared/application/helpers/uuid.helper';

describe('GetEnrichmentStatus - Integration', () => {
  let usecase: GetEnrichmentStatus.Usecase;
  let repository: EnrichmentJobRepository;

  const mockRepository: EnrichmentJobRepository = {
    getStatus: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEnrichmentStatus.Usecase,
        {
          provide: 'EnrichmentJobRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    usecase = module.get(GetEnrichmentStatus.Usecase);
    repository = module.get('EnrichmentJobRepository');
  });

  it('should return enrichment job status', async () => {
    const jobId = UUID.generate();

    const mockData = {
      jobId: jobId,
      status: 'IN_PROGRESS',
      companies: 100,
      completed: 25,
      failed: 10,
      pending: 65,
      lastUpdate: '2025-05-05T12:00:00Z',
    };

    jest.spyOn(repository, 'getStatus').mockResolvedValueOnce(mockData);

    const result = await usecase.execute(jobId);

    expect(result).toEqual({
      jobId: jobId,
      status: 'IN_PROGRESS',
      progress: 0.25,
      totals: {
        companies: 100,
        completed: 25,
        failed: 10,
        pending: 65,
      },
      lastUpdate: '2025-05-05T12:00:00Z',
    });

    expect(repository.getStatus).toHaveBeenCalledWith(jobId);
  });

  it('should throw error if job is not found', async () => {
    jest.spyOn(repository, 'getStatus').mockResolvedValueOnce(null);

    await expect(usecase.execute('nonexistent-job')).rejects.toThrow(
      'Enrichment job not found',
    );
  });
});
