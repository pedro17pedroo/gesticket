import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Organization {
  id: number;
  name: string;
  type: 'system_owner' | 'client_company';
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  tier?: string;
  isActive: boolean;
}

interface Department {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  parentDepartmentId?: number;
  managerId?: string;
  isActive: boolean;
}

interface TenantData {
  organizations: Organization[];
  departments: Department[];
  currentOrganization?: Organization;
  currentDepartment?: Department;
  loading: boolean;
  error?: string;
}

export function useTenant() {
  const { user } = useAuth();
  const [tenantData, setTenantData] = useState<TenantData>({
    organizations: [],
    departments: [],
    loading: true
  });

  useEffect(() => {
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  const fetchTenantData = async () => {
    try {
      setTenantData(prev => ({ ...prev, loading: true, error: undefined }));

      // Fetch organizations
      const orgResponse = await fetch('/api/organizations');
      const organizations = orgResponse.ok ? (await orgResponse.json()).data : [];

      // Fetch departments
      const deptResponse = await fetch('/api/departments');
      const departments = deptResponse.ok ? (await deptResponse.json()).data : [];

      // Find current organization and department
      const currentOrganization = organizations.find((org: Organization) => 
        org.id === user?.organizationId
      );
      const currentDepartment = departments.find((dept: Department) => 
        dept.id === user?.departmentId
      );

      setTenantData({
        organizations,
        departments,
        currentOrganization,
        currentDepartment,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch tenant data:', error);
      setTenantData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load tenant information'
      }));
    }
  };

  const switchOrganization = async (organizationId: number) => {
    // Only super users and system users can switch organizations
    if (!user?.isSuperUser && user?.organization?.type !== 'system_owner') {
      throw new Error('Insufficient permissions to switch organizations');
    }

    const organization = tenantData.organizations.find(org => org.id === organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    setTenantData(prev => ({
      ...prev,
      currentOrganization: organization,
      currentDepartment: undefined // Reset department when switching organization
    }));

    // Refresh departments for the new organization
    await fetchDepartments(organizationId);
  };

  const switchDepartment = async (departmentId: number) => {
    // Check if user can access this department
    if (!user?.isSuperUser && !user?.canCrossDepartments && 
        user?.departmentId !== departmentId) {
      throw new Error('Insufficient permissions to access this department');
    }

    const department = tenantData.departments.find(dept => dept.id === departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    setTenantData(prev => ({
      ...prev,
      currentDepartment: department
    }));
  };

  const fetchDepartments = async (organizationId?: number) => {
    try {
      const url = organizationId 
        ? `/api/departments?organizationId=${organizationId}`
        : '/api/departments';
      
      const response = await fetch(url);
      if (response.ok) {
        const departments = (await response.json()).data;
        setTenantData(prev => ({
          ...prev,
          departments
        }));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const canAccessOrganization = (organizationId: number): boolean => {
    if (user?.isSuperUser || user?.canCrossOrganizations) {
      return true;
    }
    return user?.organizationId === organizationId;
  };

  const canAccessDepartment = (departmentId: number): boolean => {
    if (user?.isSuperUser || user?.canCrossOrganizations) {
      return true;
    }
    
    const department = tenantData.departments.find(d => d.id === departmentId);
    if (!department) return false;

    if (user?.canCrossDepartments && user?.organizationId === department.organizationId) {
      return true;
    }

    return user?.departmentId === departmentId;
  };

  const getUserAccessibleOrganizations = (): Organization[] => {
    if (user?.isSuperUser || user?.canCrossOrganizations) {
      return tenantData.organizations;
    }
    
    return tenantData.organizations.filter(org => 
      org.id === user?.organizationId
    );
  };

  const getUserAccessibleDepartments = (organizationId?: number): Department[] => {
    let departments = tenantData.departments;
    
    if (organizationId) {
      departments = departments.filter(dept => dept.organizationId === organizationId);
    }

    if (user?.isSuperUser || user?.canCrossOrganizations) {
      return departments;
    }

    if (user?.canCrossDepartments && user?.organizationId) {
      return departments.filter(dept => dept.organizationId === user.organizationId);
    }

    return departments.filter(dept => dept.id === user?.departmentId);
  };

  const isSystemUser = (): boolean => {
    return user?.organization?.type === 'system_owner' || user?.isSuperUser;
  };

  const isClientUser = (): boolean => {
    return user?.organization?.type === 'client_company' && !user?.isSuperUser;
  };

  return {
    ...tenantData,
    fetchTenantData,
    switchOrganization,
    switchDepartment,
    fetchDepartments,
    canAccessOrganization,
    canAccessDepartment,
    getUserAccessibleOrganizations,
    getUserAccessibleDepartments,
    isSystemUser,
    isClientUser
  };
}