import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PromoBadgeGroup } from './promo-badge';
import type { ListingSummary } from '../types';

interface ListingCardProps {
  locale: string;
  listing: ListingSummary;
}

function formatPrice(price?: string | null, currency = 'KZT') {
  if (!price) return 'Цена по запросу';
  const amount = Number(price);
  if (Number.isNaN(amount)) return price;
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
}

export function ListingCard({ locale, listing }: ListingCardProps) {
  const href = `/${locale}/listings/${listing.id}`;
  const timeAgo = listing.createdAt
    ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true, locale: ru })
    : undefined;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link href={href} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {listing.thumbnailUrl ? (
            <img
              src={listing.thumbnailUrl}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Нет фото
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <PromoBadgeGroup promotions={listing.promotionTypes} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">{listing.title}</h3>
            <p className="text-sm text-slate-600">
              {(listing.regionName || listing.cityName) ?? 'Казахстан'}
            </p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-slate-900">{formatPrice(listing.priceKzt, listing.priceCurrency)}</span>
            {listing.year && <span className="text-sm text-slate-500">{listing.year} г.</span>}
          </div>
          <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
            <span>{listing.sellerType === 'dealer' ? 'Дилер' : 'Частное лицо'}</span>
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
