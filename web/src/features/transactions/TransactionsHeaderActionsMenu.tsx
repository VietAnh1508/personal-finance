import { useEffect, useRef, useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export type TransactionHeaderAction = 'transfer' | 'adjustment';

type TransactionsHeaderActionsMenuProps = {
  onSelectAction: (action: TransactionHeaderAction) => void;
};

export function TransactionsHeaderActionsMenu({ onSelectAction }: TransactionsHeaderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  const onChooseAction = (action: TransactionHeaderAction) => {
    setIsOpen(false);
    onSelectAction(action);
  };

  return (
    <div className="relative h-9 w-11" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open actions menu"
        className="inline-flex h-9 w-11 items-center justify-center rounded-md border border-slate-300/20 bg-slate-900/70 text-slate-300 hover:bg-slate-700/40"
        onClick={() => setIsOpen((current) => !current)}
        type="button">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          aria-label="Transactions actions"
          className="absolute right-0 top-11 z-10 w-44 rounded-xl border border-slate-300/20 bg-slate-900/95 p-1 shadow-xl"
          role="menu">
          <button
            autoFocus
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700/40"
            onClick={() => onChooseAction('transfer')}
            role="menuitem"
            type="button">
            Transfer
          </button>
          <button
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700/40"
            onClick={() => onChooseAction('adjustment')}
            role="menuitem"
            type="button">
            Adjust balance
          </button>
        </div>
      ) : null}
    </div>
  );
}
