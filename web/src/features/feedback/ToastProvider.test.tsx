import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/features/feedback/ToastProvider';

function TriggerToastButton() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() => {
        showToast({
          type: 'success',
          message: 'Action completed',
        });
      }}
      type="button">
      Show toast
    </button>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders a triggered toast and auto-dismisses it', () => {
    render(
      <ToastProvider>
        <TriggerToastButton />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show toast' }));
    expect(screen.getByText('Action completed')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText('Action completed')).not.toBeInTheDocument();
  });
});
