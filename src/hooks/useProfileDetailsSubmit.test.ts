import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server, BE_URL } from '../../setupTests';
import { useProfileDetailsSubmit } from './useProfileDetailsSubmit';
import type { ProfileData } from '../helpers/index';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useProfileDetailsSubmit', () => {
  it('should call toast.success when form submission is successful', async () => {
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      corporationNumber: '123456789',
    };

    const { result } = renderHook(() => useProfileDetailsSubmit());

    await waitFor(async () => {
      await result.current.onSubmit(mockData);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Form submitted successfully!');
    });
  });

  it('should call toast.error when form submission fails with non-ok response', async () => {
    server.use(
      http.post(`${BE_URL}/profile-details`, () => {
        return new HttpResponse(null, { status: 400 });
      })
    );

    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      corporationNumber: '123456789',
    };

    const { result } = renderHook(() => useProfileDetailsSubmit());

    await waitFor(async () => {
      await result.current.onSubmit(mockData);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error submitting form');
    });
  });

  it('should call toast.error when network error occurs', async () => {
    server.use(
      http.post(`${BE_URL}/profile-details`, () => {
        return HttpResponse.error();
      })
    );

    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      corporationNumber: '123456789',
    };

    const { result } = renderHook(() => useProfileDetailsSubmit());

    await waitFor(async () => {
      await result.current.onSubmit(mockData);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error submitting form');
    });
  });

  it('should submit correct data to the API', async () => {
    let receivedData: ProfileData | undefined;

    server.use(
      http.post(`${BE_URL}/profile-details`, async ({ request }) => {
        receivedData = await request.json() as ProfileData;
        return HttpResponse.json(null, { status: 200 });
      })
    );

    const mockData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+9876543210',
      corporationNumber: '987654321',
    };

    const { result } = renderHook(() => useProfileDetailsSubmit());

    await waitFor(async () => {
      await result.current.onSubmit(mockData);
    });

    await waitFor(() => {
      expect(receivedData).toEqual(mockData);
    });
  });
});
