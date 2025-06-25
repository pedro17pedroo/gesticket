import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Shield, Users, Key, Settings } from 'lucide-react';

export default function AccessControlPage() {
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/roles'],
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['/api/departments'],
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controlo de Acesso</h1>
            <p className="text-muted-foreground">
              Gerir papéis, permissões e departamentos do sistema
            </p>
          </div>
        </div>

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">
              <Shield className="mr-2 h-4 w-4" />
              Papéis
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Key className="mr-2 h-4 w-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Users className="mr-2 h-4 w-4" />
              Departamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Papéis do Sistema</CardTitle>
                    <CardDescription>
                      Gerir papéis e suas permissões associadas
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Papel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">A carregar papéis...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Utilizadores</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Shield className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">Nenhum papel encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        roles.map((role: any) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>
                              <Badge variant={role.isSystemRole ? "destructive" : "secondary"}>
                                {role.isSystemRole ? "Sistema" : "Organização"}
                              </Badge>
                            </TableCell>
                            <TableCell>{role.userCount || 0}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Configurar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permissões do Sistema</CardTitle>
                    <CardDescription>
                      Visualizar todas as permissões disponíveis
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Permissão
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {permissionsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">A carregar permissões...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Papéis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Key className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">Nenhuma permissão encontrada</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        permissions.map((permission: any) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">{permission.name}</TableCell>
                            <TableCell>{permission.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{permission.category}</Badge>
                            </TableCell>
                            <TableCell>{permission.roleCount || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Departamentos</CardTitle>
                    <CardDescription>
                      Gerir estrutura organizacional e departamentos
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Departamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {departmentsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">A carregar departamentos...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Gestor</TableHead>
                        <TableHead>Utilizadores</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">Nenhum departamento encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        departments.map((department: any) => (
                          <TableRow key={department.id}>
                            <TableCell className="font-medium">{department.name}</TableCell>
                            <TableCell>{department.description}</TableCell>
                            <TableCell>{department.manager?.name || '-'}</TableCell>
                            <TableCell>{department.userCount || 0}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}