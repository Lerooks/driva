import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { GetEnrichmentResults } from '~/enrichment/application/usecases/get-enrichment-results.usecase';
import { GetEnrichmentStatus } from '~/enrichment/application/usecases/get-enrichment-status.usecase';

@Controller('enrichments')
export class EnrichmentController {
  constructor(
    private readonly getEnrichmentStatusUseCase: GetEnrichmentStatus.Usecase,
    private readonly getEnrichmentResultsUseCase: GetEnrichmentResults.Usecase,
  ) {}

  @Get(':jobId')
  async getStatus(@Param('jobId') jobId: string) {
    try {
      const result = await this.getEnrichmentStatusUseCase.execute(jobId);
      return result;
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }

  @Get(':jobId/results')
  async getResults(@Param('jobId') jobId: string) {
    try {
      return await this.getEnrichmentResultsUseCase.execute(jobId);
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException(e.message);
    }
  }
}
