import { type SyntheticEvent } from 'react';
import { WalletIcon } from '@/components/WalletIcon';
import { WALLET_ICON_OPTIONS, type WalletIconKey } from '@/domain/wallet-icon';

type WalletFormProps = {
  mode: 'create' | 'edit';
  walletName: string;
  walletIconKey: WalletIconKey;
  initialBalanceInput?: string;
  currencySymbol?: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onWalletNameChange: (nextValue: string) => void;
  onWalletIconKeyChange: (nextValue: WalletIconKey) => void;
  onInitialBalanceInputChange?: (nextValue: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
};

export function WalletForm({
  mode,
  walletName,
  walletIconKey,
  initialBalanceInput,
  currencySymbol,
  isSubmitting,
  errorMessage,
  onWalletNameChange,
  onWalletIconKeyChange,
  onInitialBalanceInputChange,
  onSubmit,
}: WalletFormProps) {
  const isCreateMode = mode === 'create';

  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-slate-200" htmlFor={`wallet-${mode}-name`}>
          Wallet name
        </label>
        <input
          className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
          id={`wallet-${mode}-name`}
          maxLength={60}
          onChange={(event) => onWalletNameChange(event.target.value)}
          placeholder="e.g. Daily Cash"
          value={walletName}
        />
      </div>

      {isCreateMode ? (
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor={`wallet-${mode}-initial-balance`}>
            Initial balance ({currencySymbol})
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id={`wallet-${mode}-initial-balance`}
            inputMode="decimal"
            onChange={(event) => onInitialBalanceInputChange?.(event.target.value)}
            placeholder="0.00"
            value={initialBalanceInput ?? ''}
          />
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm text-slate-200">Wallet icon</legend>
        <div className="grid grid-cols-5 gap-2">
          {WALLET_ICON_OPTIONS.map((iconOption) => {
            const isSelected = walletIconKey === iconOption.key;
            return (
              <button
                key={iconOption.key}
                aria-label={`Select ${iconOption.label} icon for ${mode}`}
                className={`rounded-xl border p-2 text-xs transition ${
                  isSelected
                    ? 'border-emerald-300 bg-emerald-300/10 ring-2 ring-emerald-300/40'
                    : 'border-slate-300/25 bg-slate-900/55 hover:border-amber-300/45'
                }`}
                onClick={() => onWalletIconKeyChange(iconOption.key)}
                type="button">
                <WalletIcon className="mx-auto h-4 w-4" iconKey={iconOption.key} />
                <p className="mt-1">{iconOption.label}</p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {errorMessage ? (
        <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
      ) : null}

      <button
        className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
        disabled={isSubmitting}
        type="submit">
        {isSubmitting ? (isCreateMode ? 'Creating...' : 'Saving...') : isCreateMode ? 'Create wallet' : 'Save changes'}
      </button>
    </form>
  );
}
