import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  success: "bg-green-500",
  warning: "bg-yellow-500", 
  error: "bg-red-500",
  info: "bg-blue-500"
};

const sizeConfig = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4"
};

export default function StatusIndicator({ 
  status, 
  size = "md", 
  className 
}: StatusIndicatorProps) {
  return (
    <div 
      className={cn(
        "rounded-full",
        statusConfig[status],
        sizeConfig[size],
        className
      )}
    />
  );
}