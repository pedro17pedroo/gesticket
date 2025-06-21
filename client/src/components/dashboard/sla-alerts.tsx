import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";

export default function SlaAlerts() {
  // Mock SLA alerts - in real app this would come from API
  const alerts = [
    {
      id: 1,
      ticketId: "TKT-2024-001",
      message: "SLA vence em 45 minutos",
      severity: "critical" as const,
    },
    {
      id: 2,
      ticketId: "TKT-2024-004",
      message: "SLA vence em 3 horas",
      severity: "warning" as const,
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Alertas SLA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-4">
            <ClockIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum alerta de SLA</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-danger-50 border-danger-200'
                    : 'bg-warning-50 border-warning-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {alert.severity === 'critical' ? (
                    <AlertTriangleIcon className="w-5 h-5 text-danger-500" />
                  ) : (
                    <ClockIcon className="w-5 h-5 text-warning-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    alert.severity === 'critical'
                      ? 'text-danger-900'
                      : 'text-warning-900'
                  }`}>
                    #{alert.ticketId}
                  </p>
                  <p className={`text-xs ${
                    alert.severity === 'critical'
                      ? 'text-danger-700'
                      : 'text-warning-700'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
