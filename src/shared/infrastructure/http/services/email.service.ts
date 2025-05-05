import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ValidateEmailResponse {
  email: string;
  valid: boolean;
}

@Injectable()
export class EmailService {
  private httpClient = axios.create({
    baseURL: process.env.EXTERNAL_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getCompanyEmails(cnpj: string): Promise<string[]> {
    try {
      const response = await this.httpClient.get<string[]>(`/emails`, {
        params: { cnpj },
      });

      return response.data;
    } catch {
      throw new Error('Failed to fetch company emails');
    }
  }

  async validateEmails(emails: string[]): Promise<ValidateEmailResponse[]> {
    try {
      const response = await this.httpClient.post<ValidateEmailResponse[]>(
        `/emails/validate`,
        emails,
      );

      return response.data;
    } catch {
      throw new Error('Failed to validate emails');
    }
  }
}
