import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TicketStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  open: {
    label: "Aberto",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-200"
  },
  in_progress: {
    label: "Em Andamento", 
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  },
  waiting_customer: {
    label: "Aguardando Cliente",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  },
  resolved: {
    label: "Resolvido",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-200"
  },
  closed: {
    label: "Fechado",
    variant: "outline" as const,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
};

export default function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}