import Link from 'next/link';
import { ListingCard, SpecialistCard } from '../../../../components';
import type { ListingsApiResponse, SpecialistsApiResponse, UserProfile } from '../../../../types';
import { serverApiFetch } from '../../../../lib/server-api';

export const dynamic = 'force-dynamic';

export default async function ProfileOverviewPage({ params }: { params: { locale: string } }) {
  const [profile, listings, specialists] = await Promise.all([
    serverApiFetch<UserProfile>('/users/me').catch(() => null),
    serverApiFetch<ListingsApiResponse>('/listings', {
      searchParams: { limit: 3, sort: 'newest' }
    }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0, facets: { categories: [] } })),
    serverApiFetch<SpecialistsApiResponse>('/specialists', {
      searchParams: { limit: 3, sort: 'rating' }
    }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0 }))
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Добро пожаловать{profile ? `, ${profile.name ?? profile.phone}` : ''}!</h1>
          <p className="text-sm text-slate-600">
            Здесь отображаются ключевые показатели аккаунта: активные объявления, продвижения и последние отклики.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Активные объявления" value={listings.total} />
          <StatCard label="Активные специалисты" value={specialists.total} />
          <StatCard label="Продвижения" value={Math.min(listings.items.filter((item) => item.promotionTypes?.length).length, listings.total)} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Последние объявления</h2>
          <Link href={`/${params.locale}/profile/listings`} className="text-sm font-semibold text-blue-600 hover:underline">
            Управлять объявлениями
          </Link>
        </div>
        {listings.items.length === 0 ? (
          <p className="text-sm text-slate-500">У вас пока нет объявлений. Создайте первое, чтобы привлечь клиентов.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.items.map((listing) => (
              <ListingCard key={listing.id} locale={params.locale} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Специалисты команды</h2>
          <Link href={`/${params.locale}/specialists`} className="text-sm font-semibold text-blue-600 hover:underline">
            Каталог специалистов
          </Link>
        </div>
        {specialists.items.length === 0 ? (
          <p className="text-sm text-slate-500">Вы ещё не размещали профили операторов. Добавьте специалистов для расширения услуг.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {specialists.items.map((specialist) => (
              <SpecialistCard key={specialist.id} locale={params.locale} specialist={specialist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{label}</p>
    </div>
  );
}
