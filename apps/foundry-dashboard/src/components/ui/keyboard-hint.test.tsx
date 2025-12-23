import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardHint } from './keyboard-hint';

describe('KeyboardHint', () => {
  describe('single key', () => {
    it('renders a single key', () => {
      render(<KeyboardHint keys={['K']} />);
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('renders arrow keys', () => {
      render(<KeyboardHint keys={['\u2190']} />);
      expect(screen.getByText('\u2190')).toBeInTheDocument();
    });

    it('does not show plus separator for single key', () => {
      render(<KeyboardHint keys={['K']} />);
      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });
  });

  describe('multiple keys', () => {
    it('renders multiple keys', () => {
      render(<KeyboardHint keys={['Cmd', 'K']} />);
      expect(screen.getByText('Cmd')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('shows plus separator between keys', () => {
      render(<KeyboardHint keys={['Cmd', 'K']} />);
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('shows correct number of plus separators', () => {
      render(<KeyboardHint keys={['Ctrl', 'Shift', 'K']} />);
      const plusSigns = screen.getAllByText('+');
      expect(plusSigns).toHaveLength(2);
    });

    it('renders keys in correct order', () => {
      const { container } = render(<KeyboardHint keys={['Cmd', 'Shift', 'K']} />);
      const kbds = container.querySelectorAll('kbd');
      expect(kbds[0]).toHaveTextContent('Cmd');
      expect(kbds[1]).toHaveTextContent('Shift');
      expect(kbds[2]).toHaveTextContent('K');
    });
  });

  describe('action description', () => {
    it('does not show action when not provided', () => {
      render(<KeyboardHint keys={['K']} />);
      const container = screen.getByText('K').parentElement?.parentElement;
      expect(container?.children).toHaveLength(1);
    });

    it('shows action when provided', () => {
      render(<KeyboardHint keys={['K']} action="Kill" />);
      expect(screen.getByText('Kill')).toBeInTheDocument();
    });

    it('shows action with correct styling', () => {
      render(<KeyboardHint keys={['K']} action="Kill" />);
      const actionText = screen.getByText('Kill');
      expect(actionText).toHaveClass('text-[#6E767D]');
      expect(actionText).toHaveClass('ml-2');
    });
  });

  describe('sizes', () => {
    it('renders sm size correctly (default)', () => {
      render(<KeyboardHint keys={['K']} />);
      const kbd = screen.getByText('K');
      expect(kbd).toHaveClass('px-1.5');
      expect(kbd).toHaveClass('py-0.5');
      expect(kbd).toHaveClass('min-w-[1.25rem]');
    });

    it('renders md size correctly', () => {
      render(<KeyboardHint keys={['K']} size="md" />);
      const kbd = screen.getByText('K');
      expect(kbd).toHaveClass('px-2');
      expect(kbd).toHaveClass('py-1');
      expect(kbd).toHaveClass('min-w-[1.5rem]');
    });

    it('sm size has correct container gap', () => {
      const { container } = render(<KeyboardHint keys={['Cmd', 'K']} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-xs');
      expect(wrapper).toHaveClass('gap-1');
    });

    it('md size has correct container gap', () => {
      const { container } = render(<KeyboardHint keys={['Cmd', 'K']} size="md" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-sm');
      expect(wrapper).toHaveClass('gap-1.5');
    });
  });

  describe('styling', () => {
    it('kbd elements have correct base styles', () => {
      render(<KeyboardHint keys={['K']} />);
      const kbd = screen.getByText('K');
      expect(kbd).toHaveClass('bg-[#1A1F26]');
      expect(kbd).toHaveClass('text-[#6E767D]');
      expect(kbd).toHaveClass('border');
      expect(kbd).toHaveClass('border-[#2A3038]');
      expect(kbd).toHaveClass('rounded');
      expect(kbd).toHaveClass('font-mono');
    });

    it('plus separator has correct color', () => {
      render(<KeyboardHint keys={['Cmd', 'K']} />);
      const plus = screen.getByText('+');
      expect(plus).toHaveClass('text-[#6E767D]');
    });
  });

  describe('common keyboard shortcuts', () => {
    it('renders command palette shortcut', () => {
      render(<KeyboardHint keys={['Cmd', 'K']} action="Open command palette" />);
      expect(screen.getByText('Cmd')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('Open command palette')).toBeInTheDocument();
    });

    it('renders navigation arrows', () => {
      render(<KeyboardHint keys={['\u2190']} action="Kill" />);
      expect(screen.getByText('\u2190')).toBeInTheDocument();
      expect(screen.getByText('Kill')).toBeInTheDocument();
    });

    it('renders approve shortcut', () => {
      render(<KeyboardHint keys={['\u2192']} action="Approve" />);
      expect(screen.getByText('\u2192')).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('renders edit shortcut', () => {
      render(<KeyboardHint keys={['E']} action="Edit" />);
      expect(screen.getByText('E')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('renders hub kill shortcut', () => {
      render(<KeyboardHint keys={['H']} action="Hub Kill" />);
      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('Hub Kill')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <KeyboardHint keys={['K']} className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass('my-custom-class');
    });

    it('preserves base styles with custom className', () => {
      const { container } = render(
        <KeyboardHint keys={['K']} className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass('inline-flex');
      expect(container.firstChild).toHaveClass('items-center');
    });
  });
});
