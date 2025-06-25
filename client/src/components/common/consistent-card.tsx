import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsistentCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  variant?: "default" | "bordered" | "elevated";
}

const variants = {
  default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
  bordered: "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700",
  elevated: "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
};

export default function ConsistentCard({
  title,
  description,
  children,
  className,
  headerActions,
  variant = "default"
}: ConsistentCardProps) {
  return (
    <Card className={cn(variants[variant], "rounded-xl", className)}>
      {(title || description || headerActions) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </CardDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={title || description ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}