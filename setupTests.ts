import '@testing-library/jest-dom';

import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const BE_URL = process.env.BE_URL ?? "https://fe-hometask-api.qa.vault.tryvault.com"

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  // ...
];

export const restHandlers = [
  http.get(`${BE_URL}/corporation-number/123456789`, () => {
    return HttpResponse.json(posts);
  }),
  http.post(`${BE_URL}/profile-details`, async ({ request }) => {
    const body = await request.json() as { corporationNumber?: string };
    return HttpResponse.json({ valid: true, corporationNumber: body?.corporationNumber });
  }),
];

export const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen());

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test for test isolation
afterEach(() => server.resetHandlers());
