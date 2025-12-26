/**
 * Alert Component - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders with default variant', () => {
      render(<Alert>Test content</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Test content');
    });

    it('renders with destructive variant', () => {
      render(<Alert variant="destructive">Error content</Alert>);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50');
      expect(alert).toHaveClass('text-destructive');
    });

    it('applies custom className', () => {
      render(<Alert className="custom-class">Content</Alert>);

      expect(screen.getByRole('alert')).toHaveClass('custom-class');
    });

    it('passes additional props', () => {
      render(<Alert data-testid="custom-alert">Content</Alert>);

      expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
    });
  });
});

describe('AlertTitle', () => {
  it('renders title text', () => {
    render(<AlertTitle>Alert Title</AlertTitle>);

    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders as h5 element', () => {
    render(<AlertTitle>Title</AlertTitle>);

    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H5');
  });

  it('applies custom className', () => {
    render(<AlertTitle className="mt-2">Title</AlertTitle>);

    expect(screen.getByText('Title')).toHaveClass('mt-2');
  });

  it('has correct default styling', () => {
    render(<AlertTitle>Title</AlertTitle>);

    expect(screen.getByText('Title')).toHaveClass('font-medium');
  });
});

describe('AlertDescription', () => {
  it('renders description text', () => {
    render(<AlertDescription>This is a description</AlertDescription>);

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders as div element', () => {
    const { container } = render(<AlertDescription>Description</AlertDescription>);

    expect(container.querySelector('div')).toHaveTextContent('Description');
  });

  it('applies custom className', () => {
    render(<AlertDescription className="text-red-500">Description</AlertDescription>);

    expect(screen.getByText('Description')).toHaveClass('text-red-500');
  });

  it('has correct default styling', () => {
    render(<AlertDescription>Description</AlertDescription>);

    expect(screen.getByText('Description')).toHaveClass('text-sm');
  });
});

describe('Alert Composition', () => {
  it('renders Alert with Title and Description', () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning message</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('This is a warning message')).toBeInTheDocument();
  });

  it('renders destructive Alert with icon', () => {
    render(
      <Alert variant="destructive">
        <svg data-testid="error-icon" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
