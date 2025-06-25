import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig = {
  low: {
    label: "Baixa",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  },
  medium: {
    label: "Média",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  },
  high: {
    label: "Alta",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200"
  },
  critical: {
    label: "Crítica",
    className: "bg-red-100 text-red-800 hover:bg-red-200"
  }
};

export default function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
  
  return (
    <Badge 
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}