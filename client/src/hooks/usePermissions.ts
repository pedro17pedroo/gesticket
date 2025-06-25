import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserPermissions {
  permissions: Permission[];
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (permissions: Array<{resource: string, action: string}>) => boolean;
}

export function usePermissions(): UserPermissions {
  const { user, isAuthenticated } = useAuth();
  
  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/user/permissions'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const hasPermission = (resource: string, action: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Super admin and admin roles have all permissions
    if (user.claims?.role === 'super_admin' || user.claims?.role === 'admin') return true;
    
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const hasAnyPermission = (requiredPermissions: Array<{resource: string, action: string}>): boolean => {
    return requiredPermissions.some(p => hasPermission(p.resource, p.action));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}