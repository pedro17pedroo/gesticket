import { ReactNode } from "react";
import ModernSidebar from "./modern-sidebar";
import { cn } from "@/lib/utils";

interface ModernLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ModernLayout({ children, className }: ModernLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <ModernSidebar />
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden",
        "lg:ml-0", // Remove margin on large screens as sidebar is positioned
        className
      )}>
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}