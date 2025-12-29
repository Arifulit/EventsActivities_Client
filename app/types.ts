export type { User, UserRole, Permission, hasPermission } from '../types/auth';
export type { RegisterData } from '../types/auth';
export { rolePermissions, getRoleDisplayName, getRoleBadgeColor } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isHost: boolean;
  isUser: boolean;
}
