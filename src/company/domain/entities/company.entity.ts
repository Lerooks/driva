import { Email } from '~/company/domain/value-objects/email';
import { Phone } from '~/company/domain/value-objects/phone';

export type RegistrationStatus = 'ACTIVE' | 'INACTIVE';

export namespace Company {
  export interface CreateProps {
    cnpj: string;
    corporateName: string;
    city: string;
    segment: string;
    registrationStatus: RegistrationStatus;
  }

  export interface Props {
    cnpj: string;
    corporateName: string;
    city: string;
    segment: string;
    registrationStatus: RegistrationStatus;
    updatedAt: Date;
    phones: Phone[];
    emails: Email[];
  }
}
