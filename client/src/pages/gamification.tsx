import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Users, Medal, Award } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface AgentStats {
  id: string;
  name: string;
  points: number;
  badges: string[];
  rank: number;
  ticketsResolved: number;
  avgResponseTime: number;
  csatScore: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  deadline: string;
}

export default function Gamification() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'challenges'>('leaderboard');

  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['/api/gamification/leaderboard'],
  });

  const { data: badges, isLoading: loadingBadges } = useQuery({
    queryKey: ['/api/gamification/badges'],
  });

  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ['/api/gamification/challenges'],
  });

  // Mock data for development
  const mockLeaderboard: AgentStats[] = [
    {
      id: '1',
      name: 'Ana Silva',
      points: 2450,
      badges: ['speed_demon', 'customer_hero', 'problem_solver'],
      rank: 1,
      ticketsResolved: 89,
      avgResponseTime: 12,
      csatScore: 4.8,
      monthlyGoal: 100,
      monthlyProgress: 89,
    },
    {
      id: '2',
      name: 'João Santos',
      points: 2180,
      badges: ['team_player', 'knowledge_master'],
      rank: 2,
      ticketsResolved: 76,
      avgResponseTime: 15,
      csatScore: 4.6,
      monthlyGoal: 80,
      monthlyProgress: 76,
    },
    {
      id: '3',
      name: 'Maria Costa',
      points: 1920,
      badges: ['early_bird', 'customer_hero'],
      rank: 3,
      ticketsResolved: 68,
      avgResponseTime: 18,
      csatScore: 4.7,
      monthlyGoal: 70,
      monthlyProgress: 68,
    },
  ];

  const mockBadges: Badge[] = [
    {
      id: 'speed_demon',
      name: 'Demônio da Velocidade',
      description: 'Resolve tickets em menos de 10 minutos',
      icon: '⚡',
      rarity: 'epic',
      unlocked: true,
    },
    {
      id: 'customer_hero',
      name: 'Herói do Cliente',
      description: 'Mantenha CSAT acima de 4.5 por um mês',
      icon: '🦸',
      rarity: 'rare',
      unlocked: true,
    },
    {
      id: 'problem_solver',
      name: 'Solucionador',
      description: 'Resolva 50 tickets críticos',
      icon: '🧩',
      rarity: 'common',
      unlocked: true,
    },
    {
      id: 'team_player',
      name: 'Jogador de Equipe',
      description: 'Ajude 10 colegas este mês',
      icon: '🤝',
      rarity: 'rare',
      unlocked: false,
    },
  ];

  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Desafio de Velocidade',
      description: 'Resolva 20 tickets em menos de 15 minutos cada',
      progress: 14,
      target: 20,
      reward: 500,
      deadline: '2025-06-30',
    },
    {
      id: '2',
      title: 'Satisfação Total',
      description: 'Mantenha CSAT acima de 4.8 por uma semana',
      progress: 5,
      target: 7,
      reward: 300,
      deadline: '2025-06-25',
    },
  ];

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MainLayout title={t('gamification')} subtitle="Sistema de pontuação e conquistas">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {t('leaderboard')}
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'badges'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {t('badges')}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'challenges'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Desafios
          </button>
        </div>

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockLeaderboard.map((agent, index) => (
                <Card key={agent.id} className={`${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index === 0 ? <Trophy className="w-4 h-4 text-white" /> : 
                         index === 1 ? <Medal className="w-4 h-4 text-white" /> :
                         <Award className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">#{agent.rank}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('points')}</span>
                      <span className="text-2xl font-bold text-primary">{agent.points}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Meta Mensal</span>
                        <span>{agent.monthlyProgress}/{agent.monthlyGoal}</span>
                      </div>
                      <Progress value={(agent.monthlyProgress / agent.monthlyGoal) * 100} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tickets</p>
                        <p className="font-medium">{agent.ticketsResolved}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CSAT</p>
                        <p className="font-medium">{agent.csatScore}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {agent.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBadges.map((badge) => (
              <Card key={badge.id} className={`${badge.unlocked ? '' : 'opacity-60'}`}>
                <CardHeader className="text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <span className="text-4xl">{badge.icon}</span>
                    <div className={`w-3 h-3 rounded-full ${getRarityColor(badge.rarity)}`} />
                  </div>
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>
                  <Badge variant={badge.unlocked ? 'default' : 'secondary'}>
                    {badge.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {mockChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>{challenge.title}</span>
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">{challenge.description}</p>
                    </div>
                    <Badge variant="outline">
                      {challenge.reward} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Prazo: {new Date(challenge.deadline).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={`font-medium ${
                      challenge.progress >= challenge.target ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {challenge.progress >= challenge.target ? 'Completo!' : 'Em andamento'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}