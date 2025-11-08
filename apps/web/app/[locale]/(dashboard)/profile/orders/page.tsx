import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { serverApiFetch } from '../../../../../lib/server-api';
import type { Order } from '../../../../../types';

export const dynamic = 'force-dynamic';

const statusClassName: Record<Order['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-slate-200 text-slate-700 border-slate-300',
  FAILED: 'bg-red-100 text-red-700 border-red-200'
};

const statusKey: Record<Order['status'], string> = {
  PENDING: 'status.pending',
  PAID: 'status.paid',
  CANCELLED: 'status.cancelled',
  FAILED: 'status.failed'
};

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(date: string, locale: string) {
  const value = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(value);
}

export default async function OrdersPage({ params }: { params: { locale: string } }) {
  const localeTag = params.locale === 'kk' ? 'kk-KZ' : 'ru-RU';
  const orders = await serverApiFetch<Order[]>('/billing/orders/me').catch(() => null);
  const tOrders = await getTranslations({ namespace: 'billing.orders' });
  const tCommon = await getTranslations({ namespace: 'billing.common' });

  if (!orders) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{tCommon('loginTitle')}</h1>
        <p className="mt-2 text-sm text-slate-600">{tCommon('loginDescription')}</p>
        <Link
          href={`/${params.locale}/login`}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {tCommon('loginAction')}
        </Link>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{tOrders('title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{tOrders('empty.description')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={`/${params.locale}/listings`}
            className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            {tOrders('empty.listingsCta')}
          </Link>
          <Link
            href={`/${params.locale}/specialists`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {tOrders('empty.specialistsCta')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{tOrders('title')}</h1>
        <p className="text-sm text-slate-600">{tOrders('subtitle')}</p>
      </header>

      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{tOrders('orderNumber', { id: order.id })}</p>
                <p className="text-xs text-slate-500">{formatDate(order.createdAt, localeTag)}</p>
                {order.paidAt && (
                  <p className="text-xs text-emerald-600">{tOrders('paidAt', { date: formatDate(order.paidAt, localeTag) })}</p>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 text-right md:items-end">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName[order.status]}`}
                >
                  {tOrders(statusKey[order.status])}
                </span>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(order.totalKzt, localeTag)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">{tOrders('items.title')}</p>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {tOrders(`plans.${item.planCode.toLowerCase() as 'vip' | 'top' | 'highlight'}`)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tOrders(`subjects.${item.subjectType.toLowerCase() as 'listing' | 'specialist'}`, { id: item.subjectId })}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{formatCurrency(item.priceKzt, localeTag)}</p>
                      <p className="text-xs">{tOrders('items.duration', { days: item.durationDays })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {order.transactions && order.transactions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-slate-800">{tOrders('transactions.title')}</p>
                <ul className="space-y-1">
                  {order.transactions.map((transaction) => (
                    <li key={transaction.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm">
                      <span>{tOrders(`transactions.types.${transaction.type.toLowerCase() as 'debit' | 'credit' | 'refund' | 'adjust'}`)}</span>
                      <span>{formatCurrency(transaction.amountKzt, localeTag)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
