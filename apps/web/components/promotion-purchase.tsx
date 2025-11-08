'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { apiFetch } from '../lib/api-client';
import type { Order, PayOrderMode, PricingPlan, PromotionSubjectType } from '../types';

interface PromotionPurchaseButtonProps {
  locale: string;
  subjectId: string;
  subjectType: PromotionSubjectType;
  variant?: 'listing' | 'specialist';
}

type ModalState = 'closed' | 'loading' | 'ready' | 'processing' | 'success' | 'error';

export function PromotionPurchaseButton({ locale, subjectId, subjectType, variant = 'listing' }: PromotionPurchaseButtonProps) {
  const router = useRouter();
  const t = useTranslations('billing.promote');
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PayOrderMode>('wallet');
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen || modalState !== 'closed') {
      return;
    }
    setModalState('loading');
    setErrorMessage(null);
    apiFetch<PricingPlan[]>('/billing/pricing/plans')
      .then((response) => {
        setPlans(response.filter((plan) => plan.active));
        setModalState('ready');
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('401')) {
          setErrorMessage(t('loginRequired'));
        } else {
          setErrorMessage(t('loadError'));
        }
        setModalState('error');
      });
  }, [isOpen, modalState, t]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null);
      setPaymentMode('wallet');
      setOrder(null);
      setErrorMessage(null);
      setModalState('closed');
    }
  }, [isOpen]);

  const formattedPlans = useMemo(() => {
    return plans
      .slice()
      .sort((a, b) => a.priceKzt - b.priceKzt)
      .map((plan) => ({
        ...plan,
        lowerCode: plan.code.toLowerCase() as 'vip' | 'top' | 'highlight'
      }));
  }, [plans]);

  const triggerLabel = variant === 'listing' ? t('buttonListing') : t('buttonSpecialist');

  const handlePurchase = () => {
    if (!selectedPlan) {
      setErrorMessage(t('selectPlanError'));
      return;
    }
    setErrorMessage(null);
    setModalState('processing');
    startTransition(async () => {
      try {
        const createdOrder = await apiFetch<Order>('/billing/orders', {
          method: 'POST',
          body: {
            items: [
              {
                subjectType,
                subjectId,
                planCode: selectedPlan
              }
            ]
          }
        });
        setOrder(createdOrder);
        const paidOrder = await apiFetch<Order>(`/billing/orders/${createdOrder.id}/pay`, {
          method: 'POST',
          body: { mode: paymentMode }
        });
        setOrder(paidOrder);
        setModalState('success');
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const normalized = message.toLowerCase();
        if (normalized.includes('401')) {
          setErrorMessage(t('loginRequired'));
        } else if (normalized.includes('insufficient')) {
          setErrorMessage(t('insufficientFunds'));
        } else {
          setErrorMessage(t('genericError'));
        }
        setModalState('error');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
      >
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              {t('close')}
            </button>

            {modalState === 'loading' && (
              <div className="space-y-3 text-center">
                <p className="text-lg font-semibold text-slate-900">{t('loadingTitle')}</p>
                <p className="text-sm text-slate-600">{t('loadingDescription')}</p>
              </div>
            )}

            {(modalState === 'ready' || modalState === 'processing' || modalState === 'error') && (
              <div className="space-y-5">
                <header className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-900">{t('title')}</h2>
                  <p className="text-sm text-slate-600">{t('description')}</p>
                </header>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">{t('selectPlan')}</p>
                  {formattedPlans.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      {t('noPlans')}
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                      {formattedPlans.map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          disabled={modalState === 'processing'}
                          onClick={() => setSelectedPlan(plan.code)}
                          className={clsx(
                            'rounded-2xl border px-4 py-3 text-left transition hover:border-blue-400 hover:shadow-sm',
                            selectedPlan === plan.code ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50'
                          )}
                        >
                          <p className="text-sm font-semibold text-slate-900">{t(`plans.${plan.lowerCode}`)}</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {new Intl.NumberFormat(locale === 'kk' ? 'kk-KZ' : 'ru-RU', {
                              style: 'currency',
                              currency: 'KZT',
                              maximumFractionDigits: 0
                            }).format(plan.priceKzt)}
                          </p>
                          <p className="text-xs text-slate-500">{t('duration', { days: plan.durationDays })}</p>
                          {plan.description && <p className="mt-2 text-xs text-slate-500">{plan.description}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">{t('payment.title')}</p>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="payment-mode"
                        value="wallet"
                        checked={paymentMode === 'wallet'}
                        onChange={() => setPaymentMode('wallet')}
                        disabled={modalState === 'processing'}
                      />
                      <span>{t('payment.wallet')}</span>
                    </label>
                    <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="payment-mode"
                        value="card"
                        checked={paymentMode === 'card'}
                        onChange={() => setPaymentMode('card')}
                        disabled={modalState === 'processing'}
                      />
                      <span>{t('payment.card')}</span>
                    </label>
                  </div>
                </div>

                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

                <button
                  type="button"
                  disabled={modalState === 'processing' || isPending}
                  onClick={handlePurchase}
                  className="w-full rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {modalState === 'processing' || isPending ? t('processing') : t('confirm')}
                </button>

                <p className="text-xs text-slate-500">
                  {t('legal')}{' '}
                  <Link href={`/${locale}/profile/orders`} className="text-blue-600 hover:underline">
                    {t('ordersLink')}
                  </Link>
                </p>
              </div>
            )}

            {modalState === 'success' && order && (
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-semibold text-emerald-600">{t('successTitle')}</h2>
                <p className="text-sm text-slate-600">{t('successDescription')}</p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <p>{t('successOrder', { id: order.id })}</p>
                  <p>{t('successExpires')}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <Link
                    href={`/${locale}/profile/orders`}
                    className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    {t('viewOrders')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
