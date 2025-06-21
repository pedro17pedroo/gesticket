import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SLA() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="SLAs" 
          subtitle="Configuração e monitoramento de acordos de nível de serviço"
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>SLA Management</CardTitle>
              <CardDescription>
                Esta funcionalidade estará disponível em breve. Configure e monitore acordos de nível de serviço.
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
