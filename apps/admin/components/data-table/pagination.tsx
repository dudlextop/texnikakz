'use client';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
      <span>
        Страница {page} из {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
