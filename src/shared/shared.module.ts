import { Module } from '@nestjs/common';
import { EmailService } from './infrastructure/http/services/email.service';
import { PhoneService } from './infrastructure/http/services/phone.service';

@Module({
  imports: [],
  providers: [EmailService, PhoneService],
  exports: [EmailService, PhoneService],
})
export class SharedModule {}
