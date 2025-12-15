import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../setupTests';
import { useCorporationNumberValidation } from './useCorporationNumberValidation';

const BE_URL = 'https://fe-hometask-api.qa.vault.tryvault.com';

describe('useCorporationNumberValidation', () => {
  it('should initialize with isValid as false', async () => {
    const { result } = renderHook(() => useCorporationNumberValidation());

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
    });
  });

  it('should return error message when value is undefined', async () => {
    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult: boolean | string;
    await waitFor(async () => {
      validationResult = await result.current.validate(undefined);
    });

    await waitFor(() => {
      expect(validationResult).toBe('Corporation number is required');
    });
  });

  it('should return error message when value is empty string', async () => {
    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult: boolean | string;
    await waitFor(async () => {
      validationResult = await result.current.validate('');
    });

    await waitFor(() => {
      expect(validationResult).toBe('Corporation number is required');
    });
  });


  it('should return error message when value is less than 9 characters', async () => {
    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult: boolean | string;
    await waitFor(async () => {
      validationResult = await result.current.validate('12345678');
    });

    await waitFor(() => {
      expect(validationResult).toBe('Invalid corporation number');
    });
  });

  it('should validate successfully with valid corporation number', async () => {
    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        return HttpResponse.json({
          valid: true,
          corporationNumber: '123456789',
        });
      })
    );

    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult;
    await waitFor(async () => {
      validationResult = await result.current.validate('123456789');
    });

    expect(validationResult).toBe(true);
    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });
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

    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult;
    await waitFor(async () => {
      validationResult = await result.current.validate('999999999');
    });

    expect(validationResult).toBe('Corporation number not found');
    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
    });
  });

  it('should skip API call and return true if already valid', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        consoleLogSpy('API called');
        return HttpResponse.json({
          valid: true,
          corporationNumber: '123456789',
        });
      })
    );

    const { result } = renderHook(() => useCorporationNumberValidation());

    // First validation - should call API
    await waitFor(async () => {
      await result.current.validate('123456789');
    });

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });

    // Second validation - should skip API call
    let secondValidation;
    await waitFor(async () => {
      secondValidation = await result.current.validate('123456789');
    });

    expect(secondValidation).toBe(true);
    // Verify API was only called once (during first validation)
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    consoleLogSpy.mockRestore();
  });

  it('should reset isValid to false when onCorporationNumberChange is called', async () => {
    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        return HttpResponse.json({
          valid: true,
          corporationNumber: '123456789',
        });
      })
    );

    const { result } = renderHook(() => useCorporationNumberValidation());

    // Validate to set isValid to true
    await waitFor(() => {
      result.current.validate('123456789');
    });

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
    });

    // Call onCorporationNumberChange
    await waitFor(() => {
      result.current.onCorporationNumberChange();
    })

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
    });
  });

  it('should call API again after onCorporationNumberChange resets isValid', async () => {
    let apiCallCount = 0;

    server.use(
      http.get(`${BE_URL}/corporation-number/123456789`, () => {
        apiCallCount++;
        return HttpResponse.json({
          valid: true,
          corporationNumber: '123456789',
        });
      })
    );

    const { result } = renderHook(() => useCorporationNumberValidation());

    // First validation
    await waitFor(async () => {
      await result.current.validate('123456789');
    });
    await waitFor(() => expect(result.current.isValid).toBe(true));
    await waitFor(() => {
      expect(apiCallCount).toBe(1);
    });

    // Reset state
    await waitFor(() => {
      result.current.onCorporationNumberChange();
    });
    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
    });

    // Second validation - should call API again since isValid was reset
    await waitFor(async () => {
      await result.current.validate('123456789');
    });
    await waitFor(() => expect(result.current.isValid).toBe(true));
    await waitFor(() => {
      expect(apiCallCount).toBe(2);
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    server.use(
      http.get(`${BE_URL}/corporation-number/777777777`, () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useCorporationNumberValidation());

    let validationResult;
    await waitFor(async () => {
      validationResult = await result.current.validate('777777777');
    });

    expect(validationResult).toBe('An error occurred while validating the corporation number.');
    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
    });

    consoleErrorSpy.mockRestore();
  });
});
