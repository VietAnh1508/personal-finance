import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createWallet, setLastUsedWalletContext } from '../../domain/services';
import { ToastProvider } from '../feedback/ToastProvider';
import { FirstWalletOnboardingPage } from './FirstWalletOnboardingPage';
import { useOnboardingStatus } from './use-onboarding-status';

vi.mock('../../domain/services', () => ({
  createWallet: vi.fn(),
  setLastUsedWalletContext: vi.fn(),
}));

vi.mock('./use-onboarding-status', () => ({
  onboardingStatusQueryKey: ['onboarding-status'] as const,
  useOnboardingStatus: vi.fn(),
}));

const mockUseOnboardingStatus = vi.mocked(useOnboardingStatus);
const mockCreateWallet = vi.mocked(createWallet);
const mockSetLastUsedWalletContext = vi.mocked(setLastUsedWalletContext);

function renderFirstWalletPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createMemoryRouter(
    [
      { path: '/onboarding/wallet', element: <FirstWalletOnboardingPage /> },
      { path: '/onboarding/currency', element: <h1>Onboarding Currency Route</h1> },
      { path: '/transactions', element: <h1>Transactions Route</h1> },
    ],
    { initialEntries: ['/onboarding/wallet'] }
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('FirstWalletOnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates wallet, stores last used context, and navigates to transactions', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: 'USD',
      hasWallet: false,
    });
    mockCreateWallet.mockResolvedValue({
      id: 'wallet_1',
      name: 'Daily Cash',
      initialBalance: 100_050,
      iconKey: 'wallet',
    });
    mockSetLastUsedWalletContext.mockResolvedValue();

    renderFirstWalletPage();

    fireEvent.change(screen.getByLabelText('Wallet name'), { target: { value: 'Daily Cash' } });
    fireEvent.change(screen.getByLabelText('Initial balance'), { target: { value: '1000.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create wallet' }));

    await waitFor(() => {
      expect(mockCreateWallet).toHaveBeenCalledWith('Daily Cash', 100_050, 'wallet');
      expect(mockSetLastUsedWalletContext).toHaveBeenCalledWith('wallet_1');
    });
    expect(await screen.findByText('Wallet created successfully.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Transactions Route' })).toBeInTheDocument();
  });

  it('shows an error toast when wallet creation fails', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: 'USD',
      hasWallet: false,
    });
    mockCreateWallet.mockRejectedValue(new Error('create failed'));

    renderFirstWalletPage();

    fireEvent.change(screen.getByLabelText('Wallet name'), { target: { value: 'Daily Cash' } });
    fireEvent.change(screen.getByLabelText('Initial balance'), { target: { value: '1000.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create wallet' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to create wallet. Please review your values and try again.'
    );
  });

  it('redirects to currency onboarding when currency is not set', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: null,
      hasWallet: false,
    });

    renderFirstWalletPage();

    expect(await screen.findByRole('heading', { name: 'Onboarding Currency Route' })).toBeInTheDocument();
  });

  it('redirects to transactions when wallet already exists', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: 'USD',
      hasWallet: true,
    });

    renderFirstWalletPage();

    expect(await screen.findByRole('heading', { name: 'Transactions Route' })).toBeInTheDocument();
  });
});
