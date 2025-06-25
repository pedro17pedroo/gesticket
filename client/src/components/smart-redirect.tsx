import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserType } from '@/hooks/useUserType';
import { useAuth } from '@/hooks/useAuth';

interface SmartRedirectProps {
  children: React.ReactNode;
}

export default function SmartRedirect({ children }: SmartRedirectProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const userType = useUserType();

  useEffect(() => {
    // Não redirecionar se ainda está carregando ou se não há usuário
    if (isLoading || !user) return;

    // Não redirecionar se já está numa rota específica (não na home)
    if (location !== '/') return;

    // Redirecionar usuários do sistema para o painel multi-organizacional
    if (userType.isSystemUser && userType.isSuperUser) {
      setLocation('/multi-tenant-dashboard');
      return;
    }

    // Usuários de empresas clientes ficam no dashboard normal
    if (userType.isClientUser) {
      // Já estão na rota correta, não fazer nada
      return;
    }
  }, [user, isLoading, location, setLocation, userType]);

  return <>{children}</>;
}