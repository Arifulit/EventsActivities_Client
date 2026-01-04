'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/types/auth';
import {
  Calendar,
  Users,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Settings,
  Shield,
  Briefcase,
  Home,
  Bell,
  AlertTriangle,
  Crown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNavigation = () => {
    if (!user) {
      return [
        { name: 'Explore Events', href: '/events', icon: Calendar },
        { name: 'Become a Host', href: '/become-host', icon: Briefcase },
      ];
    }

    if (user.role === 'user') {
      return [
        { name: 'Explore Events', href: '/events', icon: Calendar },
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Events', href: '/dashboard/user/my-bookings', icon: Calendar },
        { name: 'Profile', href: `/profile/${user._id}`, icon: User },
      ];
    }

    if (user.role === 'host') {
      return [
        { name: 'Explore Events', href: '/events', icon: Calendar },
        { name: 'Dashboard', href: '/dashboard', icon: Crown },
        { name: 'My Events', href: '/dashboard/host/events', icon: Calendar },
        { name: 'Profile', href: `/profile/${user._id}`, icon: User },
      ];
    }

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Shield },
        { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Manage Events', href: '/dashboard/admin/events', icon: Calendar },
        { name: 'Profile', href: `/profile/${user._id}`, icon: User },
      ];
    }

    return [];
  };

  const navigation = getNavigation();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50' 
        : 'bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur border-b border-slate-700/30'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                EventHub
              </span>
              <span className="text-xs text-slate-400 group-hover:text-emerald-300 transition-colors duration-300 hidden sm:block">
                Discover Amazing Events
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.name}</span>
                <span className="lg:hidden">{item.name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {/* Search */}
      

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </Button>

            {user ? (
              <>
                {/* Create Event Button - Only for hosts */}
                {user.role === 'host' && (
                  <Link href="/dashboard/host/events/create">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 border border-emerald-400/20">
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Create Event</span>
                      <span className="sm:hidden">Create</span>
                    </Button>
                  </Link>
                )}

                {/* Logout Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 hover:shadow-md transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 hover:shadow-md transition-all duration-200">
                    <span className="hidden sm:inline">Login</span>
                    <span className="sm:hidden">Sign In</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 border border-emerald-400/20">
                    <span className="hidden sm:inline">Register</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md transition-all duration-200"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="xl:hidden border-t border-slate-700/50 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-md">
          <div className="px-3 sm:px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
            {/* User Info */}
            {user && (
              <div className="px-3 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg mb-4 border border-emerald-500/20">
                <div className="font-medium text-white">{user.fullName}</div>
                <div className="text-sm text-slate-300">{user.email}</div>
                <div className="text-xs text-emerald-400 mt-1 capitalize font-medium">{user.role}</div>
              </div>
            )}

            {/* Navigation */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md'
                }`}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-700/50 space-y-3">
              {user ? (
                <>
                  {user.role === 'host' && (
                    <Link href="/dashboard/host/events/create" onClick={() => setOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 border border-emerald-400/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 hover:shadow-md transition-all duration-200"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full text-slate-300 border-slate-600 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 hover:shadow-md transition-all duration-200">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 border border-emerald-400/20">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
