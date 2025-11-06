import { notFound } from 'next/navigation';
import { PromoBadgeGroup, SpecialistCard } from '../../../../../components';
import type { SpecialistDetail, SpecialistsApiResponse } from '../../../../../types';
import { serverApiFetch } from '../../../../../lib/server-api';

export const dynamic = 'force-dynamic';

interface SpecialistDetailPageProps {
  params: { locale: string; id: string };
}

function formatRate(rate?: number | null) {
  if (rate == null) return 'договорная';
  return `${rate.toLocaleString('ru-RU')} ₸`;
}

export default async function SpecialistDetailPage({ params }: SpecialistDetailPageProps) {
  const specialist = await serverApiFetch<SpecialistDetail>(`/specialists/${params.id}`);

  if (!specialist) {
    notFound();
  }

  const portfolio = specialist.portfolio ?? [];
  const recommended = await serverApiFetch<SpecialistsApiResponse>('/specialists', {
    searchParams: {
      profession: specialist.profession,
      cityId: specialist.cityName ? specialist.cityName : undefined,
      limit: 6,
      sort: 'rating'
    }
  }).catch(() => ({ items: [] }));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10">
      <div className="space-y-3">
        <PromoBadgeGroup promotions={specialist.promotionTypes} />
        <h1 className="text-3xl font-semibold text-slate-900">{specialist.name}</h1>
        <p className="text-sm text-slate-600">
          {specialist.profession} · {(specialist.regionName || specialist.cityName || 'Казахстан')} ·{' '}
          {specialist.experienceYears}+ лет опыта
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">О специалисте</h2>
            <p className="mt-2 text-sm text-slate-600">{specialist.description ?? 'Нет дополнительной информации.'}</p>
            <dl className="mt-4 grid gap-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>Ставка за час</dt>
                <dd>{formatRate(specialist.rateHour)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Ставка за смену</dt>
                <dd>{formatRate(specialist.rateShift)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Ставка за месяц</dt>
                <dd>{formatRate(specialist.rateMonth)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Наличие техники</dt>
                <dd>{specialist.hasEquipment ? 'Со своей техникой' : 'Техника требуется'}</dd>
              </div>
            </dl>
          </div>

          {specialist.certifications && specialist.certifications.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Сертификаты и удостоверения</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {specialist.certifications.map((item) => (
                  <li key={item.title}>
                    <span className="font-medium text-slate-800">{item.title}</span>
                    {item.url && (
                      <a href={item.url} className="ml-2 text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                        Посмотреть
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {portfolio.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">Портфолио</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {portfolio.map((item) => (
                  <img
                    key={item.url}
                    src={item.previewUrl ?? item.url}
                    alt={specialist.name}
                    className="h-48 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">Связаться со специалистом</p>
            <button className="mt-4 w-full rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">
              Позвонить: {specialist.contactMasked ?? 'по запросу'}
            </button>
            <button className="mt-2 w-full rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-600">
              Написать в чат
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Доступность</p>
            <p className="mt-2">{specialist.availability ?? 'По договоренности'}</p>
          </div>
        </aside>
      </div>

      {recommended.items.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Рекомендуемые специалисты</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {recommended.items
              .filter((item) => item.id !== specialist.id)
              .slice(0, 4)
              .map((item) => (
                <SpecialistCard key={item.id} locale={params.locale} specialist={item} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
