import { Link } from 'react-router-dom';

export function SettingsPage() {
  return (
    <section className="pf-card p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="pf-muted-text mt-3 text-sm leading-7">Manage core app preferences and entities.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="pf-button-ghost" to="/settings/wallets">
          Wallet management
        </Link>
      </div>
    </section>
  );
}
