import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders card structure correctly', () => {
    render(
      <Card className="custom-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Content Area</CardContent>
        <CardFooter>Footer Area</CardFooter>
      </Card>
    );

    const card = screen.getByText('Card Title').closest('.custom-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
    expect(card).toHaveClass('bg-card');

    expect(screen.getByText('Card Title')).toHaveClass('font-semibold');
    expect(screen.getByText('Card Description')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Content Area')).toBeInTheDocument();
    expect(screen.getByText('Footer Area')).toBeInTheDocument();
  });

  it('passes through classNames', () => {
    render(
      <Card>
        <CardContent className="p-10">Padded Content</CardContent>
      </Card>
    );
    const content = screen.getByText('Padded Content');
    // tailwind-merge deduplicates conflicting classes, so p-10 overrides base p-6
    expect(content).toHaveClass('p-10');
  });
});
