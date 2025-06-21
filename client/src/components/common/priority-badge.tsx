import { Badge } from "@/components/ui/badge";
import { TicketPriority } from "@/types";

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityConfig = (priority: TicketPriority) => {
    switch (priority) {
      case "critical":
        return {
          label: "Crítica",
          className: "bg-danger-100 text-danger-800 border-danger-200",
        };
      case "high":
        return {
          label: "Alta",
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "medium":
        return {
          label: "Média",
          className: "bg-warning-100 text-warning-800 border-warning-200",
        };
      case "low":
        return {
          label: "Baixa",
          className: "bg-green-100 text-green-800 border-green-200",
        };
      default:
        return {
          label: "Média",
          className: "bg-warning-100 text-warning-800 border-warning-200",
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}
