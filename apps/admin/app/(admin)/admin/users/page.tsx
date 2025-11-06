import { UsersTable } from './_components/users-table';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Пользователи и роли</h1>
        <p className="text-sm text-slate-400">
          Просматривайте роли пользователей, назначайте модераторов и управляйте доступом.
        </p>
      </header>
      <UsersTable />
    </div>
  );
}
