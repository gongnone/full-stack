/**
 * Input Component - Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with value', () => {
      render(<Input value="test value" onChange={() => {}} />);

      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" />);

      expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });
  });

  describe('Types', () => {
    it('renders text type by default', () => {
      render(<Input />);

      // Input without explicit type defaults to text (HTML behavior)
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      // Type may not be in DOM if not explicitly set
      expect(input.getAttribute('type') ?? 'text').toBe('text');
    });

    it('renders password type', () => {
      render(<Input type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders email type', () => {
      render(<Input type="email" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('renders number type', () => {
      render(<Input type="number" />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('can be disabled', () => {
      render(<Input disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<Input disabled />);

      expect(screen.getByRole('textbox')).toHaveClass('disabled:cursor-not-allowed');
      expect(screen.getByRole('textbox')).toHaveClass('disabled:opacity-50');
    });

    it('can be required', () => {
      render(<Input required />);

      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('can be readonly', () => {
      render(<Input readOnly value="readonly" />);

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when typing', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole('textbox'), 'hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on typing', async () => {
      const user = userEvent.setup();

      render(<Input defaultValue="" />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'hello');

      expect(input).toHaveValue('hello');
    });

    it('calls onFocus when focused', () => {
      const handleFocus = vi.fn();

      render(<Input onFocus={handleFocus} />);

      fireEvent.focus(screen.getByRole('textbox'));

      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur when blurred', () => {
      const handleBlur = vi.fn();

      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username input" />);

      expect(screen.getByLabelText('Username input')).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <span id="help-text">Enter your username</span>
        </>
      );

      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Styling', () => {
    it('has correct base styling', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
    });

    it('merges custom className with defaults', () => {
      render(<Input className="mt-4" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('mt-4');
      expect(input).toHaveClass('h-9'); // default class still present
    });
  });
});
