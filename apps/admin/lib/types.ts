export type AdminRole = 'admin' | 'moderator' | 'dealer' | 'user';

export interface AdminUser {
  id: string;
  phone: string;
  role: AdminRole;
  dealerId: string | null;
  createdAt?: string;
}
