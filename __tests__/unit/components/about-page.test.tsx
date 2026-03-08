/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';

describe('AboutPage', () => {
  it('renders core sections with shadcn structure', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Blind AI Comparison, Editor-First' })).toBeInTheDocument();
    expect(screen.getByText('What is BlindLane?')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on GitHub/i })).toBeInTheDocument();
  });
});
