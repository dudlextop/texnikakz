'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '../../../../../../lib/api-client';
import type { Wallet } from '../../../../../../types';

const MIN_TOPUP = 1000;

export function WalletTopUpForm() {
  const t = useTranslations('billing.wallet.topup');
  const router = useRouter();
  const [amount, setAmount] = useState<string>('10000');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedAmount = Number(amount.replace(/\s+/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount < MIN_TOPUP) {
      setError(t('errors.minAmount', { amount: MIN_TOPUP }));
      return;
    }

    startTransition(async () => {
      try {
        await apiFetch<Wallet>('/billing/wallet/topup', {
          method: 'POST',
          body: { amountKzt: Math.round(parsedAmount) }
        });
        setSuccess(t('success'));
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('401')) {
          setError(t('errors.unauthorized'));
          return;
        }
        setError(t('errors.generic'));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span>{t('amountLabel')}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={MIN_TOPUP}
            step={500}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
            placeholder={t('amountPlaceholder')}
          />
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">₸</span>
        </div>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
      <p className="text-xs text-slate-500">{t('hint')}</p>
    </form>
  );
}
