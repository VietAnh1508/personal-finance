import { Cog6ToothIcon, PlusIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { Link, NavLink } from 'react-router-dom';

const TAB_BASE_CLASS =
  'inline-flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2';
const TAB_INACTIVE_CLASS = 'pf-muted-text hover:bg-[var(--pf-surface-hover)]';
const TAB_ACTIVE_CLASS = 'bg-[var(--pf-surface-hover)] text-[var(--pf-accent)]';

export function MobileFooterTabNav() {
  return (
    <nav
      aria-label="Primary app navigation"
      className="pf-footer-nav fixed inset-x-0 bottom-0 z-40 backdrop-blur">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-3 items-end gap-3 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2">
        <NavLink
          className={({ isActive }) =>
            `${TAB_BASE_CLASS} ${isActive ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`
          }
          end
          to="/transactions">
          <QueueListIcon aria-hidden className="h-5 w-5" />
          <span>Transactions</span>
        </NavLink>

        <div className="flex flex-col items-center">
          <Link
            aria-label="Add"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--pf-border-strong)] bg-[var(--pf-accent)] text-[var(--pf-accent-contrast)] shadow-[0_10px_25px_-8px_rgba(129,162,219,0.6)] transition hover:bg-[var(--pf-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-focus-ring)]"
            to="/transactions/add">
            <PlusIcon aria-hidden className="h-7 w-7" />
          </Link>
          <span className="mt-1 text-xs font-semibold text-[var(--pf-accent)]">Add</span>
        </div>

        <NavLink
          className={({ isActive }) =>
            `${TAB_BASE_CLASS} ${isActive ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}`
          }
          end
          to="/settings">
          <Cog6ToothIcon aria-hidden className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
