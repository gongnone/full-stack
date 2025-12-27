/**
 * GitHubIcon - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GitHubIcon } from './GitHubIcon';

describe('GitHubIcon', () => {
  it('renders SVG element', () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct viewBox', () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('applies className prop', () => {
    const { container } = render(<GitHubIcon className="custom-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-icon');
  });

  it('renders single path element', () => {
    const { container } = render(<GitHubIcon />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(1);
  });

  it('uses currentColor for fill', () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });
});
