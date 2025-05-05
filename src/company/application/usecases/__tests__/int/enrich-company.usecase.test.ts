/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { EnrichCompany } from '~/company/application/usecases/enrich-company.usecase';
import { EmailService } from '~/shared/infrastructure/http/services/email.service';
import { PhoneService } from '~/shared/infrastructure/http/services/phone.service';
import { EnrichmentJobRepository } from '~/enrichment/domain/repositories/enrichment-job.repository';
import { CompanyRepository } from '~/company/domain/repositories/company.repository';
import { EnrichCompanyCommand } from '~/company/application/commands/enrich-company.command';
import { UUID } from '~/shared/application/helpers/uuid.helper';
import { EnrichmentJobStatus } from '~/enrichment/domain/entities/enrichment-job.entity';

describe('EnrichCompany.Usecase', () => {
  let usecase: EnrichCompany.Usecase;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let enrichmentJobRepository: jest.Mocked<EnrichmentJobRepository>;
  let emailService: jest.Mocked<EmailService>;
  let phoneService: jest.Mocked<PhoneService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EnrichCompany.Usecase,
        {
          provide: 'CompanyRepository',
          useValue: {
            addCompanyEmail: jest.fn(),
            addCompanyPhone: jest.fn(),
          },
        },
        {
          provide: 'EnrichmentJobRepository',
          useValue: {
            updateEnrichmentCompanyStatus: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            getCompanyEmails: jest
              .fn()
              .mockResolvedValue([{ email: 'test@email.com' }]),
            validateEmails: jest
              .fn()
              .mockResolvedValue([{ email: 'test@email.com', valid: true }]),
          },
        },
        {
          provide: PhoneService,
          useValue: {
            getCompanyPhones: jest
              .fn()
              .mockResolvedValue([{ phone: '123456789' }]),
            validatePhones: jest
              .fn()
              .mockResolvedValue([{ phone: '123456789', valid: true }]),
          },
        },
      ],
    }).compile();

    usecase = moduleRef.get(EnrichCompany.Usecase);
    companyRepository = moduleRef.get('CompanyRepository');
    enrichmentJobRepository = moduleRef.get('EnrichmentJobRepository');
    emailService = moduleRef.get(EmailService);
    phoneService = moduleRef.get(PhoneService);
  });

  it('should enrich company with emails and phones and update job status', async () => {
    const jobId = UUID.generate();

    const command: EnrichCompanyCommand = {
      jobId: jobId,
      cnpj: '12345678000100',
    };

    await usecase.execute(command);

    expect(
      enrichmentJobRepository.updateEnrichmentCompanyStatus,
    ).toHaveBeenCalledWith({
      jobId: jobId,
      companyCnpj: '12345678000100',
      status: EnrichmentJobStatus.IN_PROGRESS,
    });

    expect(emailService.getCompanyEmails).toHaveBeenCalledWith(
      '12345678000100',
    );

    expect(emailService.validateEmails).toHaveBeenCalled();

    expect(companyRepository.addCompanyEmail).toHaveBeenCalledWith({
      address: 'test@email.com',
      isValid: true,
      companyCnpj: '12345678000100',
    });

    expect(phoneService.getCompanyPhones).toHaveBeenCalledWith(
      '12345678000100',
    );

    expect(phoneService.validatePhones).toHaveBeenCalled();

    expect(companyRepository.addCompanyPhone).toHaveBeenCalledWith({
      number: '123456789',
      isValid: true,
      companyCnpj: '12345678000100',
    });

    expect(
      enrichmentJobRepository.updateEnrichmentCompanyStatus,
    ).toHaveBeenCalledWith({
      jobId: jobId,
      companyCnpj: '12345678000100',
      status: EnrichmentJobStatus.COMPLETED,
    });

    expect(enrichmentJobRepository.updateStatus).toHaveBeenCalledWith({
      jobId: jobId,
      status: EnrichmentJobStatus.COMPLETED,
      completedAt: expect.any(Date),
    });
  });

  it('should mark job as FAILED if an error occurs', async () => {
    emailService.getCompanyEmails.mockRejectedValueOnce(new Error('Fail'));

    const jobId = UUID.generate();

    const command: EnrichCompanyCommand = {
      jobId: jobId,
      cnpj: '12345678000100',
    };

    await usecase.execute(command);

    expect(
      enrichmentJobRepository.updateEnrichmentCompanyStatus,
    ).toHaveBeenCalledWith({
      jobId: jobId,
      companyCnpj: '12345678000100',
      status: EnrichmentJobStatus.FAILED,
    });
  });
});
