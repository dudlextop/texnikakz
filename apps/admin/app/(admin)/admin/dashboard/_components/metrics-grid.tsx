'use client';

interface MetricsGridProps {
  counts: {
    totalListings: number;
    pendingListings: number;
    publishedListings: number;
    dealers: number;
    specialists: number;
    paidOrders: number;
    activePromotions: number;
  };
}

const METRIC_ORDER: Array<keyof MetricsGridProps['counts']> = [
  'totalListings',
  'pendingListings',
  'publishedListings',
  'dealers',
  'specialists',
  'paidOrders',
  'activePromotions',
];

const TITLES: Record<keyof MetricsGridProps['counts'], string> = {
  totalListings: 'Всего объявлений',
  pendingListings: 'На модерации',
  publishedListings: 'Опубликовано',
  dealers: 'Активные дилеры',
  specialists: 'Специалисты',
  paidOrders: 'Оплаченные заказы',
  activePromotions: 'Активные промо',
};

export function MetricsGrid({ counts }: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {METRIC_ORDER.map((key) => (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40">
          <p className="text-xs uppercase tracking-wide text-slate-400">{TITLES[key]}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{counts[key].toLocaleString('ru-RU')}</p>
        </div>
      ))}
    </div>
  );
}
