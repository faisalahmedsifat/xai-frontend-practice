import { NextRouter } from 'next/router';

/**
 * Mock implementation of Next.js router for testing
 */
export function mockRouter(routerOverrides: Partial<NextRouter> = {}) {
  const useRouter = jest.requireMock('next/router').useRouter;
  
  const defaultRouter: Partial<NextRouter> = {
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isReady: true,
    isPreview: false,
  };
  
  useRouter.mockImplementation(() => ({
    ...defaultRouter,
    ...routerOverrides
  }));
  
  return useRouter;
} 