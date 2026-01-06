
'use client';

import React, { useState, useEffect } from 'react';
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
  LogOut,
  Menu,
  X,
  CreditCard,
  FileText,
  TrendingUp,
  UserCheck,
  CalendarDays,
  Users2,
  MessageSquare
} from 'lucide-react';
import { getRoleDisplayName, getRoleBadgeColor } from '@/types/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function RoleBasedSidebar() {
  const { user, hasPermission, logout, isAdmin, isHost, isUser } = useAuth();
  const pathname = usePathname();
  
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop/tablet collapse
  const [isMobileOpen, setIsMobileOpen] = useState(false); // mobile slide-in

  if (!user) return null;

  /* ---------------- NAV DATA ---------------- */
  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
        { href: `/profile/${user._id}`, label: 'My Profile', icon: <User className="w-4 h-4" /> },
      ],
    },
  ];

  if (isUser) {
    navSections.push({
      title: 'My Activities',
      items: [
        {
          href: '/dashboard/user/my-bookings',
          label: 'My Bookings',
          icon: <CalendarDays className="w-4 h-4" />,
          requiredPermission: 'viewOwnBookings',
        },
        {
          href: '/dashboard/user/my-events',
          label: 'My Events',
          icon: <Calendar className="w-4 h-4" />,
        },
        
      ],
    });
  }

  if (isHost) {
    navSections.push(
      {
        title: 'Event Management',
        items: [
          { href: '/dashboard/host/events', label: 'My Events', icon: <Calendar className="w-4 h-4" />, requiredPermission: 'createEvents' },
          { href: '/dashboard/host/events/create', label: 'Create Event', icon: <UserPlus className="w-4 h-4" />, requiredPermission: 'createEvents' },
          { href: '/dashboard/host/participants', label: 'Participants', icon: <Users2 className="w-4 h-4" />, requiredPermission: 'viewOwnEventParticipants' },
        ],
      },
      {
        title: 'Financial',
        items: [
          { href: '/dashboard/host/earnings', label: 'Earnings', icon: <DollarSign className="w-4 h-4" />, requiredPermission: 'viewOwnEarnings' },
          { href: '/dashboard/host/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" />, requiredPermission: 'receivePayments' },
          { href: '/dashboard/host/analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
        ],
      }
    );
  }

  if (isAdmin) {
    navSections.push({
      title: 'Administration',
      items: [
        { href: '/dashboard/admin/users', label: 'Manage Users', icon: <Users className="w-4 h-4" />, requiredPermission: 'manageUsers' },
        { href: '/dashboard/admin/events', label: 'Manage Events', icon: <Settings className="w-4 h-4" />, requiredPermission: 'manageEvents' },
        { href: '/dashboard/admin/hosts', label: 'Manage Hosts', icon: <Shield className="w-4 h-4" />, requiredPermission: 'manageHosts' },
        { href: '/dashboard/admin/reviews', label: 'Reviews & Content', icon: <MessageSquare className="w-4 h-4" />, requiredPermission: 'manageReviews' },
        { href: '/dashboard/admin/analytics', label: 'System Analytics', icon: <BarChart3 className="w-4 h-4" />, requiredPermission: 'viewAnalytics' },
        { href: '/dashboard/admin/approvals', label: 'Host Approvals', icon: <UserCheck className="w-4 h-4" />, requiredPermission: 'approveHosts' },
      ],
    });
  }

  /* ---------------- HELPERS ---------------- */
  const isActive = (href: string) => href === pathname || (href !== '/' && pathname.startsWith(href));

  const renderNavItem = (item: NavItem) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return null;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center px-3 py-2.5 text-sm rounded-xl transition-all group',
          active ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'text-gray-600 hover:bg-gray-100',
          isCollapsed && 'justify-center'
        )}
      >
        {item.icon}
        {!isCollapsed && <span className="ml-3 flex-1">{item.label}</span>}
        {!isCollapsed && item.badge && <Badge className="ml-2 text-xs">{item.badge}</Badge>}
      </Link>
    );
  };

  /* ---------------- JSX ---------------- */
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu />
      </Button>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r flex flex-col transition-all duration-300 z-50',
          'fixed top-0 h-screen lg:sticky lg:top-0',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          'shadow-xl backdrop-blur-sm'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && <Link href="/events" className="font-bold text-lg">EventHub</Link>}
          <div className="flex items-center gap-2">
            {/* Desktop/Tablet: Only show collapse toggle on hover/focus */}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden lg:flex hover:bg-gray-100"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {/* Mobile/Tablet: Only show close button */}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsMobileOpen(false)} 
              className="lg:hidden hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map(section => (
            <div key={section.title}>
              {!isCollapsed && <h4 className="text-xs text-gray-400 font-bold uppercase mb-2">{section.title}</h4>}
              <div className="space-y-1">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t space-y-3">
          {!isCollapsed && (
            <>
              <div className="text-sm font-semibold truncate">{user.fullName}</div>
              <Badge className={getRoleBadgeColor(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </>
          )}
          <Button onClick={logout} variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
