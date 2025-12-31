export type UserRole = 'user' | 'host' | 'admin';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  averageRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  isApproved?: boolean; // For hosts
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  can: {
    // User permissions
    viewEvents: boolean;
    joinEvents: boolean;
    leaveEvents: boolean;
    viewOwnProfile: boolean;
    editOwnProfile: boolean;
    viewOwnBookings: boolean;
    
    // Host permissions
    createEvents: boolean;
    editOwnEvents: boolean;
    deleteOwnEvents: boolean;
    viewOwnEventParticipants: boolean;
    manageOwnEventBookings: boolean;
    receivePayments: boolean;
    viewOwnEarnings: boolean;
    
    // Admin permissions
    manageUsers: boolean;
    manageEvents: boolean;
    manageHosts: boolean;
    moderateContent: boolean;
    viewAnalytics: boolean;
    approveHosts: boolean;
    viewSystemStats: boolean;
  };
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  role?: 'user' | 'host';
}

export const rolePermissions: Record<UserRole, Permission> = {
  user: {
    can: {
      // User permissions
      viewEvents: true,
      joinEvents: true,
      leaveEvents: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewOwnBookings: true,
      
      // Host permissions
      createEvents: false,
      editOwnEvents: false,
      deleteOwnEvents: false,
      viewOwnEventParticipants: false,
      manageOwnEventBookings: false,
      receivePayments: false,
      viewOwnEarnings: false,
      
      // Admin permissions
      manageUsers: false,
      manageEvents: false,
      manageHosts: false,
      moderateContent: false,
      viewAnalytics: false,
      approveHosts: false,
      viewSystemStats: false,
    },
  },
  
  host: {
    can: {
      // User permissions
      viewEvents: true,
      joinEvents: true,
      leaveEvents: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewOwnBookings: true,
      
      // Host permissions
      createEvents: true,
      editOwnEvents: true,
      deleteOwnEvents: true,
      viewOwnEventParticipants: true,
      manageOwnEventBookings: true,
      receivePayments: true,
      viewOwnEarnings: true,
      
      // Admin permissions
      manageUsers: false,
      manageEvents: false,
      manageHosts: false,
      moderateContent: false,
      viewAnalytics: false,
      approveHosts: false,
      viewSystemStats: false,
    },
  },
  
  admin: {
    can: {
      // User permissions
      viewEvents: true,
      joinEvents: true,
      leaveEvents: true,
      viewOwnProfile: true,
      editOwnProfile: true,
      viewOwnBookings: true,
      
      // Host permissions - Admins cannot create events, only manage them
      createEvents: false,
      editOwnEvents: false,
      deleteOwnEvents: false,
      viewOwnEventParticipants: true,
      manageOwnEventBookings: false,
      receivePayments: false,
      viewOwnEarnings: false,
      
      // Admin permissions
      manageUsers: true,
      manageEvents: true,
      manageHosts: true,
      moderateContent: true,
      viewAnalytics: true,
      approveHosts: true,
      viewSystemStats: true,
    },
  },
};

export function hasPermission(user: User | null, permission: keyof Permission['can']): boolean {
  if (!user) return false;
  return rolePermissions[user.role]?.can[permission] || false;
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'User';
    case 'host':
      return 'Event Host';
    case 'admin':
      return 'Administrator';
    default:
      return 'Unknown';
  }
}

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'bg-blue-100 text-blue-800';
    case 'host':
      return 'bg-purple-100 text-purple-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
