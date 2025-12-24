import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver for Radix UI components (must be a class constructor)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as any).ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver (must be a class constructor)
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = vi.fn(() => []);
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock auth client module
vi.mock('@/lib/auth-client', () => ({
  signIn: {
    social: vi.fn(),
    email: vi.fn(),
  },
  signOut: vi.fn(),
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    isPending: false,
  })),
}));

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
  useRouterState: vi.fn(() => ({
    location: { pathname: '/app' },
  })),
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({})),
  useSearch: vi.fn(() => ({})),
}));

// Mock tRPC client
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    useUtils: vi.fn(() => ({
      invalidate: vi.fn(),
      auth: { me: { invalidate: vi.fn() } },
    })),
    clients: {
      list: {
        useQuery: vi.fn(() => ({
          data: {
            items: [
              { id: 'client-1', name: 'Acme Corp', brandColor: '#3B82F6' },
              { id: 'client-2', name: 'Tech Startup', brandColor: '#10B981' },
            ],
          },
          isLoading: false,
        })),
      },
      switch: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          isPending: false,
        })),
      },
    },
    auth: {
      me: { useQuery: vi.fn() },
    },
  },
}));

// Mock useClientId hook
vi.mock('@/lib/use-client-id', () => ({
  useClientId: vi.fn(() => 'client-1'),
}));
