import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsistentCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  variant?: "default" | "outlined" | "elevated";
}

const variantStyles = {
  default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
  outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
  elevated: "bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
};

export default function ConsistentCard({
  title,
  description,
  children,
  footer,
  className,
  headerActions,
  variant = "default"
}: ConsistentCardProps) {
  return (
    <Card className={cn(variantStyles[variant], "rounded-xl transition-shadow hover:shadow-md", className)}>
      {(title || description || headerActions) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1.5">
            {title && (
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
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
      
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}