import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <MainLayout
      title="Relatórios" 
      subtitle="Análises e insights de performance"
    >
      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível em breve. Visualize relatórios e análises de performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
