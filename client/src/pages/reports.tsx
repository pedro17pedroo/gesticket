import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="Relatórios" 
          subtitle="Análises e insights de performance"
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Esta funcionalidade estará disponível em breve. Visualize relatórios e análises de performance.
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
