import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, Target, Zap, Medal, Award, TrendingUp } from 'lucide-react';

export default function GamificationPage() {
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/gamification/user-stats'],
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/gamification/leaderboard'],
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/gamification/achievements'],
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e conquistas
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.level || 1}</div>
              <Progress value={userStats?.currentLevelProgress || 0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {userStats?.currentLevelPoints || 0}/{userStats?.nextLevelPoints || 100} pontos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalPoints || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{userStats?.pointsThisWeek || 0} esta semana
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <Medal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userStats?.rank || 1}</div>
              <p className="text-xs text-muted-foreground">
                na sua organização
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.streakDays || 0}</div>
              <p className="text-xs text-muted-foreground">
                dias consecutivos
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="achievements">
              <Award className="mr-2 h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progresso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suas Conquistas</CardTitle>
                <CardDescription>
                  Conquistas desbloqueadas e em progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievementsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">A carregar conquistas...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhuma conquista disponível</p>
                      </div>
                    ) : (
                      achievements.map((achievement: any) => (
                        <Card key={achievement.id} className={achievement.unlocked ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{achievement.name}</h3>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                                    {achievement.points} pontos
                                  </Badge>
                                  {achievement.unlocked && (
                                    <Badge variant="outline" className="text-yellow-600">
                                      <Trophy className="w-3 h-3 mr-1" />
                                      Desbloqueada
                                    </Badge>
                                  )}
                                </div>
                                {!achievement.unlocked && achievement.progress && (
                                  <div className="mt-2">
                                    <Progress value={(achievement.current / achievement.target) * 100} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {achievement.current}/{achievement.target}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classificação da Organização</CardTitle>
                <CardDescription>
                  Top performers da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">A carregar classificação...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-8">
                        <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum dado de classificação disponível</p>
                      </div>
                    ) : (
                      leaderboard.map((user: any, index: number) => (
                        <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarFallback>
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-muted-foreground">Nível {user.level}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{user.totalPoints} pontos</div>
                            <div className="text-sm text-muted-foreground">{user.ticketsResolved} tickets</div>
                          </div>
                          {index < 3 && (
                            <div className="text-xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Semanal</CardTitle>
                <CardDescription>
                  Acompanhe seu desempenho da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tickets Resolvidos</span>
                      <span>{userStats?.weeklyStats?.ticketsResolved || 0}/10</span>
                    </div>
                    <Progress value={(userStats?.weeklyStats?.ticketsResolved || 0) * 10} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfação do Cliente</span>
                      <span>{userStats?.weeklyStats?.customerSatisfaction || 0}/5.0</span>
                    </div>
                    <Progress value={(userStats?.weeklyStats?.customerSatisfaction || 0) * 20} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tempo Médio de Resposta</span>
                      <span>{userStats?.weeklyStats?.avgResponseTime || 0}h</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (userStats?.weeklyStats?.avgResponseTime || 0) * 10)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pontos Ganhos</span>
                      <span>{userStats?.weeklyStats?.pointsEarned || 0}</span>
                    </div>
                    <Progress value={(userStats?.weeklyStats?.pointsEarned || 0) / 10} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}