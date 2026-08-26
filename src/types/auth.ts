export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  avatarUrl: string | null;
}
