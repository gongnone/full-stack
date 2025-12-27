import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButton } from './action-button';

describe('ActionButton', () => {
  describe('variants', () => {
    it('renders approve variant with correct styles', () => {
      render(<ActionButton variant="approve">Approve</ActionButton>);
      const button = screen.getByRole('button', { name: 'Approve' });
      expect(button).toHaveClass('bg-[#00D26A]');
      expect(button).toHaveClass('text-black');
    });

    it('renders kill variant with correct styles', () => {
      render(<ActionButton variant="kill">Kill</ActionButton>);
      const button = screen.getByRole('button', { name: 'Kill' });
      expect(button).toHaveClass('bg-[#F4212E]');
      expect(button).toHaveClass('text-white');
    });

    it('renders edit variant with correct styles', () => {
      render(<ActionButton variant="edit">Edit</ActionButton>);
      const button = screen.getByRole('button', { name: 'Edit' });
      expect(button).toHaveClass('bg-[#1D9BF0]');
      expect(button).toHaveClass('text-white');
    });

    it('renders warning variant with correct styles', () => {
      render(<ActionButton variant="warning">Warning</ActionButton>);
      const button = screen.getByRole('button', { name: 'Warning' });
      expect(button).toHaveClass('bg-[#FFAD1F]');
      expect(button).toHaveClass('text-black');
    });

    it('renders ghost variant with correct styles', () => {
      render(<ActionButton variant="ghost">Ghost</ActionButton>);
      const button = screen.getByRole('button', { name: 'Ghost' });
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-[#8B98A5]');
    });

    it('renders outline variant with correct styles', () => {
      render(<ActionButton variant="outline">Outline</ActionButton>);
      const button = screen.getByRole('button', { name: 'Outline' });
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-[#2A3038]');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('glow effects', () => {
    it('approve variant has green glow on hover class', () => {
      render(<ActionButton variant="approve">Approve</ActionButton>);
      const button = screen.getByRole('button', { name: 'Approve' });
      expect(button.className).toContain('hover:shadow-[0_0_20px_rgba(0,210,106,0.15)]');
    });

    it('kill variant has red glow on hover class', () => {
      render(<ActionButton variant="kill">Kill</ActionButton>);
      const button = screen.getByRole('button', { name: 'Kill' });
      expect(button.className).toContain('hover:shadow-[0_0_20px_rgba(244,33,46,0.15)]');
    });

    it('edit variant has blue glow on hover class', () => {
      render(<ActionButton variant="edit">Edit</ActionButton>);
      const button = screen.getByRole('button', { name: 'Edit' });
      expect(button.className).toContain('hover:shadow-[0_0_20px_rgba(29,155,240,0.15)]');
    });
  });

  describe('loading state', () => {
    it('shows loading spinner when isLoading is true', () => {
      render(<ActionButton isLoading>Submit</ActionButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('disables button when isLoading is true', () => {
      render(<ActionButton isLoading>Submit</ActionButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('hides children when loading', () => {
      render(<ActionButton isLoading>Submit</ActionButton>);
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<ActionButton disabled>Submit</ActionButton>);
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toBeDisabled();
    });

    it('applies disabled opacity styles', () => {
      render(<ActionButton disabled>Submit</ActionButton>);
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveClass('disabled:opacity-40');
    });
  });

  describe('sizes', () => {
    it('renders sm size correctly', () => {
      render(<ActionButton size="sm">Small</ActionButton>);
      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('h-8');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('text-xs');
    });

    it('renders md size correctly (default)', () => {
      render(<ActionButton size="md">Medium</ActionButton>);
      const button = screen.getByRole('button', { name: 'Medium' });
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('text-sm');
    });

    it('renders lg size correctly', () => {
      render(<ActionButton size="lg">Large</ActionButton>);
      const button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('text-base');
    });

    it('renders icon size correctly', () => {
      render(<ActionButton size="icon">+</ActionButton>);
      const button = screen.getByRole('button', { name: '+' });
      expect(button).toHaveClass('h-10');
      expect(button).toHaveClass('w-10');
    });
  });

  describe('interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ActionButton onClick={handleClick}>Click me</ActionButton>);

      await user.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ActionButton onClick={handleClick} disabled>Click me</ActionButton>);

      await user.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<ActionButton onClick={handleClick} isLoading>Click me</ActionButton>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('focus styles', () => {
    it('has focus-visible ring styles', () => {
      render(<ActionButton>Focus me</ActionButton>);
      const button = screen.getByRole('button', { name: 'Focus me' });
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  describe('defaults', () => {
    it('uses edit variant by default', () => {
      render(<ActionButton>Default</ActionButton>);
      const button = screen.getByRole('button', { name: 'Default' });
      expect(button).toHaveClass('bg-[#1D9BF0]');
    });

    it('uses md size by default', () => {
      render(<ActionButton>Default</ActionButton>);
      const button = screen.getByRole('button', { name: 'Default' });
      expect(button).toHaveClass('h-10');
    });
  });
});
