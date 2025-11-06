'use client';

import { useState } from 'react';
import { DataTable, DataTableFilters, type DataTableColumn } from '@/components/data-table';

interface ReportRow {
  id: string;
  listingTitle: string;
  reporterPhone: string;
  reason: string;
  status: string;
  createdAt: string;
}

const COLUMNS: DataTableColumn<ReportRow>[] = [
  {
    key: 'listingTitle',
    header: 'Объявление',
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-slate-50">{row.listingTitle}</p>
        <p className="text-xs text-slate-500">#{row.id}</p>
      </div>
    ),
  },
  {
    key: 'reporterPhone',
    header: 'Жалоба от',
    render: (row) => <span className="text-sm text-slate-300">{row.reporterPhone}</span>,
  },
  {
    key: 'reason',
    header: 'Причина',
    render: (row) => <span className="text-sm text-slate-300">{row.reason}</span>,
  },
  {
    key: 'status',
    header: 'Статус',
    render: (row) => <span className="text-xs uppercase tracking-wide text-slate-300">{row.status}</span>,
    align: 'center',
  },
  {
    key: 'createdAt',
    header: 'Создано',
    render: (row) => <span className="text-sm text-slate-400">{row.createdAt}</span>,
    align: 'right',
  },
];

export function ReportsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    query: '',
  });

  const rows: ReportRow[] = [];

  const handleReset = () => {
    setFilters({ status: 'all', query: '' });
    setPage(1);
  };

  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      loading={false}
      emptyMessage="Жалобы не найдены"
      page={page}
      pageSize={20}
      total={rows.length}
      onPageChange={setPage}
      header={<h2 className="text-lg font-semibold text-slate-100">Жалобы</h2>}
      filters={
        <DataTableFilters onReset={handleReset}>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Поиск
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="ID, телефон"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Статус
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="review">В работе</option>
              <option value="closed">Закрыты</option>
            </select>
          </label>
        </DataTableFilters>
      }
    />
  );
}
