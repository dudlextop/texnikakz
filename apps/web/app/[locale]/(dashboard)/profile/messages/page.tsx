import Link from 'next/link';
import type { ReactNode } from 'react';
import { serverApiFetch } from '../../../../../lib/server-api';

export const dynamic = 'force-dynamic';

interface ConversationDto {
  id: string;
  listingId?: string | null;
  specialistId?: string | null;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    id: string;
    senderUserId: string;
    body: string;
    createdAt: string;
  } | null;
}

export default async function ProfileMessagesPage({ params }: { params: { locale: string } }) {
  const conversations = await serverApiFetch<ConversationDto[]>('/conversations').catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Сообщения</h1>
        <p className="text-sm text-slate-600">
          Просматривайте диалоги с покупателями и операторами, отвечайте оперативно, чтобы повысить конверсию.
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          title="Чатов пока нет"
          description="Первые диалоги появятся после того, как пользователи начнут писать по вашим объявлениям."
          action={
            <Link href={`/${params.locale}/listings`} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Перейти в каталог
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Диалог #{conversation.id.slice(0, 8)}</span>
                <span>{new Date(conversation.updatedAt).toLocaleString('ru-RU')}</span>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {conversation.listingId && <div>По объявлению: {conversation.listingId}</div>}
                {conversation.specialistId && <div>По специалисту: {conversation.specialistId}</div>}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {conversation.lastMessage ? (
                  <>
                    <p className="font-semibold text-slate-900">
                      Сообщение от {conversation.lastMessage.senderUserId.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-slate-700">{conversation.lastMessage.body}</p>
                  </>
                ) : (
                  <p className="text-slate-500">Диалог создан, но сообщений пока нет.</p>
                )}
              </div>
              <div className="mt-3 flex gap-3 text-sm">
                <button className="rounded-full border border-slate-300 px-4 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-600">
                  Открыть чат
                </button>
                <button className="rounded-full border border-slate-300 px-4 py-1 text-slate-600 hover:border-red-300 hover:text-red-600">
                  Завершить диалог
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white px-10 py-16 text-center text-slate-600">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="max-w-md text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}
