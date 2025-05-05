import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ValidatePhoneResponse {
  phone: string;
  valid: boolean;
}

@Injectable()
export class PhoneService {
  private httpClient = axios.create({
    baseURL: process.env.EXTERNAL_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getCompanyPhones(cnpj: string): Promise<string[]> {
    try {
      const response = await this.httpClient.get<string[]>(`/phones`, {
        params: { cnpj },
      });

      return response.data;
    } catch {
      throw new Error('Failed to fetch company phones');
    }
  }

  async validatePhones(phones: string[]): Promise<ValidatePhoneResponse[]> {
    try {
      const response = await this.httpClient.post<ValidatePhoneResponse[]>(
        `/phones/validate`,
        phones,
      );

      return response.data;
    } catch {
      throw new Error('Failed to validate phones');
    }
  }
}
