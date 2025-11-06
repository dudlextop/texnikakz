'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface SearchBarProps {
  placeholder?: string;
  queryKey?: string;
  targetPath?: string;
  onSubmit?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Поиск техники и специалистов', queryKey = 'q', targetPath, onSubmit }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get(queryKey) ?? '');
  const [isPending, startTransition] = useTransition();

  const submit = (nextValue: string) => {
    if (onSubmit) {
      onSubmit(nextValue);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set(queryKey, nextValue);
    } else {
      params.delete(queryKey);
    }

    startTransition(() => {
      const qs = params.toString();
      if (targetPath) {
        router.push(qs ? `${targetPath}?${qs}` : targetPath);
      } else {
        router.push(qs ? `?${qs}` : '?');
      }
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(value.trim());
      }}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
    >
      <svg
        aria-hidden
        className="h-5 w-5 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.25 5.25a7.5 7.5 0 0011.4 11.4z" />
      </svg>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            submit('');
          }}
          className="text-xs font-medium text-slate-500 hover:text-blue-600"
        >
          Очистить
        </button>
      )}
      <button
        type="submit"
        className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        disabled={isPending}
      >
        Найти
      </button>
    </form>
  );
}
