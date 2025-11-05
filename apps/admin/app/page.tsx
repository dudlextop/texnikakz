export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold">Добро пожаловать в панель управления Texnika.kz</h2>
        <p className="mt-2 text-sm text-slate-300">
          Здесь появятся модули модерации объявлений, обработки жалоб, управления специалистами и биллингом.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Модерация',
            description: 'Очередь объявлений и специалистов, статусы, причины отклонения.'
          },
          {
            title: 'Платные услуги',
            description: 'Управление тарифами VIP/TOP/Highlight/Autobump и пакетами дилеров.'
          },
          {
            title: 'Мониторинг',
            description: 'Метрики, логи, статус очередей и интеграций (Sentry, OpenSearch, Redis).'
          }
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="text-lg font-semibold text-slate-100">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{card.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
