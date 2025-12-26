import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicsToAvoid } from './TopicsToAvoid';

describe('TopicsToAvoid', () => {
  it('renders nothing when empty', () => {
    const { container } = render(<TopicsToAvoid topics={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders topics as pills', () => {
    render(<TopicsToAvoid topics={['jargon', 'cliches']} />);
    
    expect(screen.getByText('Topics to Avoid')).toBeInTheDocument();
    expect(screen.getByText('jargon')).toBeInTheDocument();
    expect(screen.getByText('cliches')).toBeInTheDocument();
  });
});