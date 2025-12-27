/**
 * Story 6.1: ExportFormatSelector - Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportFormatSelector } from './ExportFormatSelector';

describe('ExportFormatSelector', () => {
  const defaultProps = {
    value: 'csv' as const,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders CSV button', () => {
      render(<ExportFormatSelector {...defaultProps} />);

      expect(screen.getByTestId('format-csv')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('renders JSON button', () => {
      render(<ExportFormatSelector {...defaultProps} />);

      expect(screen.getByTestId('format-json')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('shows format descriptions', () => {
      render(<ExportFormatSelector {...defaultProps} />);

      expect(screen.getByText('Excel-compatible')).toBeInTheDocument();
      expect(screen.getByText('Developer-friendly')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ExportFormatSelector {...defaultProps} className="mt-4" />
      );

      expect(container.firstChild).toHaveClass('mt-4');
    });
  });

  describe('Selection State', () => {
    it('highlights CSV when selected', () => {
      render(<ExportFormatSelector {...defaultProps} value="csv" />);

      const csvBtn = screen.getByTestId('format-csv');
      expect(csvBtn).toHaveClass('border-[var(--approve)]');
    });

    it('highlights JSON when selected', () => {
      render(<ExportFormatSelector {...defaultProps} value="json" />);

      const jsonBtn = screen.getByTestId('format-json');
      expect(jsonBtn).toHaveClass('border-[var(--approve)]');
    });

    it('shows unselected style for CSV when JSON is selected', () => {
      render(<ExportFormatSelector {...defaultProps} value="json" />);

      const csvBtn = screen.getByTestId('format-csv');
      expect(csvBtn).toHaveClass('border-[var(--border-subtle)]');
    });

    it('shows unselected style for JSON when CSV is selected', () => {
      render(<ExportFormatSelector {...defaultProps} value="csv" />);

      const jsonBtn = screen.getByTestId('format-json');
      expect(jsonBtn).toHaveClass('border-[var(--border-subtle)]');
    });
  });

  describe('onChange Handler', () => {
    it('calls onChange with csv when CSV clicked', () => {
      const onChange = vi.fn();
      render(<ExportFormatSelector {...defaultProps} value="json" onChange={onChange} />);

      fireEvent.click(screen.getByTestId('format-csv'));

      expect(onChange).toHaveBeenCalledWith('csv');
    });

    it('calls onChange with json when JSON clicked', () => {
      const onChange = vi.fn();
      render(<ExportFormatSelector {...defaultProps} value="csv" onChange={onChange} />);

      fireEvent.click(screen.getByTestId('format-json'));

      expect(onChange).toHaveBeenCalledWith('json');
    });

    it('calls onChange when clicking already selected format', () => {
      const onChange = vi.fn();
      render(<ExportFormatSelector {...defaultProps} value="csv" onChange={onChange} />);

      fireEvent.click(screen.getByTestId('format-csv'));

      expect(onChange).toHaveBeenCalledWith('csv');
    });
  });
});
