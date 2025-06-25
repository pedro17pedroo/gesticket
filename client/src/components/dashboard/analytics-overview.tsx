import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Users, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  progress?: number;
}

function MetricCard({ title, value, change, changeLabel, icon, trend, progress }: MetricCardProps) {
  const trendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const TrendIcon = trendIcon;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge
              variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
              className="text-xs"
            >
              <TrendIcon className="w-3 h-3 mr-1" />
              {change > 0 ? "+" : ""}{change}%
            </Badge>
            {changeLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{changeLabel}</span>
            )}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsOverviewProps {
  stats?: {
    activeTickets: number;
    slaCompliance: number;
    avgResponseTime: number;
    csatScore: number;
  };
}

export default function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
  const defaultStats = {
    activeTickets: 0,
    slaCompliance: 0,
    avgResponseTime: 0,
    csatScore: 0,
  };

  const data = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Tickets Ativos"
        value={data.activeTickets}
        change={12}
        changeLabel="vs mês anterior"
        trend="up"
        icon={<Activity className="h-4 w-4 text-blue-600" />}
      />
      <MetricCard
        title="Conformidade SLA"
        value={`${data.slaCompliance}%`}
        change={-3}
        changeLabel="vs mês anterior"
        trend="down"
        progress={data.slaCompliance}
        icon={<Clock className="h-4 w-4 text-green-600" />}
      />
      <MetricCard
        title="Tempo Médio Resposta"
        value={`${data.avgResponseTime}h`}
        change={-8}
        changeLabel="vs mês anterior"
        trend="up"
        icon={<CheckCircle className="h-4 w-4 text-orange-600" />}
      />
      <MetricCard
        title="CSAT Score"
        value={`${data.csatScore}%`}
        change={5}
        changeLabel="vs mês anterior"
        trend="up"
        progress={data.csatScore}
        icon={<Users className="h-4 w-4 text-purple-600" />}
      />
    </div>
  );
}