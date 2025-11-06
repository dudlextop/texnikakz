import { ListingsTable } from './_components/listings-table';

export default function AdminListingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Очередь объявлений</h1>
          <p className="text-sm text-slate-400">
            Управляйте статусами объявлений, применяйте модерацию и массовые действия.
          </p>
        </div>
      </header>
      <ListingsTable />
    </div>
  );
}
