/**
 * Toaster Component - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from './toaster';

describe('Toaster', () => {
  it('renders without errors', () => {
    const { container } = render(<Toaster />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders toast viewport', () => {
    const { container } = render(<Toaster />);

    // ToastViewport should be rendered
    const viewport = container.querySelector('[class*="fixed"]');
    expect(viewport).toBeInTheDocument();
  });

  it('has correct positioning classes', () => {
    const { container } = render(<Toaster />);

    const viewport = container.querySelector('ol');
    expect(viewport).toHaveClass('fixed');
    expect(viewport).toHaveClass('z-[100]');
  });
});
