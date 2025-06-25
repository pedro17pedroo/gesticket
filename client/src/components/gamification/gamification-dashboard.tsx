import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Flame,
  Medal,
  Crown
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'quality' | 'speed' | 'collaboration';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

interface UserStats {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  streak: number;
  rank: number;
  achievements: Achievement[];
  badges: string[];
  weeklyStats: {
    ticketsResolved: number;
    avgResponseTime: number;
    customerSatisfaction: number;
    pointsEarned: number;
  };
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Resolver Rápido',
    description: 'Resolva 10 tickets em menos de 1 hora',
    icon: '⚡',
    category: 'speed',
    points: 100,
    rarity: 'common',
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Satisfação Total',
    description: 'Obtenha 20 avaliações 5 estrelas consecutivas',
    icon: '⭐',
    category: 'quality',
    points: 250,
    rarity: 'rare',
    progress: {
      current: 15,
      target: 20
    }
  },
  {
    id: '3',
    name: 'Maratonista',
    description: 'Mantenha uma sequência de 30 dias ativos',
    icon: '🏃',
    category: 'productivity',
    points: 500,
    rarity: 'epic',
    progress: {
      current: 22,
      target: 30
    }
  },
  {
    id: '4',
    name: 'Mestre dos Tickets',
    description: 'Resolva 1000 tickets com sucesso',
    icon: '👑',
    category: 'productivity',
    points: 1000,
    rarity: 'legendary',
    progress: {
      current: 847,
      target: 1000
    }
  }
];

const mockUserStats: UserStats = {
  id: 'current-user',
  name: 'João Silva',
  level: 12,
  totalPoints: 3420,
  currentLevelPoints: 420,
  nextLevelPoints: 500,
  streak: 22,
  rank: 3,
  achievements: mockAchievements,
  badges: ['speed-demon', 'customer-favorite', 'team-player'],
  weeklyStats: {
    ticketsResolved: 28,
    avgResponseTime: 1.2,
    customerSatisfaction: 4.7,
    pointsEarned: 340
  }
};

const mockLeaderboard = [
  { rank: 1, name: 'Maria Santos', points: 4250, level: 15, change: 0 },
  { rank: 2, name: 'Pedro Costa', points: 3980, level: 14, change: 1 },
  { rank: 3, name: 'João Silva', points: 3420, level: 12, change: -1 },
  { rank: 4, name: 'Ana Ferreira', points: 3150, level: 11, change: 2 },
  { rank: 5, name: 'Carlos Oliveira', points: 2890, level: 10, change: -1 }
];

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const categoryIcons = {
  productivity: <Target className="h-4 w-4" />,
  quality: <Star className="h-4 w-4" />,
  speed: <Zap className="h-4 w-4" />,
  collaboration: <Users className="h-4 w-4" />
};

export default function GamificationDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: userStats = mockUserStats } = useQuery<UserStats>({
    queryKey: ['/api/gamification/stats'],
    staleTime: 60000, // 1 minute
  });

  const levelProgress = (userStats.currentLevelPoints / userStats.nextLevelPoints) * 100;

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card className={`transition-all ${achievement.unlockedAt ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{achievement.name}</h4>
              <Badge className={rarityColors[achievement.rarity]}>
                {achievement.rarity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
            
            {achievement.progress && !achievement.unlockedAt && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso</span>
                  <span>{achievement.progress.current}/{achievement.progress.target}</span>
                </div>
                <Progress 
                  value={(achievement.progress.current / achievement.progress.target) * 100} 
                  className="h-2"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                {categoryIcons[achievement.category]}
                <span className="text-xs text-gray-500 capitalize">{achievement.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">{achievement.points}pts</span>
              </div>
            </div>
          </div>
          
          {achievement.unlockedAt && (
            <div className="text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gamificação</h1>
          <p className="text-gray-600">Acompanhe o seu progresso e conquistas</p>
        </div>
      </div>

      {/* User Level Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={userStats.avatar} />
                <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                  {userStats.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{userStats.name}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    <span>Nível {userStats.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>#{userStats.rank} no ranking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{userStats.streak} dias consecutivos</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-blue-200">pontos totais</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{userStats.currentLevelPoints}/{userStats.nextLevelPoints} pts</span>
            </div>
            <Progress value={levelProgress} className="bg-blue-400" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tickets Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{userStats.weeklyStats.ticketsResolved}</p>
                <p className="text-xs text-gray-500">esta semana</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.weeklyStats.avgResponseTime}h</p>
                <p className="text-xs text-gray-500">resposta</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-yellow-600">{userStats.weeklyStats.customerSatisfaction}</p>
                <p className="text-xs text-gray-500">média semanal</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pontos Ganhos</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.weeklyStats.pointsEarned}</p>
                <p className="text-xs text-gray-500">esta semana</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Recentes</CardTitle>
                <CardDescription>Últimas conquistas desbloqueadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userStats.achievements
                  .filter(a => a.unlockedAt)
                  .slice(0, 3)
                  .map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <span className="text-lg">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.points}pts
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso Semanal</CardTitle>
                <CardDescription>Acompanhamento de metas da semana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tickets Resolvidos</span>
                    <span>{userStats.weeklyStats.ticketsResolved}/30</span>
                  </div>
                  <Progress value={(userStats.weeklyStats.ticketsResolved / 30) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Satisfação do Cliente</span>
                    <span>{userStats.weeklyStats.customerSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(userStats.weeklyStats.customerSatisfaction / 5) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sequência Diária</span>
                    <span>{userStats.streak}/30 dias</span>
                  </div>
                  <Progress value={(userStats.streak / 30) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStats.achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Equipa</CardTitle>
              <CardDescription>Classificação baseada nos pontos acumulados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((user, index) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.name === userStats.name ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">Nível {user.level}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium">{user.points.toLocaleString()} pts</div>
                        {user.change !== 0 && (
                          <div className={`text-xs flex items-center gap-1 ${
                            user.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <TrendingUp className={`h-3 w-3 ${user.change < 0 ? 'rotate-180' : ''}`} />
                            {Math.abs(user.change)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desafio Semanal</CardTitle>
                <CardDescription>Resolva 30 tickets esta semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={(userStats.weeklyStats.ticketsResolved / 30) * 100} />
                  <div className="flex justify-between text-sm">
                    <span>{userStats.weeklyStats.ticketsResolved}/30 tickets</span>
                    <span className="font-medium">500 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Velocista</CardTitle>
                <CardDescription>Mantenha tempo médio abaixo de 1h</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={userStats.weeklyStats.avgResponseTime < 1 ? 100 : 50} />
                  <div className="flex justify-between text-sm">
                    <span>{userStats.weeklyStats.avgResponseTime}h média</span>
                    <span className="font-medium">300 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Satisfação Total</CardTitle>
                <CardDescription>Mantenha satisfação acima de 4.5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={(userStats.weeklyStats.customerSatisfaction / 5) * 100} />
                  <div className="flex justify-between text-sm">
                    <span>{userStats.weeklyStats.customerSatisfaction}/5.0 média</span>
                    <span className="font-medium">400 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}