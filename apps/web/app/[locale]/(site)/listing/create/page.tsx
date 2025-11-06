import { LISTING_CATEGORIES } from '@texnikakz/shared/constants/domains';
import { notFound } from 'next/navigation';
import { ListingCreateForm } from './_components/listing-create-form';

export const dynamic = 'force-dynamic';

const regions = [
  { value: 'astana', label: 'Астана' },
  { value: 'almaty', label: 'Алматы' },
  { value: 'shymkent', label: 'Шымкент' },
  { value: 'karaganda', label: 'Караганда' },
  { value: 'aktobe', label: 'Актобе' }
];

export default function CreateListingPage({ params }: { params: { locale: string } }) {
  if (!params.locale) {
    notFound();
  }

  const categoryOptions = LISTING_CATEGORIES.map((category) => ({
    value: category,
    label: category
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-900">Размещение объявления</h1>
        <p className="text-sm text-slate-600">
          Заполните информацию о спецтехнике, загрузите медиа и отправьте объявление на модерацию. Вы сможете сохранить черновик
          и вернуться позже.
        </p>
      </div>
      <ListingCreateForm locale={params.locale} categories={categoryOptions} regions={regions} />
    </div>
  );
}
