import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CompanyWithRelations } from "@shared/schema";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocation } from "wouter";

interface CompanySelectorProps {
  selectedCompanyId?: number;
  onCompanySelect: (companyId: number) => void;
  showCreateButton?: boolean;
}

export default function CompanySelector({ 
  selectedCompanyId, 
  onCompanySelect,
  showCreateButton = true 
}: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { hasPermission } = usePermissions();
  const [, setLocation] = useLocation();

  const { data: companies = [] } = useQuery<CompanyWithRelations[]>({
    queryKey: ['/api/companies'],
  });

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Seleção de Empresa</span>
        </CardTitle>
        {showCreateButton && hasPermission('companies', 'create') && (
          <Button 
            size="sm" 
            onClick={() => setLocation('/companies/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Company Selection */}
        <Select 
          value={selectedCompanyId?.toString()} 
          onValueChange={(value) => onCompanySelect(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {filteredCompanies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{company.name}</div>
                    {company.domain && (
                      <div className="text-xs text-gray-500">{company.domain}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {company.users?.length || 0}
                    </Badge>
                    <Badge 
                      variant={company.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      {company.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company Grid View */}
        <div className="grid gap-2 max-h-64 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedCompanyId === company.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => onCompanySelect(company.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{company.name}</div>
                  {company.domain && (
                    <div className="text-xs text-gray-500">{company.domain}</div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    {company.users?.length || 0} usuários
                  </Badge>
                  <Badge 
                    variant={company.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {company.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nenhuma empresa encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}