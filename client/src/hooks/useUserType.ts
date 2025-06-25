import { useAuth } from './useAuth';

export type UserType = 'system_owner' | 'client_company' | 'guest';

export interface UserTypeInfo {
  type: UserType;
  isSystemUser: boolean;
  isClientUser: boolean;
  isSuperUser: boolean;
  canAccessMultiTenant: boolean;
  canAccessClientManagement: boolean;
  canAccessSystemDashboard: boolean;
  defaultRoute: string;
}

export function useUserType(): UserTypeInfo {
  const { user } = useAuth();

  if (!user) {
    return {
      type: 'guest',
      isSystemUser: false,
      isClientUser: false,
      isSuperUser: false,
      canAccessMultiTenant: false,
      canAccessClientManagement: false,
      canAccessSystemDashboard: false,
      defaultRoute: '/login'
    };
  }

  const isSystemUser = user.role === 'super_admin' || 
                      user.role === 'system_admin' || 
                      user.role === 'system_agent';

  const isClientUser = user.role === 'company_admin' || 
                      user.role === 'company_manager' || 
                      user.role === 'company_agent' || 
                      user.role === 'company_user';

  const isSuperUser = user.isSuperUser || user.role === 'super_admin';

  // Determinar tipo de usuário baseado na organização
  let userType: UserType = 'guest';
  if (isSystemUser) {
    userType = 'system_owner';
  } else if (isClientUser) {
    userType = 'client_company';
  }

  // Determinar rota padrão baseada no tipo de usuário
  let defaultRoute = '/';
  if (userType === 'system_owner' && isSuperUser) {
    defaultRoute = '/multi-tenant-dashboard';
  } else if (userType === 'client_company') {
    defaultRoute = '/dashboard';
  }

  return {
    type: userType,
    isSystemUser,
    isClientUser,
    isSuperUser,
    canAccessMultiTenant: isSystemUser && isSuperUser,
    canAccessClientManagement: isSystemUser,
    canAccessSystemDashboard: isSystemUser,
    defaultRoute
  };
}