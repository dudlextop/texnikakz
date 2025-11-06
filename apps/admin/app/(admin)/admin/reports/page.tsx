import { ReportsTable } from './_components/reports-table';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Жалобы и инциденты</h1>
        <p className="text-sm text-slate-400">
          Следите за жалобами пользователей, статусами расследования и принятыми мерами.
        </p>
      </header>
      <ReportsTable />
    </div>
  );
}
