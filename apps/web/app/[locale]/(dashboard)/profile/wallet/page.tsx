import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { serverApiFetch } from '../../../../../lib/server-api';
import type { Wallet } from '../../../../../types';
import { WalletTopUpForm } from './_components/wallet-topup-form.client';

export const dynamic = 'force-dynamic';

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

export default async function WalletPage({ params }: { params: { locale: string } }) {
  const localeTag = params.locale === 'kk' ? 'kk-KZ' : 'ru-RU';
  const wallet = await serverApiFetch<Wallet>('/billing/wallet/me').catch(() => null);
  const tWallet = await getTranslations({ namespace: 'billing.wallet' });
  const tCommon = await getTranslations({ namespace: 'billing.common' });

  if (!wallet) {
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

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{tWallet('title')}</h1>
            <p className="mt-2 text-sm text-slate-600">{tWallet('description')}</p>
            <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-4 text-slate-900">
              <p className="text-sm text-slate-600">{tWallet('balance')}</p>
              <p className="mt-1 text-3xl font-semibold">{formatCurrency(wallet.balanceKzt, localeTag)}</p>
            </div>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{tWallet('topup.title')}</h2>
            <WalletTopUpForm />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{tWallet('transactions.title')}</h2>
          <Link href={`/${params.locale}/profile/orders`} className="text-sm font-semibold text-blue-600 hover:underline">
            {tWallet('transactions.viewOrders')}
          </Link>
        </div>
        {wallet.transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {tWallet('transactions.empty')}
          </p>
        ) : (
          <ul className="space-y-3">
            {wallet.transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tWallet(`transactions.types.${transaction.type.toLowerCase() as 'debit' | 'credit' | 'refund' | 'adjust'}`)}
                  </p>
                  {transaction.orderId && (
                    <p className="text-xs text-slate-500">{tWallet('transactions.order', { id: transaction.orderId })}</p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      transaction.type === 'DEBIT' ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {transaction.type === 'DEBIT' ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.amountKzt), localeTag)}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(transaction.createdAt, localeTag)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
