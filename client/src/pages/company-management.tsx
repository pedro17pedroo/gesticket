import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Building2, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  UserPlus,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxId: string;
  industry: string;
  tier: string;
  managerId: string;
  isActive: boolean;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CompanyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: number;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
}

export default function CompanyManagement() {
  const [selectedTab, setSelectedTab] = useState("companies");
  const [newCompanyOpen, setNewCompanyOpen] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch users for selected company
  const { data: companyUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "users"],
    enabled: !!selectedCompany?.id,
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: any) => {
      return await apiRequest("/api/companies", {
        method: "POST",
        body: JSON.stringify(companyData),
      });
    },
    onSuccess: () => {
      toast({ title: "Empresa criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setNewCompanyOpen(false);
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/companies/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Empresa atualizada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setEditingCompany(null);
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      toast({ title: "Usuário criado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", selectedCompany?.id, "users"] });
      setNewUserOpen(false);
    },
  });

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const companyData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      website: formData.get("website"),
      taxId: formData.get("taxId"),
      industry: formData.get("industry"),
      tier: formData.get("tier"),
      managerId: formData.get("managerId"),
    };

    createCompanyMutation.mutate(companyData);
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const companyData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      website: formData.get("website"),
      taxId: formData.get("taxId"),
      industry: formData.get("industry"),
      tier: formData.get("tier"),
      managerId: formData.get("managerId"),
    };

    updateCompanyMutation.mutate({ id: editingCompany.id, data: companyData });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      role: formData.get("role"),
      companyId: selectedCompany.id,
      managerId: formData.get("managerId") || null,
    };

    createUserMutation.mutate(userData);
  };

  const getTierColor = (tier: string) => {
    const colors = {
      premium: "bg-purple-100 text-purple-800",
      standard: "bg-blue-100 text-blue-800",
      basic: "bg-gray-100 text-gray-800"
    };
    return colors[tier as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getRoleColor = (role: string) => {
    const colors = {
      client_manager: "bg-green-100 text-green-800",
      client_user: "bg-blue-100 text-blue-800",
      admin: "bg-red-100 text-red-800",
      agent: "bg-orange-100 text-orange-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
            <p className="text-muted-foreground">
              Gerencie empresas clientes e seus usuários
            </p>
          </div>
          
          <Dialog open={newCompanyOpen} onOpenChange={setNewCompanyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Empresa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova empresa cliente ao sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea id="address" name="address" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="taxId">CNPJ/NIF</Label>
                    <Input id="taxId" name="taxId" />
                  </div>
                  <div>
                    <Label htmlFor="industry">Setor</Label>
                    <Input id="industry" name="industry" />
                  </div>
                  <div>
                    <Label htmlFor="tier">Nível</Label>
                    <Select name="tier" defaultValue="basic">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createCompanyMutation.isPending ? "Criando..." : "Criar Empresa"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">
              <Building2 className="w-4 h-4 mr-2" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="users" disabled={!selectedCompany}>
              <Users className="w-4 h-4 mr-2" />
              Usuários {selectedCompany && `(${selectedCompany.name})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Empresas Cadastradas</CardTitle>
                <CardDescription>
                  Lista de todas as empresas clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {companies.map((company: Company) => (
                      <div key={company.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{company.name}</h4>
                              <p className="text-sm text-muted-foreground">{company.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getTierColor(company.tier)}>
                              {company.tier}
                            </Badge>
                            {company.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground mb-3">
                          <div>
                            <span className="font-medium">Gestor:</span> {company.manager?.firstName} {company.manager?.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Telefone:</span> {company.phone || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Setor:</span> {company.industry || "N/A"}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Criado em {new Date(company.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(company);
                                setSelectedTab("users");
                              }}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Usuários
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingCompany(company)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {selectedCompany && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Usuários da {selectedCompany.name}</CardTitle>
                        <CardDescription>
                          Gerencie os usuários que têm acesso ao portal do cliente
                        </CardDescription>
                      </div>
                      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Novo Usuário
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                            <DialogDescription>
                              Adicione um usuário para {selectedCompany.name}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label htmlFor="firstName">Nome *</Label>
                                <Input id="firstName" name="firstName" required />
                              </div>
                              <div>
                                <Label htmlFor="lastName">Sobrenome *</Label>
                                <Input id="lastName" name="lastName" required />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input id="email" name="email" type="email" required />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label htmlFor="role">Função</Label>
                                <Select name="role" defaultValue="client_user">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="client_manager">Gestor Cliente</SelectItem>
                                    <SelectItem value="client_user">Usuário Cliente</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="managerId">Gestor</Label>
                                <Select name="managerId">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um gestor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companyUsers
                                      .filter((user: CompanyUser) => user.role === 'client_manager')
                                      .map((manager: CompanyUser) => (
                                        <SelectItem key={manager.id} value={manager.id}>
                                          {manager.firstName} {manager.lastName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <Button type="submit" disabled={createUserMutation.isPending}>
                              <Save className="w-4 h-4 mr-2" />
                              {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {companyUsers.map((user: CompanyUser) => (
                          <div key={user.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role === 'client_manager' ? 'Gestor' : 'Usuário'}
                                </Badge>
                                {user.isActive ? (
                                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inativo</Badge>
                                )}
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {companyUsers.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            Nenhum usuário cadastrado para esta empresa
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Company Dialog */}
        <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Empresa</DialogTitle>
              <DialogDescription>
                Atualize as informações da empresa
              </DialogDescription>
            </DialogHeader>
            {editingCompany && (
              <form onSubmit={handleUpdateCompany} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-name">Nome da Empresa *</Label>
                    <Input 
                      id="edit-name" 
                      name="name" 
                      defaultValue={editingCompany.name}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input 
                      id="edit-email" 
                      name="email" 
                      type="email"
                      defaultValue={editingCompany.email}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input 
                      id="edit-phone" 
                      name="phone"
                      defaultValue={editingCompany.phone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-website">Website</Label>
                    <Input 
                      id="edit-website" 
                      name="website"
                      defaultValue={editingCompany.website}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Textarea 
                    id="edit-address" 
                    name="address"
                    defaultValue={editingCompany.address}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="edit-taxId">CNPJ/NIF</Label>
                    <Input 
                      id="edit-taxId" 
                      name="taxId"
                      defaultValue={editingCompany.taxId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-industry">Setor</Label>
                    <Input 
                      id="edit-industry" 
                      name="industry"
                      defaultValue={editingCompany.industry}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tier">Nível</Label>
                    <Select name="tier" defaultValue={editingCompany.tier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Básico</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateCompanyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}