import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Users, Shield, Key, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface Department {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: Array<{
    permission: Permission;
  }>;
}

interface UserRole {
  id: number;
  userId: string;
  roleId: number;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  role: Role;
}

// Form schemas
const departmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

const roleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  isSystemRole: z.boolean().default(false),
});

const permissionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  resource: z.string().min(1, "Recurso é obrigatório"),
  action: z.string().min(1, "Ação é obrigatória"),
  description: z.string().optional(),
});

export default function AccessControl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Queries
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['/api/permissions'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  const { data: rolePermissions = [] } = useQuery<Permission[]>({
    queryKey: ['/api/roles', selectedRole, 'permissions'],
    enabled: !!selectedRole,
  });

  const { data: userRoles = [] } = useQuery<UserRole[]>({
    queryKey: ['/api/users', selectedUser, 'roles'],
    enabled: !!selectedUser,
  });

  // Mutations
  const createDepartmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/departments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setIsCreateOpen(false);
      toast({ title: "Departamento criado com sucesso!" });
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsCreateOpen(false);
      toast({ title: "Role criado com sucesso!" });
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/permissions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
      setIsCreateOpen(false);
      toast({ title: "Permissão criada com sucesso!" });
    },
  });

  const assignPermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      apiRequest('POST', `/api/roles/${roleId}/permissions`, { permissionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles', selectedRole, 'permissions'] });
      toast({ title: "Permissão atribuída com sucesso!" });
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      apiRequest('DELETE', `/api/roles/${roleId}/permissions/${permissionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles', selectedRole, 'permissions'] });
      toast({ title: "Permissão removida com sucesso!" });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      apiRequest('POST', `/api/users/${userId}/roles`, { roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', selectedUser, 'roles'] });
      toast({ title: "Role atribuído com sucesso!" });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) =>
      apiRequest('DELETE', `/api/users/${userId}/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', selectedUser, 'roles'] });
      toast({ title: "Role removido com sucesso!" });
    },
  });

  // Forms
  const departmentForm = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", description: "" },
  });

  const roleForm = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", description: "", isSystemRole: false },
  });

  const permissionForm = useForm({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: "", resource: "", action: "", description: "" },
  });

  const handleCreateDepartment = (data: any) => {
    createDepartmentMutation.mutate(data);
  };

  const handleCreateRole = (data: any) => {
    createRoleMutation.mutate(data);
  };

  const handleCreatePermission = (data: any) => {
    createPermissionMutation.mutate(data);
  };

  const handleAssignPermission = (roleId: number, permissionId: number) => {
    assignPermissionMutation.mutate({ roleId, permissionId });
  };

  const handleRemovePermission = (roleId: number, permissionId: number) => {
    removePermissionMutation.mutate({ roleId, permissionId });
  };

  const handleAssignRole = (userId: string, roleId: number) => {
    assignRoleMutation.mutate({ userId, roleId });
  };

  const handleRemoveRole = (userId: string, roleId: number) => {
    removeRoleMutation.mutate({ userId, roleId });
  };

  return (
    <MainLayout 
      title="Controle de Acesso" 
      subtitle="Gerir usuários, roles, permissões e departamentos"
    >
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Atribuições
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Departamentos</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Departamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Departamento</DialogTitle>
                  <DialogDescription>
                    Adicione um novo departamento ao sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...departmentForm}>
                  <form onSubmit={departmentForm.handleSubmit(handleCreateDepartment)} className="space-y-4">
                    <FormField
                      control={departmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do departamento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={departmentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição do departamento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createDepartmentMutation.isPending}>
                        {createDepartmentMutation.isPending ? "Criando..." : "Criar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departmentsLoading ? (
              <div>Carregando departamentos...</div>
            ) : (
              departments.map((dept) => (
                <Card key={dept.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {dept.name}
                      <Badge variant={dept.isActive ? "default" : "secondary"}>
                        {dept.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Roles</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Role</DialogTitle>
                  <DialogDescription>
                    Adicione um novo role ao sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(handleCreateRole)} className="space-y-4">
                    <FormField
                      control={roleForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do role" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição do role" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roleForm.control}
                      name="isSystemRole"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Role do Sistema</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createRoleMutation.isPending}>
                        {createRoleMutation.isPending ? "Criando..." : "Criar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rolesLoading ? (
              <div>Carregando roles...</div>
            ) : (
              roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {role.name}
                      <div className="space-x-1">
                        {role.isSystemRole && (
                          <Badge variant="outline">Sistema</Badge>
                        )}
                        <Badge variant={role.isActive ? "default" : "secondary"}>
                          {role.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {role.rolePermissions?.length || 0} permissões
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRole(role.id)}
                        >
                          Gerir Permissões
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Permissões</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Permissão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Permissão</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova permissão ao sistema
                  </DialogDescription>
                </DialogHeader>
                <Form {...permissionForm}>
                  <form onSubmit={permissionForm.handleSubmit(handleCreatePermission)} className="space-y-4">
                    <FormField
                      control={permissionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da permissão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={permissionForm.control}
                      name="resource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recurso</FormLabel>
                          <FormControl>
                            <Input placeholder="Recurso (ex: tickets, users)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={permissionForm.control}
                      name="action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ação</FormLabel>
                          <FormControl>
                            <Input placeholder="Ação (ex: read, create, update)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={permissionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição da permissão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createPermissionMutation.isPending}>
                        {createPermissionMutation.isPending ? "Criando..." : "Criar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {permissionsLoading ? (
              <div>Carregando permissões...</div>
            ) : (
              permissions.map((permission) => (
                <Card key={permission.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {permission.name}
                      <Badge variant="outline">
                        {permission.resource}.{permission.action}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{permission.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <h2 className="text-2xl font-bold">Atribuições de Roles e Permissões</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Role Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissões por Role</CardTitle>
                <CardDescription>
                  Gerir permissões atribuídas a cada role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedRole?.toString()} onValueChange={(value) => setSelectedRole(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Permissões Atribuídas</h4>
                    <div className="space-y-2">
                      {rolePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{permission.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePermission(selectedRole, permission.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-medium">Adicionar Permissão</h4>
                    <div className="space-y-2">
                      {permissions.filter(p => !rolePermissions.find(rp => rp.id === p.id)).map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{permission.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignPermission(selectedRole, permission.id)}
                          >
                            Adicionar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Roles por Usuário</CardTitle>
                <CardDescription>
                  Gerir roles atribuídos a cada usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUser && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Roles Atribuídos</h4>
                    <div className="space-y-2">
                      {userRoles.map((userRole) => (
                        <div key={userRole.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{userRole.role.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRole(selectedUser, userRole.roleId)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-medium">Adicionar Role</h4>
                    <div className="space-y-2">
                      {roles.filter(r => !userRoles.find(ur => ur.roleId === r.id)).map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{role.name}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(selectedUser, role.id)}
                          >
                            Adicionar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}