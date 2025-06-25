import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  requiredPermissions?: Array<{resource: string, action: string}>;
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  fallback?: ReactNode;
}

export default function ActionButton({
  requiredPermissions = [],
  children,
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  fallback = null,
  ...props
}: ActionButtonProps) {
  const { hasAnyPermission } = usePermissions();

  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
}