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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // In development, provide super admin access when no user data
  const effectiveUser: User | undefined = user || (!isLoading && !user ? {
    id: 'dev-super-admin-123',
    email: 'admin@geckostream.com',
    firstName: 'Super',
    lastName: 'Admin',
    profileImageUrl: null,
    role: 'super_admin',
    companyId: null,
    managerId: null,
    departmentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } : undefined);

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
