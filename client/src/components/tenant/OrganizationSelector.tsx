import React from 'react';
import { useTenant } from '@/hooks/useTenant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface OrganizationSelectorProps {
  onOrganizationChange?: (organizationId: number) => void;
  disabled?: boolean;
}

export function OrganizationSelector({ onOrganizationChange, disabled }: OrganizationSelectorProps) {
  const { 
    currentOrganization, 
    getUserAccessibleOrganizations, 
    switchOrganization,
    isSystemUser
  } = useTenant();

  const accessibleOrganizations = getUserAccessibleOrganizations();

  const handleOrganizationChange = async (value: string) => {
    const organizationId = parseInt(value);
    try {
      await switchOrganization(organizationId);
      onOrganizationChange?.(organizationId);
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  // Don't show selector if user can only access one organization
  if (accessibleOrganizations.length <= 1 && !isSystemUser()) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentOrganization?.id?.toString()}
        onValueChange={handleOrganizationChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecionar organização">
            {currentOrganization && (
              <div className="flex items-center space-x-2">
                <span>{currentOrganization.name}</span>
                <Badge variant="outline" className="text-xs">
                  {currentOrganization.type === 'system_owner' ? 'Sistema' : 'Cliente'}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accessibleOrganizations.map((org) => (
            <SelectItem key={org.id} value={org.id.toString()}>
              <div className="flex items-center space-x-2">
                <span>{org.name}</span>
                <Badge variant="outline" className="text-xs">
                  {org.type === 'system_owner' ? 'Sistema' : 'Cliente'}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}