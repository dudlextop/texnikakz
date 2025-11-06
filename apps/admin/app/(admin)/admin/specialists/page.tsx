import { SpecialistsTable } from './_components/specialists-table';

export default function AdminSpecialistsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Специалисты платформы</h1>
        <p className="text-sm text-slate-400">
          Управляйте профилями операторов спецтехники, подтверждайте сертификаты и статусы.
        </p>
      </header>
      <SpecialistsTable />
    </div>
  );
}
