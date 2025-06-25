import MainLayout from "@/components/layout/main-layout";
import KnowledgeBase from "@/components/knowledge/knowledge-base";
import { BookOpenIcon } from "lucide-react";

export default function Knowledge() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpenIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
        </div>
        
        <KnowledgeBase />
      </div>
    </MainLayout>
  );
}