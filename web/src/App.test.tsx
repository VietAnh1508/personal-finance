import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { createTestRouter } from './router';

describe('routing shell', () => {
  it.each([
    ['/', 'Routing Shell'],
    ['/onboarding/currency', 'Onboarding Currency Route'],
    ['/onboarding/wallet', 'Wallet Setup Route'],
    ['/transactions', 'Transactions Route'],
    ['/transactions/add', 'Add Transaction Route'],
    ['/transactions/transfer', 'Transfer Route'],
    ['/transactions/adjustment', 'Adjustment Route'],
    ['/transactions/demo-id', 'Transaction Detail Route'],
    ['/settings', 'Settings Route'],
    ['/settings/wallets', 'Wallet Settings Route'],
  ])('renders %s without runtime errors', (path, heading) => {
    const router = createTestRouter([path]);
    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('routes unknown paths to not found page', () => {
    const router = createTestRouter(['/missing-route']);
    render(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: '404 - Route Not Found' })).toBeInTheDocument();
  });

  it('navigates from route directory to a placeholder route', () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} />);

    fireEvent.click(screen.getByRole('link', { name: 'Transactions' }));

    expect(screen.getByRole('heading', { name: 'Transactions Route' })).toBeInTheDocument();
  });
});
