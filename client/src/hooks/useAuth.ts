import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  companyId?: number;
  managerId?: string;
  departmentId?: number;
  organizationId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  organization?: {
    id: number;
    name: string;
    type: 'system_owner' | 'client_company';
  };
  department?: {
    id: number;
    name: string;
  };
  isSuperUser?: boolean;
  canCrossOrganizations?: boolean;
  canCrossDepartments?: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Enhanced user with tenant information
  const effectiveUser: User | undefined = user;

  const isAuthenticated = !!effectiveUser && !error;

  const logout = () => {
    window.location.href = '/api/logout';
  };

  return {
    user: effectiveUser,
    isAuthenticated,
    isLoading,
    logout,
  };
}
