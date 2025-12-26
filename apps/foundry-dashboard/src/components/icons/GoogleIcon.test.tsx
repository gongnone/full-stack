/**
 * GoogleIcon - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoogleIcon } from './GoogleIcon';

describe('GoogleIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct viewBox', () => {
    const { container } = render(<GoogleIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('applies className prop', () => {
    const { container } = render(<GoogleIcon className="test-class" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('test-class');
  });

  it('renders 4 path elements for Google logo', () => {
    const { container } = render(<GoogleIcon />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(4);
  });
});
