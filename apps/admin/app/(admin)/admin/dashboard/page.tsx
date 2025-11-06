import { apiFetch } from '@/lib/api-client';
import type { AdminStatsOverview } from '@/types/stats';
import { MetricsGrid } from './_components/metrics-grid';
import { ActivityChart } from './_components/activity-chart';

export default async function AdminDashboardPage() {
  const stats = await apiFetch<AdminStatsOverview>('/admin/stats/overview');

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Сводка платформы</h1>
        <p className="text-sm text-slate-400">
          Контроль ключевых метрик Texnika.kz: публикации, модерация, дилеры и специалисты.
        </p>
      </header>
      <MetricsGrid counts={stats.counts} />
      <ActivityChart data={stats.activity} />
    </div>
  );
}
