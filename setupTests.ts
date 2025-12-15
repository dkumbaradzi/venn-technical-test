import '@testing-library/jest-dom';

import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const BE_URL = "https://fe-hometask-api.qa.vault.tryvault.com"

export const restHandlers = [
  http.get(`${BE_URL}/corporation-number/123456789`, () => {
    return HttpResponse.json({
      corporationNumber: '123456789',
      valid: true,
    });
  }),
  http.post(`${BE_URL}/profile-details`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
];

export const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen());

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
