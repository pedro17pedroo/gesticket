import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/types";
import { 
  TicketIcon, 
  ClockIcon, 
  ZapIcon, 
  StarIcon 
} from "lucide-react";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Tickets Ativos",
      value: stats?.activeTickets || 0,
      change: "+8.2%",
      changeType: "positive" as const,
      icon: TicketIcon,
      iconColor: "text-primary-600",
      iconBg: "bg-primary-50",
    },
    {
      title: "SLA Compliance",
      value: `${stats?.slaCompliance || 0}%`,
      change: "-2.1%",
      changeType: "negative" as const,
      icon: ClockIcon,
      iconColor: "text-success-600",
      iconBg: "bg-success-50",
    },
    {
      title: "Tempo Resposta",
      value: `${stats?.avgResponseTime || 0}h`,
      change: "-12%",
      changeType: "positive" as const,
      icon: ZapIcon,
      iconColor: "text-warning-600",
      iconBg: "bg-warning-50",
    },
    {
      title: "CSAT Score",
      value: stats?.csatScore || 0,
      change: "+0.3",
      changeType: "positive" as const,
      icon: StarIcon,
      iconColor: "text-warning-600",
      iconBg: "bg-warning-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' 
                      ? 'text-success-600' 
                      : 'text-danger-600'
                  }`}>
                    <span className="font-medium">{stat.change}</span> desde ontem
                  </p>
                </div>
                <div className={`p-3 ${stat.iconBg} rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
