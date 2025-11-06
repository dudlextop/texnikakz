import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { StatusBadge } from '@/components/status-badge';
import type { AdminListingDetail } from '@/types/listings';
import { ModerationActions } from '../_components/moderation-actions';

interface ListingDetailsPageProps {
  params: { id: string };
}

function formatCurrency(value: string | null) {
  if (!value) {
    return '—';
  }
  return `${Number(value).toLocaleString()} ₸`;
}

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  let listing: AdminListingDetail | null = null;
  try {
    listing = await apiFetch<AdminListingDetail>(`/admin/listings/${params.id}`);
  } catch (error) {
    console.error('Failed to load admin listing', error);
  }

  if (!listing) {
    notFound();
  }

  const statusLabel = listing.status.toLowerCase();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <StatusBadge status={statusLabel} />
            <span>ID: {listing.id}</span>
            <span>Продавец: {listing.dealer.name ?? 'частный'}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">{listing.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{listing.description}</p>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>Создано: {new Date(listing.meta.createdAt).toLocaleString()}</p>
          <p>Обновлено: {new Date(listing.meta.updatedAt).toLocaleString()}</p>
          {listing.meta.publishedAt ? <p>Опубликовано: {new Date(listing.meta.publishedAt).toLocaleString()}</p> : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Описание</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{listing.description}</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-slate-100">Параметры</h3>
            <dl className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Категория</dt>
                <dd>{listing.categoryId ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Тип продавца</dt>
                <dd>{listing.sellerType}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Цена</dt>
                <dd>{formatCurrency(listing.priceKzt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Регион</dt>
                <dd>{listing.region.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Город</dt>
                <dd>{listing.city.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Связь</dt>
                <dd>{listing.contactMasked ?? '—'}</dd>
              </div>
            </dl>
          </div>

          {listing.media.length ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Медиа</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listing.media.map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-lg border border-slate-800">
                    <img src={item.url} alt={listing.title} className="h-40 w-full object-cover" />
                  </figure>
                ))}
              </div>
            </div>
          ) : null}

          {listing.specs ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Технические данные</h3>
              <pre className="mt-3 overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300">
                {JSON.stringify(listing.specs, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold text-slate-100">Модерация</h3>
            <p className="mt-2 text-xs text-slate-400">
              Примите решение по объявлению, укажите причины отклонения и обновите статус.
            </p>
            <div className="mt-4">
              <ModerationActions listingId={listing.id} status={statusLabel} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            <h3 className="text-sm font-semibold text-slate-100">Системные данные</h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Boost Score</dt>
                <dd>{listing.meta.boostScore.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">User ID</dt>
                <dd>{listing.userId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Dealer ID</dt>
                <dd>{listing.dealer.id ?? '—'}</dd>
              </div>
              {listing.meta.moderationReason ? (
                <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-rose-200">
                  <p className="text-xs font-semibold uppercase tracking-wide">Причина отклонения</p>
                  <p className="mt-1 text-sm">{listing.meta.moderationReason}</p>
                </div>
              ) : null}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
