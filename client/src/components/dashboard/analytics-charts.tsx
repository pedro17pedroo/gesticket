import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, PieChartIcon } from "lucide-react";

export default function AnalyticsCharts() {
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Análise de Performance
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
            >
              7 dias
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              30 dias
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
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
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Volume de Tickets</h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <BarChart3Icon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Gráfico de volume de tickets</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Chart.js será implementado aqui</p>
              </div>
            </div>
          </div>
          
          {/* SLA Performance Chart Placeholder */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Performance SLA</h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Gráfico de compliance SLA</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Chart.js será implementado aqui</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
