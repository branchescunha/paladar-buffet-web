export interface AdminUser {
  id: string;
  name: string;
  commercialTitle: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  avatarUrl: string | null;
  mustChangePassword: boolean;
}
