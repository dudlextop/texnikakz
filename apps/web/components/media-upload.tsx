'use client';

import { useCallback, useMemo, useState } from 'react';
import type { UploadedMediaItem } from '../types';

interface MediaUploadProps {
  items: UploadedMediaItem[];
  onItemsChange: (items: UploadedMediaItem[]) => void;
  requestPresign: (file: File) => Promise<{ uploadUrl: string; bucket: string; objectKey: string }>;
  onUploaded?: (item: UploadedMediaItem, file: File) => Promise<UploadedMediaItem | void> | UploadedMediaItem | void;
  maxItems?: number;
  accept?: string;
}

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'error';
  error?: string;
}

export function MediaUpload({
  items,
  onItemsChange,
  requestPresign,
  onUploaded,
  maxItems = 15,
  accept = 'image/*'
}: MediaUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({ progress: 0, status: 'idle' });

  const canAddMore = items.length < maxItems;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const selected = Array.from(files).slice(0, maxItems - items.length);
      let currentItems = items;

      for (const file of selected) {
        try {
          setUploadState({ status: 'uploading', progress: 5 });
          const { uploadUrl, bucket, objectKey } = await requestPresign(file);
          setUploadState({ status: 'uploading', progress: 30 });
          const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });
          if (!response.ok) {
            throw new Error('Не удалось загрузить файл');
          }
          setUploadState({ status: 'uploading', progress: 90 });
          const uploaded: UploadedMediaItem = {
            bucket,
            objectKey,
            url: `${uploadUrl.split('?')[0]}`,
            mimeType: file.type,
            size: file.size
          };
          let nextItem = uploaded;
          const result = await onUploaded?.(uploaded, file);
          if (result && typeof result === 'object') {
            nextItem = { ...uploaded, ...result };
          }
          currentItems = [...currentItems, nextItem];
          onItemsChange(currentItems);
          setUploadState({ status: 'idle', progress: 100 });
        } catch (error) {
          console.error(error);
          setUploadState({ status: 'error', progress: 0, error: (error as Error).message });
        }
      }
    },
    [items, maxItems, onItemsChange, onUploaded, requestPresign]
  );

  const previews = useMemo(() => items, [items]);

  return (
    <div className="space-y-4">
      <label
        className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 hover:border-blue-400"
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          multiple
          disabled={!canAddMore || uploadState.status === 'uploading'}
          onChange={(event) => handleFiles(event.target.files)}
        />
        <span className="text-base font-semibold text-slate-700">Загрузите фото или перетащите сюда</span>
        <span className="text-xs text-slate-500">Поддержка до {maxItems} файлов, JPG/PNG/HEIC/WebP, до 20 МБ</span>
        {!canAddMore && <span className="text-xs text-red-500">Достигнут лимит загрузок</span>}
        {uploadState.status === 'uploading' && (
          <span className="text-xs text-blue-600">Загрузка... {Math.round(uploadState.progress)}%</span>
        )}
        {uploadState.status === 'error' && (
          <span className="text-xs text-red-500">Ошибка: {uploadState.error ?? 'неизвестная ошибка'}</span>
        )}
      </label>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {previews.map((item) => (
            <figure key={item.objectKey} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
              {item.url ? (
                <img src={item.url} alt="" className="h-36 w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-36 items-center justify-center text-xs text-slate-400">Предпросмотр недоступен</div>
              )}
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[10px] text-white">
                {(() => {
                  const type = item.mimeType ?? 'image/jpeg';
                  const ext = type.includes('/') ? type.split('/')[1]?.toUpperCase() : type.toUpperCase();
                  const sizeMb = ((item.size ?? 0) / 1024 / 1024).toFixed(1);
                  return `${ext ?? 'FILE'} · ${sizeMb} МБ`;
                })()}
              </figcaption>
              <button
                type="button"
                onClick={() => onItemsChange(items.filter((existing) => existing.objectKey !== item.objectKey))}
                className="absolute right-2 top-2 hidden rounded-full bg-black/60 px-2 py-1 text-xs text-white group-hover:block"
              >
                Удалить
              </button>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
