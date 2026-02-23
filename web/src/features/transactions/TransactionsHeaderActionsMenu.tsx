import { useEffect, useRef, useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export type TransactionHeaderAction = 'transfer' | 'adjustment';

type TransactionsHeaderActionsMenuProps = {
  onSelectAction: (action: TransactionHeaderAction) => void;
  isTransferDisabled?: boolean;
};

export function TransactionsHeaderActionsMenu({
  onSelectAction,
  isTransferDisabled = false,
}: TransactionsHeaderActionsMenuProps) {
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
        className="pf-icon-button h-9 w-11 pf-muted-text"
        onClick={() => setIsOpen((current) => !current)}
        type="button">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          aria-label="Transactions actions"
          className="pf-menu absolute right-0 top-11 z-10 w-44"
          role="menu">
          <button
            autoFocus
            className="pf-menu-item disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            disabled={isTransferDisabled}
            onClick={() => onChooseAction('transfer')}
            role="menuitem"
            type="button">
            Transfer
          </button>
          <button
            className="pf-menu-item"
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
