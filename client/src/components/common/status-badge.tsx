import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@/types";

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return {
          label: "Aberto",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "in_progress":
        return {
          label: "Em Andamento",
          className: "bg-warning-100 text-warning-800 border-warning-200",
        };
      case "waiting_customer":
        return {
          label: "Aguardando Cliente",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "resolved":
        return {
          label: "Resolvido",
          className: "bg-success-100 text-success-800 border-success-200",
        };
      case "closed":
        return {
          label: "Fechado",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      default:
        return {
          label: "Aberto",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
