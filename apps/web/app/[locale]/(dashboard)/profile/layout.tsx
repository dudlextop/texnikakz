import { ProfileSidebar } from './_components/sidebar.client';

export default function ProfileLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-10">
      <ProfileSidebar locale={params.locale} />
      <section className="flex-1 space-y-6">{children}</section>
    </div>
  );
}
