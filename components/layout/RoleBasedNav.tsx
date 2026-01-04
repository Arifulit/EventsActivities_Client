'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Settings, 
  DollarSign, 
  BarChart3, 
  Shield, 
  UserPlus,
  Home,
  User,
  LogOut
} from 'lucide-react';
import { getRoleDisplayName, getRoleBadgeColor } from '@/types/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: string;
  badge?: string;
}

export default function RoleBasedNav() {
  const { user, hasPermission, logout, isAdmin, isHost, isUser } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        href: '/events',
        label: 'Events',
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <Home className="w-4 h-4" />,
      },
      {
        href: '/profile',
        label: 'Profile',
        icon: <User className="w-4 h-4" />,
      },
    ];

    if (hasPermission('viewOwnBookings')) {
      baseItems.push({
        href: '/my-bookings',
        label: 'My Bookings',
        icon: <Calendar className="w-4 h-4" />,
      });
    }

    if (hasPermission('createEvents')) {
      baseItems.push({
        href: '/events/create',
        label: 'Create Event',
        icon: <UserPlus className="w-4 h-4" />,
      });
    }

    if (hasPermission('viewOwnEarnings')) {
      baseItems.push({
        href: '/earnings',
        label: 'Earnings',
        icon: <DollarSign className="w-4 h-4" />,
      });
    }

    if (hasPermission('viewAnalytics')) {
      baseItems.push({
        href: '/dashboard/admin/analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-4 h-4" />,
      });
    }

    if (hasPermission('manageUsers')) {
      baseItems.push({
        href: '/dashboard/admin/users',
        label: 'Manage Users',
        icon: <Users className="w-4 h-4" />,
        badge: 'Admin',
      });
    }

    if (hasPermission('manageEvents')) {
      baseItems.push({
        href: '/dashboard/admin/events',
        label: 'Manage Events',
        icon: <Settings className="w-4 h-4" />,
        badge: 'Admin',
      });
    }

    if (hasPermission('manageHosts')) {
      baseItems.push({
        href: '/dashboard/admin/hosts',
        label: 'Manage Hosts',
        icon: <Shield className="w-4 h-4" />,
        badge: 'Admin',
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/events" className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <Badge className={getRoleBadgeColor(user.role)}>
              {getRoleDisplayName(user.role)}
            </Badge>

            {/* User Name */}
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user.fullName}
            </span>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
