import { Test } from '@nestjs/testing';
import { EmailService, ValidateEmailResponse } from '../../email.service';

const mockedHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockedHttpClient),
}));

describe('EmailService', () => {
  let service: EmailService;

  beforeAll(async () => {
    process.env.EXTERNAL_API_BASE_URL = 'http://localhost:3001';

    const module = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanyEmails', () => {
    it('should return company emails', async () => {
      const mockEmails = ['test@company.com'];
      mockedHttpClient.get.mockResolvedValueOnce({ data: mockEmails });

      const result = await service.getCompanyEmails('11444777000161');

      expect(result).toEqual(mockEmails);
      expect(mockedHttpClient.get).toHaveBeenCalledWith('/emails', {
        params: { cnpj: '11444777000161' },
      });
    });

    it('should throw error when API fails', async () => {
      mockedHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getCompanyEmails('11444777000161')).rejects.toThrow(
        'Failed to fetch company emails',
      );
    });
  });

  describe('validateEmails', () => {
    it('should validate emails', async () => {
      const mockResponse: ValidateEmailResponse[] = [
        { email: 'test@company.com', valid: true },
      ];
      mockedHttpClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.validateEmails(['test@company.com']);

      expect(result).toEqual(mockResponse);
      expect(mockedHttpClient.post).toHaveBeenCalledWith('/emails/validate', [
        'test@company.com',
      ]);
    });

    it('should throw error when validation fails', async () => {
      mockedHttpClient.post.mockRejectedValueOnce(new Error('Timeout'));

      await expect(
        service.validateEmails(['test@company.com']),
      ).rejects.toThrow('Failed to validate emails');
    });
  });
});
