export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  avatarUrl: string | null;
  mustChangePassword: boolean;
}
