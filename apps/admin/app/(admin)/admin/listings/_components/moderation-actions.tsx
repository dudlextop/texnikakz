'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

interface ModerationActionsProps {
  listingId: string;
  status: string;
}

export function ModerationActions({ listingId, status }: ModerationActionsProps) {
  const [reason, setReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const router = useRouter();

  const publishMutation = useMutation({
    mutationFn: async () => {
      await apiFetch(`/admin/listings/${listingId}/publish`, { method: 'POST', parseJson: false });
    },
    onSuccess: () => {
      setRejectOpen(false);
      setReason('');
      router.refresh();
      window?.alert?.('Объявление опубликовано');
    },
    onError: (error) => {
      console.error(error);
      window?.alert?.('Ошибка при публикации');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      await apiFetch(`/admin/listings/${listingId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      setRejectOpen(false);
      setReason('');
      router.refresh();
      window?.alert?.('Объявление отклонено');
    },
    onError: (error) => {
      console.error(error);
      window?.alert?.('Ошибка при отклонении');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => publishMutation.mutate()}
          disabled={publishMutation.isPending || status === 'published'}
          className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishMutation.isPending ? 'Публикация…' : 'Опубликовать'}
        </button>
        <button
          type="button"
          onClick={() => setRejectOpen(true)}
          disabled={rejectMutation.isPending}
          className="inline-flex items-center rounded-md border border-rose-500/60 bg-transparent px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Отклонить
        </button>
      </div>
      {rejectOpen ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <h4 className="text-sm font-semibold text-slate-100">Причина отклонения</h4>
          <p className="mt-1 text-xs text-slate-400">Укажите детали, чтобы продавец получил понятный фидбек.</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Например: недостаточно фото или отсутствует VIN"
            className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRejectOpen(false);
                setReason('');
              }}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-300 hover:bg-slate-800"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-50 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejectMutation.isPending ? 'Отправка…' : 'Отклонить' }
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
