/**
 * Billing Module - Company Settings Services Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '@/lib/axiosClient';
import { companySettingsService } from '../../services';
import {
  createMockCompanySetting,
  createMockCompanySettings,
  createMockAPICollectionResponse,
  createMockAxiosError,
} from '../utils/test-utils';

// Mock axios client
vi.mock('@/lib/axiosClient');

// Mock transformers
vi.mock('../../utils/transformers', () => ({
  transformCompanySettingsResponse: vi.fn((data) => data),
  transformJsonApiCompanySetting: vi.fn((data) => data),
  transformCompanySettingFormToJsonApi: vi.fn((data) => ({
    type: 'company_settings',
    attributes: data,
  })),
}));

describe('Company Settings Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('getAll', () => {
    it('should fetch all company settings', async () => {
      // Arrange
      const mockSettings = createMockCompanySettings(2);
      const mockResponse = createMockAPICollectionResponse(
        mockSettings.map(setting => ({
          id: setting.id,
          attributes: {
            company_name: setting.companyName,
            rfc: setting.rfc,
            is_active: setting.isActive,
          },
        })),
        'company_settings'
      );
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.getAll();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/company-settings');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getById', () => {
    it('should fetch single company setting by ID', async () => {
      // Arrange
      const mockSetting = createMockCompanySetting();
      const mockResponse = { data: mockSetting };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.getById('1');

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith('/company-settings/1');
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getActive', () => {
    it('should fetch active company setting', async () => {
      // Arrange
      const mockSetting = createMockCompanySetting({ isActive: true });
      const mockResponse = {
        data: [mockSetting],
      };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.getActive();

      // Assert
      expect(axiosClient.get).toHaveBeenCalledWith(
        '/company-settings?filter[isActive]=true'
      );
      expect(result).toEqual(mockSetting);
    });

    it('should return null when no active setting exists', async () => {
      // Arrange
      const mockResponse = { data: [] };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.getActive();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new company setting', async () => {
      // Arrange
      const mockSetting = createMockCompanySetting();
      const mockResponse = { data: mockSetting };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      const formData = {
        companyName: 'Test Company SA de CV',
        rfc: 'XAXX010101000',
        taxRegime: '601',
        postalCode: '12345',
        invoiceSeries: 'A',
        creditNoteSeries: 'NC',
        nextInvoiceFolio: 1,
        nextCreditNoteFolio: 1,
        pacProvider: 'sw',
        pacUsername: 'test@example.com',
        pacPassword: 'password123',
        pacProductionMode: false,
        certificateFile: '/path/to/cert.cer',
        keyFile: '/path/to/key.key',
        isActive: true,
      };

      // Act
      const result = await companySettingsService.create(formData);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/company-settings',
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'company_settings',
          }),
        })
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('update', () => {
    it('should update company setting', async () => {
      // Arrange
      const mockSetting = createMockCompanySetting();
      const mockResponse = { data: mockSetting };
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: mockResponse });

      const formData = {
        companyName: 'Updated Company SA de CV',
        rfc: 'XAXX010101000',
        taxRegime: '601',
        postalCode: '12345',
        invoiceSeries: 'A',
        creditNoteSeries: 'NC',
        nextInvoiceFolio: 1,
        nextCreditNoteFolio: 1,
        pacProvider: 'sw',
        pacUsername: 'updated@example.com',
        pacPassword: 'newpassword',
        pacProductionMode: false,
        certificateFile: '/path/to/cert.cer',
        keyFile: '/path/to/key.key',
        isActive: true,
      };

      // Act
      const result = await companySettingsService.update('1', formData);

      // Assert
      expect(axiosClient.patch).toHaveBeenCalledWith(
        '/company-settings/1',
        expect.any(Object)
      );
      expect(result).toEqual(mockSetting);
    });
  });

  describe('delete', () => {
    it('should delete company setting', async () => {
      // Arrange
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: null });

      // Act
      await companySettingsService.delete('1');

      // Assert
      expect(axiosClient.delete).toHaveBeenCalledWith('/company-settings/1');
    });
  });

  // ==========================================================================
  // SPECIAL OPERATIONS
  // ==========================================================================

  describe('testPACConnection', () => {
    it('should test PAC connection successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Connection successful',
      };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.testPACConnection('1');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith('/company-settings/1/test-pac');
      expect(result).toEqual(mockResponse);
    });

    it('should handle PAC connection failure', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        message: 'Connection failed',
      };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.testPACConnection('1');

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('uploadCertificate', () => {
    it('should upload certificate file', async () => {
      // Arrange
      const mockFile = new File(['cert content'], 'certificate.cer', {
        type: 'application/x-x509-ca-cert',
      });
      const mockResponse = { success: true };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.uploadCertificate('1', mockFile);

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/company-settings/1/upload-certificate',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadKey', () => {
    it('should upload key file with password', async () => {
      // Arrange
      const mockFile = new File(['key content'], 'key.key', {
        type: 'application/octet-stream',
      });
      const mockResponse = { success: true };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await companySettingsService.uploadKey('1', mockFile, 'password123');

      // Assert
      expect(axiosClient.post).toHaveBeenCalledWith(
        '/company-settings/1/upload-key',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  describe('error handling', () => {
    it('should handle errors when fetching settings', async () => {
      // Arrange
      const error = createMockAxiosError(500, 'Server Error');
      vi.mocked(axiosClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(companySettingsService.getAll()).rejects.toThrow();
    });

    it('should handle errors when testing PAC', async () => {
      // Arrange
      const error = createMockAxiosError(401, 'Unauthorized');
      vi.mocked(axiosClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(companySettingsService.testPACConnection('1')).rejects.toThrow();
    });
  });
});
