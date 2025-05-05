import { Test } from '@nestjs/testing';
import { PhoneService, ValidatePhoneResponse } from '../../phone.service';

const mockedHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockedHttpClient),
}));

describe('PhoneService', () => {
  let service: PhoneService;

  beforeAll(async () => {
    process.env.EXTERNAL_API_BASE_URL = 'http://localhost:3001';

    const module = await Test.createTestingModule({
      providers: [PhoneService],
    }).compile();

    service = module.get<PhoneService>(PhoneService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanyPhones', () => {
    it('should return company phones', async () => {
      const mockPhones = ['123456789'];
      mockedHttpClient.get.mockResolvedValueOnce({ data: mockPhones });

      const result = await service.getCompanyPhones('11444777000161');

      expect(result).toEqual(mockPhones);
      expect(mockedHttpClient.get).toHaveBeenCalledWith('/phones', {
        params: { cnpj: '11444777000161' },
      });
    });

    it('should throw error when API fails', async () => {
      mockedHttpClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getCompanyPhones('11444777000161')).rejects.toThrow(
        'Failed to fetch company phones',
      );
    });
  });

  describe('validatePhones', () => {
    it('should validate phones', async () => {
      const mockResponse: ValidatePhoneResponse[] = [
        { phone: '123456789', valid: true },
      ];
      mockedHttpClient.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.validatePhones(['123456789']);

      expect(result).toEqual(mockResponse);
      expect(mockedHttpClient.post).toHaveBeenCalledWith('/phones/validate', [
        '123456789',
      ]);
    });

    it('should throw error when validation fails', async () => {
      mockedHttpClient.post.mockRejectedValueOnce(new Error('Timeout'));

      await expect(service.validatePhones(['123456789'])).rejects.toThrow(
        'Failed to validate phones',
      );
    });
  });
});
