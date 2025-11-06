'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MediaUpload } from '../../../../../components';
import type { UploadedMediaItem } from '../../../../../types';
import { useAttachMedia, useListingMutation, useMediaPresign } from '../../../../../lib/hooks';

const schema = z.object({
  title: z.string().min(5, 'Минимум 5 символов'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  description: z.string().min(20, 'Расскажите подробнее о технике'),
  region: z.string().min(1, 'Выберите регион'),
  city: z.string().min(1, 'Укажите город'),
  price: z.coerce.number().positive('Введите корректную цену'),
  year: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value == null || (value >= 1950 && value <= new Date().getFullYear()), {
      message: 'Некорректный год'
    }),
  sellerType: z.enum(['private', 'dealer']).default('private'),
  vatIncluded: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

interface SelectOption {
  value: string;
  label: string;
}

interface ListingCreateFormProps {
  locale: string;
  categories: SelectOption[];
  regions: SelectOption[];
}

export function ListingCreateForm({ locale, categories, regions }: ListingCreateFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sellerType: 'private',
      vatIncluded: true
    }
  });

  const listingMutation = useListingMutation();
  const mediaPresign = useMediaPresign();
  const attachMedia = useAttachMedia();

  const [mediaItems, setMediaItems] = useState<UploadedMediaItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (values: FormValues, status: 'draft' | 'pending') => {
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const payload = {
        title: values.title,
        categoryId: values.categoryId,
        description: values.description,
        region: values.region,
        city: values.city,
        priceKzt: values.price,
        priceCurrency: 'KZT',
        year: values.year,
        sellerType: values.sellerType,
        status,
        params: {
          vatIncluded: values.vatIncluded ?? false
        }
      };

      const listing = await listingMutation.mutateAsync({ method: 'POST', payload });
      if (!listing?.id) {
        throw new Error('Не удалось создать объявление');
      }

      if (mediaItems.length > 0) {
        await Promise.all(
          mediaItems.map((item) =>
            attachMedia.mutateAsync({
              bucket: item.bucket,
              objectKey: item.objectKey,
              listingId: listing.id,
              url: item.url,
              previewUrl: item.previewUrl ?? item.url
            })
          )
        );
      }

      setStatusMessage(status === 'draft' ? 'Черновик сохранён' : 'Объявление отправлено на модерацию');
      setMediaItems([]);
      form.reset({ sellerType: values.sellerType, vatIncluded: values.vatIncluded });
      if (status === 'pending') {
        router.push(`/${locale}/profile/listings`);
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Произошла ошибка при сохранении');
    }
  };

  const handleSubmit = form.handleSubmit((values) => submit(values, 'pending'));
  const handleSaveDraft = form.handleSubmit((values) => submit(values, 'draft'));

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      {statusMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{statusMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Название</span>
          <input
            type="text"
            {...form.register('title')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Экскаватор Hitachi ZX200"
          />
          <FormError message={form.formState.errors.title?.message} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Категория</span>
          <select
            {...form.register('categoryId')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <FormError message={form.formState.errors.categoryId?.message} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Регион</span>
          <select
            {...form.register('region')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Выберите регион</option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
          <FormError message={form.formState.errors.region?.message} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Город</span>
          <input
            type="text"
            {...form.register('city')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Астана"
          />
          <FormError message={form.formState.errors.city?.message} />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Описание</span>
        <textarea
          {...form.register('description')}
          className="min-h-[160px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Опишите техническое состояние, комплектацию, дополнительные услуги."
        />
        <FormError message={form.formState.errors.description?.message} />
      </label>

      <div className="grid gap-6 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Цена, ₸</span>
          <input
            type="number"
            min={0}
            {...form.register('price')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <FormError message={form.formState.errors.price?.message} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Год выпуска</span>
          <input
            type="number"
            min={1950}
            max={new Date().getFullYear()}
            {...form.register('year')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="2020"
          />
          <FormError message={form.formState.errors.year?.message} />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm text-slate-600">
          <input type="checkbox" {...form.register('vatIncluded')} className="h-4 w-4 rounded border-slate-300" />
          Цена включает НДС
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium text-slate-700">Тип продавца</span>
        <div className="flex gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input type="radio" value="private" {...form.register('sellerType')} /> Частное лицо
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="dealer" {...form.register('sellerType')} /> Дилер / компания
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Медиа</h2>
          <p className="text-sm text-slate-600">Загрузите до 15 фотографий или видео. Поддерживаются форматы JPG/PNG/WebP.</p>
        </div>
        <MediaUpload
          items={mediaItems}
          onItemsChange={setMediaItems}
          requestPresign={async (file) => {
            const response = await mediaPresign.mutateAsync(file);
            return { uploadUrl: response.url, bucket: response.bucket, objectKey: response.objectKey };
          }}
          onUploaded={(item) => item}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Отправляя объявление, вы соглашаетесь с правилами модерации и пользовательским соглашением.
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600"
            disabled={listingMutation.isPending || mediaPresign.isPending}
          >
            Сохранить черновик
          </button>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={listingMutation.isPending || mediaPresign.isPending}
          >
            Отправить на модерацию
          </button>
        </div>
      </div>
    </form>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-500">{message}</span>;
}
