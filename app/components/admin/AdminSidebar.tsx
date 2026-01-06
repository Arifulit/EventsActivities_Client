'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { Badge } from '@/app/components/ui/badge';
import { User as UserType } from '@/types/auth';
import {
  Home,
  Users,
  User,
  Calendar,
  Shield,
  BarChart3,
  MessageSquare,
  UserCheck,
  Settings,
  TrendingUp,
  DollarSign,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  pathname: string;
  user?: UserType | null;
}

export default function AdminSidebar({ isOpen, mobileOpen, onMobileClose, pathname, user }: AdminSidebarProps) {
  
  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          href: '/dashboard/admin',
          label: 'Dashboard',
          icon: <Home className="w-5 h-5" />,
          description: 'System overview and analytics'
        },
        {
          href: `/profile/${user?._id || ''}`,
          label: 'My Profile',
          icon: <User className="w-5 h-5" />,
          description: 'View and edit your profile'
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          href: '/dashboard/admin/users',
          label: 'Users',
          icon: <Users className="w-5 h-5" />,
          description: 'Manage user accounts',
          badge: '245'
        },
        {
          href: '/dashboard/admin/hosts',
          label: 'Hosts',
          icon: <Shield className="w-5 h-5" />,
          description: 'Host management and approval',
          badge: '12'
        },
        {
          href: '/dashboard/admin/events',
          label: 'Events',
          icon: <Calendar className="w-5 h-5" />,
          description: 'Event management and moderation'
        },
        {
          href: '/dashboard/admin/reviews',
          label: 'Reviews & Content',
          icon: <MessageSquare className="w-5 h-5" />,
          description: 'Content moderation and reviews',
          badge: '3'
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          href: '/dashboard/admin/analytics',
          label: 'System Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Platform analytics and insights'
        },
        {
          href: '/dashboard/admin/approvals',
          label: 'Host Approvals',
          icon: <UserCheck className="w-5 h-5" />,
          description: 'Pending host applications'
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          href: '/dashboard/admin/settings',
          label: 'System Settings',
          icon: <Settings className="w-5 h-5" />,
          description: 'Platform configuration'
        },
        {
          href: '/dashboard/admin/logs',
          label: 'System Logs',
          icon: <FileText className="w-5 h-5" />,
          description: 'System activity logs'
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const active = isActive(item.href);
    
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          'group flex items-center px-3 py-2.5 text-sm rounded-xl transition-all duration-200 relative',
          active 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          !isOpen && 'justify-center'
        )}
      >
        <div className="flex items-center space-x-3">
          <span className={cn(
            'transition-colors duration-200',
            active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
          )}>
            {item.icon}
          </span>
          {isOpen && (
            <>
              <span className="flex-1 font-medium">{item.label}</span>
              {item.badge && (
                <Badge className={cn(
                  'text-xs',
                  active 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-red-500 text-white'
                )}>
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
        
        {/* Tooltip for collapsed state */}
        {!isOpen && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            <div className="font-medium">{item.label}</div>
            {item.description && (
              <div className="text-xs text-gray-300 mt-1">{item.description}</div>
            )}
            {item.badge && (
              <div className="text-xs text-yellow-400 mt-1">{item.badge} pending</div>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <button
              onClick={onMobileClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300',
        isOpen ? 'w-64' : 'w-16'
      )}>
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {isOpen && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map(renderNavItem)}
                </div>
              </div>
            ))}
          </nav>

          {/* Desktop Footer */}
          <div className="p-4 border-t border-gray-200">
            {isOpen ? (
              <div className="space-y-2">
                <Link
                  href="/help"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Help & Support</span>
                </Link>
                <button className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:text-red-700 rounded-lg transition-colors w-full">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex justify-center">
                  <LogOut className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
