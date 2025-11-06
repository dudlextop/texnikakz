import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/navigation/admin-sidebar';
import { TopNav } from '@/components/navigation/top-nav';
import { QueryProvider } from '@/components/providers/query-provider';
import { getSessionUser } from '@/lib/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const currentUser = await getSessionUser();

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) {
    redirect(`/login?redirect=${encodeURIComponent('/admin/dashboard')}`);
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar currentUser={currentUser} />
      <div className="flex flex-1 flex-col">
        <TopNav currentUser={currentUser} />
        <QueryProvider>
          <main className="flex-1 bg-slate-900/40 px-8 py-6">{children}</main>
        </QueryProvider>
      </div>
    </div>
  );
}
