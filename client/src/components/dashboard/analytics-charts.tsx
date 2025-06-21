import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, PieChartIcon } from "lucide-react";

export default function AnalyticsCharts() {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Análise de Performance
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 border-primary-200"
            >
              7 dias
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              30 dias
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              3 meses
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ticket Volume Chart Placeholder */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Volume de Tickets</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <BarChart3Icon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Gráfico de volume de tickets</p>
                <p className="text-xs text-gray-400 mt-1">Chart.js será implementado aqui</p>
              </div>
            </div>
          </div>
          
          {/* SLA Performance Chart Placeholder */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Performance SLA</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Gráfico de compliance SLA</p>
                <p className="text-xs text-gray-400 mt-1">Chart.js será implementado aqui</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
