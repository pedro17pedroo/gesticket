import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KnowledgeBase() {
  return (
    <MainLayout
      title="Base Conhecimento" 
      subtitle="Artigos e documentação para autoatendimento"
    >
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve. Gerencie artigos e documentação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
