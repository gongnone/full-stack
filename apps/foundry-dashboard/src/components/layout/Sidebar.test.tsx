import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouterState } from '@tanstack/react-router';

// Get mocked functions
const mockUseSession = vi.mocked(useSession);
const mockSignOut = vi.mocked(signOut);
const mockUseRouterState = vi.mocked(useRouterState);

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mocks
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      isPending: false,
    } as any);
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/app' },
    } as any);
  });

  describe('navigation items', () => {
    it('[P0] should render all navigation links', () => {
      // GIVEN: Sidebar is rendered
      render(<Sidebar />);

      // THEN: All navigation items are visible
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /hubs/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /review/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /clients/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /brand dna/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('[P0] should link to correct routes', () => {
      // GIVEN: Sidebar is rendered
      render(<Sidebar />);

      // THEN: Links have correct href values
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/app');
      expect(screen.getByRole('link', { name: /hubs/i })).toHaveAttribute('href', '/app/hubs');
      expect(screen.getByRole('link', { name: /review/i })).toHaveAttribute('href', '/app/review');
      expect(screen.getByRole('link', { name: /clients/i })).toHaveAttribute('href', '/app/clients');
      expect(screen.getByRole('link', { name: /brand dna/i })).toHaveAttribute('href', '/app/brand-dna');
      expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('href', '/app/analytics');
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/app/settings');
    });
  });

  describe('active state', () => {
    it('[P1] should highlight Dashboard when on /app', () => {
      // GIVEN: User is on /app route
      mockUseRouterState.mockReturnValue({
        location: { pathname: '/app' },
      } as any);
      render(<Sidebar />);

      // THEN: Dashboard link has active class
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('active');
    });

    it('[P1] should highlight Dashboard when on /app/', () => {
      // GIVEN: User is on /app/ route (with trailing slash)
      mockUseRouterState.mockReturnValue({
        location: { pathname: '/app/' },
      } as any);
      render(<Sidebar />);

      // THEN: Dashboard link has active class
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('active');
    });

    it('[P1] should highlight Hubs when on /app/hubs', () => {
      // GIVEN: User is on /app/hubs route
      mockUseRouterState.mockReturnValue({
        location: { pathname: '/app/hubs' },
      } as any);
      render(<Sidebar />);

      // THEN: Hubs link has active class
      const hubsLink = screen.getByRole('link', { name: /hubs/i });
      expect(hubsLink).toHaveClass('active');
    });

    it('[P1] should highlight Hubs for nested routes like /app/hubs/123', () => {
      // GIVEN: User is on nested hubs route
      mockUseRouterState.mockReturnValue({
        location: { pathname: '/app/hubs/123' },
      } as any);
      render(<Sidebar />);

      // THEN: Hubs link has active class
      const hubsLink = screen.getByRole('link', { name: /hubs/i });
      expect(hubsLink).toHaveClass('active');
    });
  });

  describe('branding', () => {
    it('[P1] should display Foundry logo and name', () => {
      // GIVEN: Sidebar is rendered
      render(<Sidebar />);

      // THEN: Brand name is visible
      expect(screen.getByText('Foundry')).toBeInTheDocument();
    });
  });

  describe('command palette hint', () => {
    it('[P1] should display command palette shortcut', () => {
      // GIVEN: Sidebar is rendered
      render(<Sidebar />);

      // THEN: Command palette hint is visible
      expect(screen.getByText('Command Palette')).toBeInTheDocument();
      expect(screen.getByText('Cmd+K')).toBeInTheDocument();
    });
  });

  describe('user section', () => {
    it('[P0] should display user name from session', () => {
      // GIVEN: Session has user with name
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        isPending: false,
      } as any);
      render(<Sidebar />);

      // THEN: User name is displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('[P0] should display user email from session', () => {
      // GIVEN: Session has user with email
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        isPending: false,
      } as any);
      render(<Sidebar />);

      // THEN: User email is displayed
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('[P1] should display user initial in avatar', () => {
      // GIVEN: Session has user with name starting with J
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        isPending: false,
      } as any);
      render(<Sidebar />);

      // THEN: Avatar shows J
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('[P1] should fallback to email initial if no name', () => {
      // GIVEN: Session has user without name
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            name: null,
            email: 'alex@example.com',
          },
        },
        isPending: false,
      } as any);
      render(<Sidebar />);

      // THEN: Avatar shows A from email
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('[P1] should fallback to "User" if no name in session', () => {
      // GIVEN: Session has user without name
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user-1',
            name: null,
            email: 'user@example.com',
          },
        },
        isPending: false,
      } as any);
      render(<Sidebar />);

      // THEN: "User" is displayed as fallback name
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('sign out', () => {
    it('[P0] should have a sign out button', () => {
      // GIVEN: Sidebar is rendered
      render(<Sidebar />);

      // THEN: Sign out button exists
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('[P0] should call signOut when sign out button is clicked', async () => {
      // GIVEN: User setup and sidebar rendered
      const user = userEvent.setup();
      render(<Sidebar />);

      // WHEN: User clicks sign out button
      await user.click(screen.getByRole('button', { name: /sign out/i }));

      // THEN: signOut is called
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
