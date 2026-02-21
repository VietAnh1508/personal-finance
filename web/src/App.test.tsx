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

    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();

    const wallets = await listActiveWallets();
    expect(wallets).toHaveLength(1);
    await expect(getLastSelectedWalletContext()).resolves.toBe(wallets[0].id);
  });

  it('routes unknown paths to not found page', () => {
    renderWithProviders('/missing-route');

    expect(screen.getByRole('heading', { name: '404 - Route Not Found' })).toBeInTheDocument();
  });
});
