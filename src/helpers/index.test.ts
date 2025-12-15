import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../setupTests';
import { submitForm, validateCorporationNumber, type ProfileData } from './index';

const BE_URL = 'https://fe-hometask-api.qa.vault.tryvault.com';

describe('Helpers', () => {
  describe('submitForm', () => {
    it('should successfully submit form data', async () => {
      const mockData: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        corporationNumber: '123456789',
      };

      const result = await submitForm(mockData);

      expect(result.success).toBe(true);
    });

    it('should return success false when response is not ok', async () => {
      server.use(
        http.post(`${BE_URL}/profile-details`, () => {
          return new HttpResponse(null, { status: 400 });
        })
      );

      const mockData: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        corporationNumber: '123456789',
      };

      const result = await submitForm(mockData);

      expect(result.success).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      server.use(
        http.post(`${BE_URL}/profile-details`, () => {
          return HttpResponse.error();
        })
      );

      const mockData: ProfileData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        corporationNumber: '123456789',
      };

      const result = await submitForm(mockData);

      expect(result.success).toBe(false);
    });
  });

  describe('validateCorporationNumber', () => {
    it('should return error message when value is undefined', async () => {
      const result = await validateCorporationNumber(undefined);

      expect(result).toBe('Corporation number is required');
    });

    it('should return error message when value is empty string', async () => {
      const result = await validateCorporationNumber('');

      expect(result).toBe('Corporation number is required');
    });

    it('should return true when corporation number is valid', async () => {
      server.use(
        http.get(`${BE_URL}/corporation-number/123456789`, () => {
          return HttpResponse.json({
            valid: true,
            corporationNumber: '123456789',
          });
        })
      );

      const result = await validateCorporationNumber('123456789');

      expect(result).toBe(true);
    });

    it('should return error message when corporation number is invalid', async () => {
      server.use(
        http.get(`${BE_URL}/corporation-number/999999999`, () => {
          return HttpResponse.json({
            valid: false,
            message: 'Corporation number not found',
          });
        })
      );

      const result = await validateCorporationNumber('999999999');

      expect(result).toBe('Corporation number not found');
    });

    it('should return default error message when validation fails without message', async () => {
      server.use(
        http.get(`${BE_URL}/corporation-number/888888888`, () => {
          return HttpResponse.json({
            valid: false,
          });
        })
      );

      const result = await validateCorporationNumber('888888888');

      expect(result).toBe('Invalid corporation number');
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      server.use(
        http.get(`${BE_URL}/corporation-number/777777777`, () => {
          return HttpResponse.error();
        })
      );

      const result = await validateCorporationNumber('777777777');

      expect(result).toBe('An error occurred while validating the corporation number.');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error validating corporation number:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
