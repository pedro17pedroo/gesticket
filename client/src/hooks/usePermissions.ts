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
  
  const { data: permissionsResponse } = useQuery<{ success: boolean; permissions: string[] }>({
    queryKey: ['/api/user/permissions'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const permissions = permissionsResponse?.permissions || [];

  const hasPermission = (resource: string, action: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Super admin users have all permissions
    if (user.role === 'super_admin' || user.isSuperUser) return true;
    
    // Check if permission exists in format "resource:action"
    const permissionName = `${resource}:${action}`;
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (requiredPermissions: Array<{resource: string, action: string}>): boolean => {
    return requiredPermissions.some(p => hasPermission(p.resource, p.action));
  };

  return {
    permissions: permissions.map(name => ({ 
      id: 0, 
      name, 
      resource: name.split(':')[0], 
      action: name.split(':')[1] 
    })),
    hasPermission,
    hasAnyPermission,
  };
}