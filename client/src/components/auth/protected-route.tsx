import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Array<{resource: string, action: string}>;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyPermission } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Você precisa estar autenticado para ver esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Você não tem permissões suficientes para ver esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}