/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import AdminSettings from '@/app/admin/settings/page';

describe('AdminSettings', () => {
  it('renders core sections and saves settings state', () => {
    render(<AdminSettings />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Cost Controls')).toBeInTheDocument();
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    expect(screen.getByText('Settings saved.')).toBeInTheDocument();
  });
});
