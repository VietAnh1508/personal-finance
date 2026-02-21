import { Link } from 'react-router-dom';

export function SettingsPage() {
  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">Manage core app preferences and entities.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="rounded-md border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40" to="/settings/wallets">
          Wallet management
        </Link>
      </div>
    </section>
  );
}
