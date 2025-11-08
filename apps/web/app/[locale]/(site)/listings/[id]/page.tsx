import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PromoBadgeGroup, ListingCard, PromotionPurchaseButton } from '../../../../../components';
import type { ListingDetail, ListingsApiResponse } from '../../../../../types';
import { serverApiFetch } from '../../../../../lib/server-api';

export const dynamic = 'force-dynamic';

interface ListingDetailPageProps {
  params: { locale: string; id: string };
}

function formatPrice(price?: string | null, currency = 'KZT') {
  if (!price) return 'Цена по запросу';
  const amount = Number(price);
  if (Number.isNaN(amount)) return price;
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const tPromote = await getTranslations({ namespace: 'billing.promote' });
  const listing = await serverApiFetch<ListingDetail>(`/listings/${params.id}`);

  if (!listing) {
    notFound();
  }

  const gallery = listing.media ?? [];
  const recommendationsResponse = listing.recommendations
    ? { items: listing.recommendations }
    : await serverApiFetch<ListingsApiResponse>('/listings', {
        searchParams: {
          categoryId: listing.categoryId,
          limit: 6,
          sort: 'relevance'
        }
      }).catch(() => ({ items: [] }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <div className="space-y-3">
        <PromoBadgeGroup promotions={listing.promotionTypes} />
        <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
        <p className="text-sm text-slate-600">
          {(listing.regionName || listing.cityName || 'Казахстан') + (listing.year ? ` · ${listing.year} г.` : '')}
        </p>
        <p className="text-2xl font-semibold text-slate-900">{formatPrice(listing.priceKzt, listing.priceCurrency)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          {gallery.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {gallery.map((media) => (
                <img
                  key={media.objectKey}
                  src={media.url ?? ''}
                  alt={listing.title}
                  className="h-60 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              Фотографии появятся после загрузки продавцом.
            </div>
          )}

          <article className="prose prose-slate max-w-none rounded-2xl border border-slate-200 bg-white p-6">
            <h2>Описание</h2>
            <p>{listing.description ?? 'Продавец еще не добавил описание.'}</p>
            {listing.parameters && (
              <div>
                <h3>Основные параметры</h3>
                <ul>
                  {Object.entries(listing.parameters).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {String(value ?? '—')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Связаться с продавцом</p>
            <button className="mt-4 w-full rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
              Позвонить: {listing.contactMasked ?? 'по запросу'}
            </button>
            <button className="mt-2 w-full rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-600">
              Написать в чат
            </button>
            {listing.dealer && (
              <div className="mt-6 space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{listing.dealer.name}</p>
                {listing.dealer.website && (
                  <a href={listing.dealer.website} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    Перейти на сайт дилера
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{tPromote('ctaTitleListing')}</p>
            <p className="mt-2 text-sm text-slate-600">{tPromote('ctaDescription')}</p>
            <div className="mt-4">
              <PromotionPurchaseButton
                locale={params.locale}
                subjectId={listing.id}
                subjectType="LISTING"
                variant="listing"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Безопасная сделка</p>
            <p className="mt-2">
              Проверяйте документы, проводите тест-драйв и используйте чат площадки для фиксации договорённостей.
            </p>
          </div>
        </aside>
      </div>

      {recommendationsResponse.items.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Похожие объявления</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendationsResponse.items.map((item) => (
              <ListingCard key={item.id} locale={params.locale} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
