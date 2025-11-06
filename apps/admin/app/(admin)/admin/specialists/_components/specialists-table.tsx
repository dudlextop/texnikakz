'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable, DataTableFilters, type DataTableColumn } from '@/components/data-table';

interface SpecialistRow {
  id: string;
  name: string;
  profession: string;
  city: string;
  experience: number;
  rating: number | null;
}

const COLUMNS: DataTableColumn<SpecialistRow>[] = [
  {
    key: 'name',
    header: 'Специалист',
    render: (row) => (
      <div className="space-y-1">
        <Link href={`/admin/specialists?id=${row.id}`} className="font-medium text-slate-50 hover:underline">
          {row.name}
        </Link>
        <p className="text-xs text-slate-400">{row.profession}</p>
      </div>
    ),
  },
  {
    key: 'city',
    header: 'Город',
    render: (row) => <span className="text-sm text-slate-300">{row.city}</span>,
  },
  {
    key: 'experience',
    header: 'Опыт',
    render: (row) => <span className="text-sm text-slate-300">{row.experience} лет</span>,
    align: 'center',
  },
  {
    key: 'rating',
    header: 'Рейтинг',
    render: (row) => <span className="text-sm text-slate-300">{row.rating ?? '—'}</span>,
    align: 'right',
  },
];

export function SpecialistsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    profession: 'all',
    city: '',
    query: '',
  });

  const rows: SpecialistRow[] = [];

  const handleReset = () => {
    setFilters({ profession: 'all', city: '', query: '' });
    setPage(1);
  };

  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      loading={false}
      emptyMessage="Специалисты не найдены"
      page={page}
      pageSize={20}
      total={rows.length}
      onPageChange={setPage}
      header={<h2 className="text-lg font-semibold text-slate-100">Специалисты</h2>}
      filters={
        <DataTableFilters onReset={handleReset}>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Поиск
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="ФИО, телефон"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Профессия
            <select
              value={filters.profession}
              onChange={(event) => setFilters((prev) => ({ ...prev, profession: event.target.value }))}
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="all">Все</option>
              <option value="operator">Оператор/машинист</option>
              <option value="crane">Оператор крана</option>
              <option value="excavator">Экскаваторщик</option>
              <option value="bulldozer">Бульдозерист</option>
              <option value="tractor">Тракторист</option>
              <option value="dumptruck">Водитель самосвала</option>
              <option value="mechanic">Механик</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Город
            <input
              value={filters.city}
              onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Астана"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
        </DataTableFilters>
      }
    />
  );
}
