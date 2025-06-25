import React from 'react';
import { useTenant } from '@/hooks/useTenant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

interface DepartmentSelectorProps {
  organizationId?: number;
  onDepartmentChange?: (departmentId: number) => void;
  disabled?: boolean;
}

export function DepartmentSelector({ 
  organizationId, 
  onDepartmentChange, 
  disabled 
}: DepartmentSelectorProps) {
  const { 
    currentDepartment, 
    currentOrganization,
    getUserAccessibleDepartments, 
    switchDepartment 
  } = useTenant();

  const targetOrgId = organizationId || currentOrganization?.id;
  const accessibleDepartments = getUserAccessibleDepartments(targetOrgId);

  const handleDepartmentChange = async (value: string) => {
    const departmentId = parseInt(value);
    try {
      await switchDepartment(departmentId);
      onDepartmentChange?.(departmentId);
    } catch (error) {
      console.error('Failed to switch department:', error);
    }
  };

  // Don't show selector if no departments available
  if (accessibleDepartments.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentDepartment?.id?.toString()}
        onValueChange={handleDepartmentChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar departamento">
            {currentDepartment?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accessibleDepartments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id.toString()}>
              <div className="flex flex-col">
                <span>{dept.name}</span>
                {dept.description && (
                  <span className="text-xs text-muted-foreground">
                    {dept.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}