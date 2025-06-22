import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function HourBank() {
  // Mock hour bank data - in real app this would come from API
  const hourBanks = [
    {
      id: 1,
      client: "TechCorp Solutions",
      used: 67,
      limit: 100,
      remaining: 33,
      percentage: 67,
      status: "warning" as const,
    },
    {
      id: 2,
      client: "InnovaTech Ltd",
      used: 23,
      limit: 50,
      remaining: 27,
      percentage: 46,
      status: "normal" as const,
    },
    {
      id: 3,
      client: "StartupXYZ",
      used: 95,
      limit: 80,
      remaining: -15,
      percentage: 119,
      status: "critical" as const,
    },
  ];

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-danger-500';
      case 'warning':
        return 'bg-warning-500';
      default:
        return 'bg-success-500';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-danger-600 dark:text-danger-400';
      case 'warning':
        return 'text-warning-600 dark:text-warning-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Bolsa de Horas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {hourBanks.map((bank) => (
            <div key={bank.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {bank.client}
                </span>
                <span className={`text-sm ${
                  bank.status === 'critical' ? 'text-danger-600 dark:text-danger-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {bank.used}/{bank.limit}h
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(bank.status)}`}
                  style={{ width: `${Math.min(bank.percentage, 100)}%` }}
                />
              </div>
              
              <p className={`text-xs ${getTextColor(bank.status)}`}>
                {bank.status === 'critical' 
                  ? `${Math.abs(bank.remaining)} horas excedentes - cobrança extra`
                  : `${bank.remaining} horas restantes este mês`
                }
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
