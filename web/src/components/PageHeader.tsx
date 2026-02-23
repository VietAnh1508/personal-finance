import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type PageHeaderProps = {
  title: string;
  backTo: string;
  backLabel?: string;
  className?: string;
  rightAction?: ReactNode;
};

export function PageHeader({ title, backTo, backLabel = 'Back', className, rightAction }: PageHeaderProps) {
  return (
    <div className={className ?? 'grid grid-cols-[auto_1fr_auto] items-center gap-3'}>
      <Link
        aria-label={backLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300/20 hover:bg-slate-700/40"
        to={backTo}>
        <ArrowLeftIcon aria-hidden className="h-4 w-4" />
        <span className="sr-only">{backLabel}</span>
      </Link>

      <h1 className="text-center text-2xl font-semibold tracking-tight">{title}</h1>
      {rightAction ? rightAction : <div aria-hidden className="h-9 w-9" />}
    </div>
  );
}
