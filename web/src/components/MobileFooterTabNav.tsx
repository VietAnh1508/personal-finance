import { Cog6ToothIcon, PlusIcon, QueueListIcon } from '@heroicons/react/24/outline';
import { Link, NavLink } from 'react-router-dom';

const TAB_BASE_CLASS =
  'inline-flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70';
const TAB_INACTIVE_CLASS = 'text-slate-300 hover:bg-slate-700/30 hover:text-slate-100';
const TAB_ACTIVE_CLASS = 'bg-slate-200/10 text-amber-200';

export function MobileFooterTabNav() {
  return (
    <nav
      aria-label="Primary app navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/15 bg-slate-950/90 backdrop-blur">
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
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-amber-200/40 bg-amber-300 text-slate-950 shadow-[0_10px_25px_-8px_rgba(251,191,36,0.6)] transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            to="/transactions/add">
            <PlusIcon aria-hidden className="h-7 w-7" />
          </Link>
          <span className="mt-1 text-xs font-semibold text-amber-200">Add</span>
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
