import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '~/shared/infrastructure/http/services/email.service';
import { PhoneService } from '~/shared/infrastructure/http/services/phone.service';
import { SharedModule } from '~/shared/shared.module';

describe('SharedModule', () => {
  let emailService: EmailService;
  let phoneService: PhoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    phoneService = module.get<PhoneService>(PhoneService);
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
    expect(phoneService).toBeDefined();
  });

  it('should inject EmailService and PhoneService', () => {
    expect(emailService).not.toBeNull();
    expect(phoneService).not.toBeNull();
  });
});
