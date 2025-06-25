import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import ModernLayout from "@/components/layout/modern-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Users, Ticket, AlertTriangle, Activity, TrendingUp, ExternalLink } from 'lucide-react';

interface OrganizationData {
  id: number;
  name: string;
  type: 'system_owner' | 'client_company';
  email?: string;
}

export default function MultiTenantDashboard() {
  const { user } = useAuth();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['/api/organizations'],
    retry: false,
  });

  const organizationsList = Array.isArray(organizations) ? organizations : [];

  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);

  const handleOrganizationSelect = (org: OrganizationData) => {
    setSelectedOrg(org);
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-purple-800',
      'system_admin': 'bg-red-100 text-red-800',
      'system_agent': 'bg-orange-100 text-orange-800',
      'company_admin': 'bg-blue-100 text-blue-800',
      'company_manager': 'bg-yellow-100 text-yellow-800',
      'company_agent': 'bg-cyan-100 text-cyan-800',
      'company_user': 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getOrgTypeColor = (type: string) => {
    return type === 'system_owner' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <div className="lg:col-span-2">
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
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
                {organizationsList.map((org: OrganizationData) => (
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedOrg.name}</span>
                      <Badge className={getOrgTypeColor(selectedOrg.type)}>
                        {selectedOrg.type === 'system_owner' ? 'Sistema' : 'Cliente'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Detalhes e estatísticas da organização selecionada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Ticket className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">Total Tickets</p>
                              <p className="text-2xl font-bold">0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Utilizadores</p>
                              <p className="text-2xl font-bold">0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium">Departamentos</p>
                              <p className="text-2xl font-bold">0</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
    </ModernLayout>
  );
}