import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions,
  children 
}: PageHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4">
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem key={index}>
                  {index < breadcrumbs.length - 1 ? (
                    <>
                      <BreadcrumbLink href={crumb.href || "#"}>
                        {crumb.label}
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="mt-4 flex flex-shrink-0 sm:mt-0 sm:ml-4">
              {actions}
            </div>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
}