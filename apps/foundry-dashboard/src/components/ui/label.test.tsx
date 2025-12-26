/**
 * Label Component - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders label text', () => {
    render(<Label>Email</Label>);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders as label element', () => {
    render(<Label>Username</Label>);

    const label = screen.getByText('Username');
    expect(label.tagName).toBe('LABEL');
  });

  it('applies custom className', () => {
    render(<Label className="mt-2">Password</Label>);

    expect(screen.getByText('Password')).toHaveClass('mt-2');
  });

  it('has correct default styling', () => {
    render(<Label>Name</Label>);

    const label = screen.getByText('Name');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });

  it('supports htmlFor prop', () => {
    render(<Label htmlFor="email-input">Email</Label>);

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('associates with input', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </>
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null as HTMLLabelElement | null };
    render(<Label ref={ref}>Ref Test</Label>);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('LABEL');
  });
});
