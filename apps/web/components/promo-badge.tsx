import clsx from 'clsx';
import type { PromotionType } from '../types';

const promoConfig: Record<PromotionType, { label: string; className: string }> = {
  vip: { label: 'VIP', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  top: { label: 'TOP', className: 'bg-purple-100 text-purple-800 border-purple-300' },
  highlight: { label: 'Highlight', className: 'bg-blue-100 text-blue-800 border-blue-300' }
};

interface PromoBadgeProps {
  type: PromotionType;
  compact?: boolean;
}

export function PromoBadge({ type, compact = false }: PromoBadgeProps) {
  const config = promoConfig[type];

  if (!config) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        config.className,
        compact && 'text-[10px]'
      )}
    >
      {config.label}
    </span>
  );
}

export function PromoBadgeGroup({ promotions }: { promotions?: PromotionType[] }) {
  if (!promotions?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {promotions.map((promo) => (
        <PromoBadge key={promo} type={promo} compact />
      ))}
    </div>
  );
}
