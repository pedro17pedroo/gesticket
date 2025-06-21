import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";

export default function TimeTracker() {
  const [activeTimer, setActiveTimer] = useState({
    isRunning: false,
    ticketId: "TKT-2024-001",
    startTime: null as Date | null,
    elapsed: 9255, // 2h 34m 15s in seconds
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setActiveTimer(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      startTime: !prev.isRunning ? new Date() : null,
    }));
  };

  // Calculate current elapsed time if timer is running
  const getCurrentElapsed = () => {
    if (activeTimer.isRunning && activeTimer.startTime) {
      const additionalTime = Math.floor((currentTime.getTime() - activeTimer.startTime.getTime()) / 1000);
      return activeTimer.elapsed + additionalTime;
    }
    return activeTimer.elapsed;
  };

  const mockTimeStats = {
    today: "7h 23m",
    week: "32h 15m",
    weeklyGoal: "40h",
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Rastreamento de Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Active Timer */}
        <div className="bg-primary-50 rounded-lg p-4 mb-4 border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-900">Timer Ativo</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTimer}
              className="text-primary-600 hover:text-primary-700 p-1"
            >
              {activeTimer.isRunning ? (
                <PauseIcon className="w-4 h-4" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-2xl font-bold text-primary-900 font-mono">
            {formatTime(getCurrentElapsed())}
          </p>
          <p className="text-xs text-primary-700">#{activeTimer.ticketId}</p>
        </div>
        
        {/* Today's Time Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tempo Hoje</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {mockTimeStats.today}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tempo Semana</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {mockTimeStats.week}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Meta Semanal</span>
            <span className="text-sm font-mono font-medium text-success-600">
              {mockTimeStats.weeklyGoal}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
