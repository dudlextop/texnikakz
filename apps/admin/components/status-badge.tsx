'use client';

import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-800/60 text-slate-200 border-slate-700',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  published: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
  archived: 'bg-slate-700/40 text-slate-200 border-slate-700/60',
  blocked: 'bg-red-500/20 text-red-200 border-red-500/50',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const variant = STATUS_STYLES[normalized] ?? 'bg-slate-800/60 text-slate-200 border-slate-700';

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variant,
      )}
    >
      {status}
    </span>
  );
}
