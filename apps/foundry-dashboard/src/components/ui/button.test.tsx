import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders default button', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  it('renders destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders custom approve variant', () => {
    render(<Button variant="approve">Approve</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[var(--approve)]');
  });

  it('renders custom kill variant', () => {
    render(<Button variant="kill">Kill</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-[var(--kill)]');
  });

  it('renders small size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('text-xs');
  });

  it('renders as child (Slot)', () => {
    render(
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toHaveClass('inline-flex');
    expect(link).toHaveClass('bg-primary');
  });
});
