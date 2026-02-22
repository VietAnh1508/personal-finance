import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import {
  closeDatabaseConnection,
  openDatabaseConnection,
} from '@/data/database';
import {
  getCurrencyPreference,
  getLastSelectedWalletContext,
  listActiveWallets,
  resetLocalAppData,
  saveCurrencyPreference,
  saveWallet,
} from '@/data/repositories';
import { createTestRouter } from '@/router';

function renderWithProviders(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const router = createTestRouter([path]);

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('onboarding routing flow', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('routes first launch users from root to currency onboarding', async () => {
    renderWithProviders('/');

    expect(await screen.findByRole('heading', { name: 'Choose your currency' })).toBeInTheDocument();
  });

  it('routes users with currency but no wallet from root to wallet onboarding', async () => {
    await saveCurrencyPreference('USD');

    renderWithProviders('/');

    expect(await screen.findByRole('heading', { name: 'Create your first wallet' })).toBeInTheDocument();
  });

  it('routes users with wallet setup from root to transactions', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });

    renderWithProviders('/');

    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
  });

  it('shows mobile footer tabs on transactions route with center add action', async () => {
    renderWithProviders('/transactions');

    const footer = await screen.findByRole('navigation', { name: 'Primary app navigation' });
    expect(footer).toBeInTheDocument();

    const transactionsTab = screen.getByRole('link', { name: 'Transactions' });
    const addAction = screen.getByRole('link', { name: 'Add' });
    const settingsTab = screen.getByRole('link', { name: 'Settings' });

    expect(transactionsTab).toHaveAttribute('aria-current', 'page');
    expect(settingsTab).not.toHaveAttribute('aria-current');

    expect(addAction).toHaveAttribute('href', '/transactions/add');
  });

  it('shows footer active state for settings route', async () => {
    renderWithProviders('/settings');

    const transactionsTab = await screen.findByRole('link', { name: 'Transactions' });
    const settingsTab = screen.getByRole('link', { name: 'Settings' });

    expect(settingsTab).toHaveAttribute('aria-current', 'page');
    expect(transactionsTab).not.toHaveAttribute('aria-current');
  });

  it('hides footer navigation on onboarding routes', async () => {
    renderWithProviders('/onboarding/currency');
    expect(await screen.findByRole('heading', { name: 'Choose your currency' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary app navigation' })).not.toBeInTheDocument();
  });

  it('hides footer navigation on transaction add route', async () => {
    renderWithProviders('/transactions/add');
    expect(await screen.findByRole('link', { name: 'Back' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Primary app navigation' })).not.toBeInTheDocument();
  });

  it('persists selected currency and moves to wallet setup', async () => {
    renderWithProviders('/onboarding/currency');

    fireEvent.click(await screen.findByRole('button', { name: /US Dollar/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('heading', { name: 'Create your first wallet' })).toBeInTheDocument();
    await expect(getCurrencyPreference()).resolves.toBe('USD');
  });

  it('creates first wallet, stores last context, and enters transactions area', async () => {
    await saveCurrencyPreference('USD');

    renderWithProviders('/onboarding/wallet');

    fireEvent.change(await screen.findByLabelText('Wallet name'), { target: { value: 'Daily Cash' } });
    fireEvent.change(screen.getByLabelText('Initial balance'), { target: { value: '1000.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create wallet' }));

    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument();

    const wallets = await listActiveWallets();
    expect(wallets).toHaveLength(1);
    await expect(getLastSelectedWalletContext()).resolves.toBe(wallets[0].id);
  });

  it('routes unknown paths to not found page', () => {
    renderWithProviders('/missing-route');

    expect(screen.getByRole('heading', { name: '404 - Route Not Found' })).toBeInTheDocument();
  });
});
