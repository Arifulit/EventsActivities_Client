'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Permission } from '@/types/auth';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: keyof Permission['can'];
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specific permission guards for convenience
export function CanCreateEvents({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard permission="createEvents" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanManageUsers({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard permission="manageUsers" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function CanViewAnalytics({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGuard permission="viewAnalytics" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
