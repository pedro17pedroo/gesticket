import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function KnowledgeBase() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="Base Conhecimento" 
          subtitle="Artigos e documentação para autoatendimento"
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Esta funcionalidade estará disponível em breve. Gerencie artigos e documentação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
