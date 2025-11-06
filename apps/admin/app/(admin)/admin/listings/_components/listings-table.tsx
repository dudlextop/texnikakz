'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DataTable, DataTableFilters, type DataTableColumn } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { apiFetch } from '@/lib/api-client';
import type { AdminListingListResponse, AdminListingSummary } from '@/types/listings';

const PAGE_SIZE = 20;

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F-]{36}$/.test(value);
}

const COLUMNS: DataTableColumn<AdminListingSummary>[] = [
  {
    key: 'title',
    header: 'Объявление',
    render: (row) => (
      <div className="space-y-1">
        <Link href={`/admin/listings/${row.id}`} className="font-medium text-slate-50 hover:underline">
          {row.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <StatusBadge status={row.status.toLowerCase()} />
          {row.dealerName ? <span>{row.dealerName}</span> : <span>Частный продавец</span>}
        </div>
      </div>
    ),
  },
  {
    key: 'city',
    header: 'Город',
    render: (row) => <span className="text-sm text-slate-300">{row.cityName ?? '—'}</span>,
  },
  {
    key: 'price',
    header: 'Цена',
    render: (row) => <span className="text-sm text-slate-300">{row.priceKzt ? `${Number(row.priceKzt).toLocaleString()} ₸` : '—'}</span>,
    align: 'right',
  },
  {
    key: 'updatedAt',
    header: 'Обновлено',
    render: (row) => <span className="text-sm text-slate-400">{new Date(row.updatedAt).toLocaleString()}</span>,
    align: 'right',
  },
];

export function ListingsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    dealer: '',
    city: '',
    query: '',
  });

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    };
    if (filters.query.trim()) {
      params.q = filters.query.trim();
    }
    if (filters.status !== 'all') {
      params.status = filters.status.toUpperCase();
    }
    if (filters.dealer && isUuid(filters.dealer.trim())) {
      params.dealerId = filters.dealer.trim();
    }
    if (filters.city && isUuid(filters.city.trim())) {
      params.cityId = filters.city.trim();
    }
    return params;
  }, [filters, page]);

  const { data, isFetching } = useQuery<AdminListingListResponse>({
    queryKey: ['admin-listings', queryParams],
    queryFn: async () => apiFetch<AdminListingListResponse>('/admin/listings', { searchParams: queryParams }),
    keepPreviousData: true,
  });

  const handleReset = () => {
    setFilters({ status: 'all', dealer: '', city: '', query: '' });
    setPage(1);
  };

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <DataTable
      data={rows}
      columns={COLUMNS}
      loading={isFetching && !data}
      emptyMessage="Нет объявлений, соответствующих фильтрам"
      page={page}
      pageSize={PAGE_SIZE}
      total={total}
      onPageChange={(nextPage) => setPage(nextPage)}
      header={<h2 className="text-lg font-semibold text-slate-100">Объявления</h2>}
      filters={
        <DataTableFilters onReset={handleReset}>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Поиск
            <input
              type="search"
              value={filters.query}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, query: event.target.value }));
                setPage(1);
              }}
              placeholder="ID, название, телефон"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Статус
            <select
              value={filters.status}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, status: event.target.value }));
                setPage(1);
              }}
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            >
              <option value="all">Все</option>
              <option value="draft">Черновики</option>
              <option value="pending">На модерации</option>
              <option value="published">Опубликованы</option>
              <option value="rejected">Отклонены</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Дилер (ID)
            <input
              value={filters.dealer}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, dealer: event.target.value }));
                setPage(1);
              }}
              placeholder="UUID дилера"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
            Город (ID)
            <input
              value={filters.city}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, city: event.target.value }));
                setPage(1);
              }}
              placeholder="UUID города"
              className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
            />
          </label>
        </DataTableFilters>
      }
    />
  );
}
