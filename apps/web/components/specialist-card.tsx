import Link from 'next/link';
import { PromoBadgeGroup } from './promo-badge';
import type { SpecialistSummary } from '../types';

interface SpecialistCardProps {
  locale: string;
  specialist: SpecialistSummary;
}

function formatRate(rate?: number | null) {
  if (rate == null) return null;
  return `${rate.toLocaleString('ru-RU')} ₸`;
}

export function SpecialistCard({ locale, specialist }: SpecialistCardProps) {
  const href = `/${locale}/specialists/${specialist.id}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link href={href} className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
            {specialist.avatarUrl ? (
              <img src={specialist.avatarUrl} alt={specialist.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                {specialist.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900">{specialist.name}</h3>
            <p className="text-sm text-slate-600">{specialist.profession}</p>
            <p className="text-xs text-slate-500">
              {(specialist.regionName || specialist.cityName) ?? 'Казахстан'} · {specialist.experienceYears}+ лет опыта
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <div className="flex flex-col">
            {formatRate(specialist.rateHour) && <span>Час: {formatRate(specialist.rateHour)}</span>}
            {formatRate(specialist.rateShift) && <span>Смена: {formatRate(specialist.rateShift)}</span>}
            {formatRate(specialist.rateMonth) && <span>Месяц: {formatRate(specialist.rateMonth)}</span>}
          </div>
          <div className="text-right text-xs text-slate-500">
            {specialist.rating ? (
              <span className="font-semibold text-amber-600">★ {specialist.rating.toFixed(1)}</span>
            ) : (
              <span>Нет отзывов</span>
            )}
            {specialist.reviewsCount ? <div>{specialist.reviewsCount} отзывов</div> : <div>Будьте первым</div>}
            <div>{specialist.hasEquipment ? 'Со своей техникой' : 'Без техники'}</div>
          </div>
        </div>
        <PromoBadgeGroup promotions={specialist.promotionTypes} />
      </Link>
    </article>
  );
}
