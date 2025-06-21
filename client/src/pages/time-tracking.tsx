import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimeTracking() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header 
          title="Tempo" 
          subtitle="Rastreamento de tempo e gestão de bolsa de horas"
        />
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Esta funcionalidade estará disponível em breve. Rastreie tempo gasto em tickets e gerencie bolsa de horas.
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
