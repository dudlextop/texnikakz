'use client';

import { useState } from 'react';
import { DataTable, DataTableFilters, type DataTableColumn } from '@/components/data-table';

interface UserRow {
  id: string;
  phone: string;
  role: string;
  dealerId: string | null;
  lastLoginAt: string | null;
}

const COLUMNS: DataTableColumn<UserRow>[] = [
  {
    key: 'phone',
    header: 'Телефон',
    render: (row) => <span className="font-medium text-slate-100">{row.phone}</span>,
  },
  {
    key: 'role',
    header: 'Роль',
    render: (row) => <span className="text-xs uppercase tracking-wide text-slate-300">{row.role}</span>,
  },
  {
    key: 'dealerId',
    header: 'Дилер',
    render: (row) => <span className="text-sm text-slate-300">{row.dealerId ?? '—'}</span>,
  },
  {
    key: 'lastLoginAt',
    header: 'Последний вход',
    render: (row) => <span className="text-sm text-slate-400">{row.lastLoginAt ?? '—'}</span>,
    align: 'right',
  },
];

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    role: 'all',
    dealer: '',
    query: '',
  });

  const rows: UserRow[] = [];

  const handleReset = () => {
    setFilters({ role: 'all', dealer: '', query: '' });
    setPage(1);
  };

  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      loading={false}
      emptyMessage="Пользователи не найдены"
      page={page}
      pageSize={20}
      total={rows.length}
      onPageChange={setPage}
      header={<h2 className="text-lg font-semibold text-slate-100">Пользователи</h2>}
      filters={
        <DataTableFilters onReset={handleReset}>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Поиск
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="Телефон, ID"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Роль
            <select
              value={filters.role}
              onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="all">Все</option>
              <option value="user">Пользователь</option>
              <option value="dealer">Дилер</option>
              <option value="specialist">Специалист</option>
              <option value="moderator">Модератор</option>
              <option value="admin">Администратор</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Дилер
            <input
              value={filters.dealer}
              onChange={(event) => setFilters((prev) => ({ ...prev, dealer: event.target.value }))}
              placeholder="ID дилера"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
        </DataTableFilters>
      }
    />
  );
}
