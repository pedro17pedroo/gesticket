import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Users, Ticket, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface OrganizationStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalDepartments: number;
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeCompanies: number;
}

interface OrganizationData {
  id: number;
  name: string;
  type: 'system_owner' | 'client_company';
  email?: string;
  departments?: Array<{
    id: number;
    name: string;
    users?: Array<{ id: string; firstName: string; lastName: string }>;
  }>;
  users?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
}

export default function MultiTenantDashboard() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);
  const [orgStats, setOrgStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.data || []);
        
        // Auto-select user's organization or first available
        if (data.data?.length > 0) {
          const userOrg = data.data.find((org: OrganizationData) => 
            org.id === user?.organizationId
          ) || data.data[0];
          setSelectedOrg(userOrg);
          fetchOrganizationStats(userOrg.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationStats = async (orgId: number) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setOrgStats(data.data?.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch organization stats:', error);
    }
  };

  const handleOrganizationSelect = (org: OrganizationData) => {
    setSelectedOrg(org);
    fetchOrganizationStats(org.id);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'system_admin': 'bg-purple-100 text-purple-800',
      'system_agent': 'bg-blue-100 text-blue-800',
      'company_admin': 'bg-green-100 text-green-800',
      'company_manager': 'bg-yellow-100 text-yellow-800',
      'company_agent': 'bg-cyan-100 text-cyan-800',
      'company_user': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getOrgTypeColor = (type: string) => {
    return type === 'system_owner' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Multi-Organizacional</h1>
          <p className="text-muted-foreground">
            Gestão completa de organizações, departamentos e acessos
          </p>
        </div>
        <Badge variant="outline" className={getRoleColor(user?.role || '')}>
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organizações
              </CardTitle>
              <CardDescription>
                {user?.isSuperUser ? 'Todas as organizações' : 'Sua organização'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrg?.id === org.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => handleOrganizationSelect(org)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{org.name}</h3>
                      <p className="text-sm text-muted-foreground">{org.email}</p>
                    </div>
                    <Badge className={getOrgTypeColor(org.type)}>
                      {org.type === 'system_owner' ? 'Sistema' : 'Cliente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Organization Details */}
        <div className="lg:col-span-2">
          {selectedOrg ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              {orgStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Total Tickets</p>
                          <p className="text-2xl font-bold">{orgStats.totalTickets}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium">Tickets Abertos</p>
                          <p className="text-2xl font-bold">{orgStats.openTickets}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Utilizadores Ativos</p>
                          <p className="text-2xl font-bold">{orgStats.activeUsers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Departamentos</p>
                          <p className="text-2xl font-bold">{orgStats.totalDepartments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedOrg.name}</CardTitle>
                  <CardDescription>
                    Detalhes da organização e estrutura departamental
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Departments */}
                  <div>
                    <h3 className="font-medium mb-3">Departamentos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedOrg.departments?.map((dept) => (
                        <div key={dept.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{dept.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {dept.users?.length || 0} utilizadores
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Users */}
                  <div>
                    <h3 className="font-medium mb-3">Utilizadores</h3>
                    <div className="space-y-2">
                      {selectedOrg.users?.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {selectedOrg.users && selectedOrg.users.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          e mais {selectedOrg.users.length - 5} utilizadores...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Selecione uma organização para ver detalhes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}