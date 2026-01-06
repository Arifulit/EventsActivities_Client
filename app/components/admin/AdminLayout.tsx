'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import { getRoleDisplayName, getRoleBadgeColor } from '@/types/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href: string }[];
}

export default function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  breadcrumbs = [] 
}: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!user) return null;

  return (
    <div className={cn(
      'min-h-screen bg-gray-50 transition-colors duration-300',
      darkMode && 'dark bg-gray-900'
    )}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        user={user}
      />

      {/* Main Content */}
      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      )}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <nav className="hidden md:flex items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      {index > 0 && (
                        <span className="text-gray-400">/</span>
                      )}
                      <span className={cn(
                        'transition-colors',
                        index === breadcrumbs.length - 1 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-500 hover:text-gray-700'
                      )}>
                        {crumb.label}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search admin panel..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-gray-500 hover:text-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="text-gray-500 hover:text-gray-700 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New host application</p>
                            <p className="text-xs text-gray-500">John Doe applied to become a host</p>
                            <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Review flagged</p>
                            <p className="text-xs text-gray-500">A review was flagged for moderation</p>
                            <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">System update</p>
                            <p className="text-xs text-gray-500">Platform updated to v2.1.0</p>
                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Header */}
        {(title || subtitle) && (
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-600 text-sm sm:text-base">
                      {subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
