import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
if (typeof (globalThis as any).window === 'undefined') {
  const { fetch, Request, Response, Headers } = require('undici');
  (globalThis as any).fetch = fetch;
  (globalThis as any).Request = Request;
  (globalThis as any).Response = Response;
  (globalThis as any).Headers = Headers;
} else {
  (globalThis as any).ResizeObserver =
    (globalThis as any).ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
}

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

jest.mock('next/headers', () => ({
  headers: jest.fn(() => new Headers()),
}));

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Warning:')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Warning:')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.DAILY_BUDGET_LIMIT = '10';
process.env.RATE_LIMIT_PER_IP = '10';
process.env.MAX_PROMPT_LENGTH = '1000';
process.env.API_TIMEOUT_SECONDS = '15';
process.env.ARENA_MVP_V2 = 'true';

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}
