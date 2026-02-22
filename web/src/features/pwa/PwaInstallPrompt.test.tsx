import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PwaInstallPrompt } from '@/features/pwa/PwaInstallPrompt';

type UserChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

class BeforeInstallPromptEventMock extends Event {
  readonly userChoice: Promise<UserChoice>;
  private readonly promptSpy: () => Promise<void>;

  constructor(promptSpy: () => Promise<void>, userChoice: Promise<UserChoice>) {
    super('beforeinstallprompt');
    this.promptSpy = promptSpy;
    this.userChoice = userChoice;
  }

  prompt() {
    return this.promptSpy();
  }
}

describe('PwaInstallPrompt', () => {
  it('shows install button after beforeinstallprompt and invokes browser prompt', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' } as UserChoice);

    render(<PwaInstallPrompt />);

    fireEvent(window, new BeforeInstallPromptEventMock(prompt, userChoice));

    const installButton = await screen.findByRole('button', { name: 'Install app' });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Install app' })).not.toBeInTheDocument();
    });
  });
});
