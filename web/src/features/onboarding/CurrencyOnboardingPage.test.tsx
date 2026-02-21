import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { selectCurrency } from '@/domain/services';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { CurrencyOnboardingPage } from '@/features/onboarding/CurrencyOnboardingPage';
import { useOnboardingStatus } from '@/features/onboarding/use-onboarding-status';

vi.mock('../../domain/services', () => ({
  selectCurrency: vi.fn(),
}));

vi.mock('./use-onboarding-status', () => ({
  onboardingStatusQueryKey: ['onboarding-status'] as const,
  useOnboardingStatus: vi.fn(),
}));

const mockUseOnboardingStatus = vi.mocked(useOnboardingStatus);
const mockSelectCurrency = vi.mocked(selectCurrency);

function renderCurrencyPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createMemoryRouter(
    [
      { path: '/onboarding/currency', element: <CurrencyOnboardingPage /> },
      { path: '/onboarding/wallet', element: <h1>Wallet Setup Route</h1> },
      { path: '/transactions', element: <h1>Transactions Route</h1> },
    ],
    { initialEntries: ['/onboarding/currency'] }
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('CurrencyOnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves selected currency and navigates to wallet onboarding', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: null,
      hasWallet: false,
    });
    mockSelectCurrency.mockResolvedValue();

    renderCurrencyPage();

    fireEvent.click(screen.getByRole('button', { name: /US Dollar/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(mockSelectCurrency).toHaveBeenCalledWith('USD');
    expect(await screen.findByText('Currency saved.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Wallet Setup Route' })).toBeInTheDocument();
  });

  it('redirects to wallet onboarding when currency is already selected', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: 'USD',
      hasWallet: false,
    });

    renderCurrencyPage();

    expect(await screen.findByRole('heading', { name: 'Wallet Setup Route' })).toBeInTheDocument();
  });

  it('redirects to transactions when wallet already exists', async () => {
    mockUseOnboardingStatus.mockReturnValue({
      isLoading: false,
      selectedCurrency: 'USD',
      hasWallet: true,
    });

    renderCurrencyPage();

    expect(await screen.findByRole('heading', { name: 'Transactions Route' })).toBeInTheDocument();
  });
});
