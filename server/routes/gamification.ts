import { Router } from 'express';
import { db } from '../db';
import { eq, desc, count, sum } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';
import { tickets, timeEntries, users } from '@shared/schema';

const router = Router();

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

// Mock achievements data - in real implementation would be in database
const availableAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Primeiro Ticket',
    description: 'Resolva o seu primeiro ticket',
    icon: '🎯',
    category: 'productivity',
    points: 50,
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Resolver Rápido',
    description: 'Resolva 10 tickets em menos de 1 hora cada',
    icon: '⚡',
    category: 'speed',
    points: 100,
    rarity: 'common',
  },
  {
    id: '3',
    name: 'Satisfação Total',
    description: 'Obtenha 20 avaliações 5 estrelas consecutivas',
    icon: '⭐',
    category: 'quality',
    points: 250,
    rarity: 'rare',
  },
  {
    id: '4',
    name: 'Maratonista',
    description: 'Mantenha uma sequência de 30 dias ativos',
    icon: '🏃',
    category: 'productivity',
    points: 500,
    rarity: 'epic',
  },
  {
    id: '5',
    name: 'Mestre dos Tickets',
    description: 'Resolva 1000 tickets com sucesso',
    icon: '👑',
    category: 'productivity',
    points: 1000,
    rarity: 'legendary',
  },
  {
    id: '6',
    name: 'Colaborador Estrela',
    description: 'Ajude 5 colegas em tickets compartilhados',
    icon: '🤝',
    category: 'collaboration',
    points: 200,
    rarity: 'rare',
  }
];

// Calculate user level from total points
const calculateLevel = (totalPoints: number): number => {
  return Math.floor(totalPoints / 300) + 1; // 300 points per level
};

// Calculate points needed for next level
const calculateNextLevelPoints = (level: number): number => {
  return level * 300;
};

// Get user gamification stats
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user basic info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate user statistics from actual data
    const [userTickets] = await db.select({
      totalResolved: count(),
    })
    .from(tickets)
    .where(eq(tickets.assigneeId, userId));

    const [userTimeEntries] = await db.select({
      totalMinutes: sum(timeEntries.duration),
    })
    .from(timeEntries)
    .where(eq(timeEntries.userId, userId));

    // Calculate points based on activity
    const totalTicketsResolved = userTickets?.totalResolved || 0;
    const totalTimeSpent = userTimeEntries?.totalMinutes || 0;
    
    // Point calculation logic
    const ticketPoints = totalTicketsResolved * 10; // 10 points per ticket
    const timePoints = Math.floor(totalTimeSpent / 60) * 5; // 5 points per hour
    const qualityPoints = Math.floor(totalTicketsResolved / 10) * 50; // Bonus for every 10 tickets
    
    const totalPoints = ticketPoints + timePoints + qualityPoints;
    const level = calculateLevel(totalPoints);
    const nextLevelPoints = calculateNextLevelPoints(level);
    const currentLevelPoints = totalPoints % 300;

    // Mock weekly stats - in real implementation would calculate from actual data
    const weeklyStats = {
      ticketsResolved: Math.min(totalTicketsResolved, 28),
      avgResponseTime: 1.2,
      customerSatisfaction: 4.7,
      pointsEarned: Math.min(totalPoints, 340),
    };

    // Calculate achievements progress
    const userAchievements = availableAchievements.map(achievement => {
      let progress = undefined;
      let unlockedAt = undefined;

      switch (achievement.id) {
        case '1': // Primeiro Ticket
          if (totalTicketsResolved >= 1) {
            unlockedAt = new Date('2024-01-15');
          }
          break;
        case '2': // Resolver Rápido
          const fastTickets = Math.min(totalTicketsResolved, 15); // Mock fast tickets
          if (fastTickets >= 10) {
            unlockedAt = new Date('2024-01-20');
          } else {
            progress = { current: fastTickets, target: 10 };
          }
          break;
        case '3': // Satisfação Total
          const consecutiveRatings = Math.min(totalTicketsResolved, 15); // Mock ratings
          if (consecutiveRatings >= 20) {
            unlockedAt = new Date('2024-02-01');
          } else {
            progress = { current: consecutiveRatings, target: 20 };
          }
          break;
        case '4': // Maratonista
          const activeDays = 22; // Mock streak
          if (activeDays >= 30) {
            unlockedAt = new Date('2024-02-15');
          } else {
            progress = { current: activeDays, target: 30 };
          }
          break;
        case '5': // Mestre dos Tickets
          if (totalTicketsResolved >= 1000) {
            unlockedAt = new Date('2024-03-01');
          } else {
            progress = { current: totalTicketsResolved, target: 1000 };
          }
          break;
      }

      return {
        ...achievement,
        unlockedAt,
        progress,
      };
    });

    const userStats: UserStats = {
      id: userId,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.profileImageUrl,
      level,
      totalPoints,
      currentLevelPoints,
      nextLevelPoints,
      streak: 22, // Mock streak
      rank: 3, // Mock rank
      achievements: userAchievements,
      badges: ['speed-demon', 'customer-favorite'],
      weeklyStats,
    };

    res.json(userStats);
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    res.status(500).json({ message: 'Failed to fetch gamification statistics' });
  }
});

// Get leaderboard
router.get('/leaderboard', isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const organizationFilter = req.user?.isSuperUser || req.user?.canCrossOrganizations 
      ? undefined 
      : req.user?.organizationId;

    // Get users with their ticket counts
    let usersQuery = db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      organizationId: users.organizationId,
    })
    .from(users)
    .orderBy(users.firstName)
    .limit(limit);

    if (organizationFilter) {
      usersQuery = usersQuery.where(eq(users.organizationId, organizationFilter));
    }

    const usersList = await usersQuery;

    // Calculate points for each user and create leaderboard
    const leaderboard = await Promise.all(
      usersList.map(async (user, index) => {
        const [userTickets] = await db.select({
          totalResolved: count(),
        })
        .from(tickets)
        .where(eq(tickets.assigneeId, user.id));

        const totalTicketsResolved = userTickets?.totalResolved || 0;
        const totalPoints = totalTicketsResolved * 10 + Math.floor(totalTicketsResolved / 10) * 50;
        const level = calculateLevel(totalPoints);

        return {
          rank: index + 1,
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          points: totalPoints,
          level,
          change: Math.floor(Math.random() * 3) - 1, // Mock change
          avatar: user.profileImageUrl,
        };
      })
    );

    // Sort by points and assign ranks
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

// Get available achievements
router.get('/achievements', isAuthenticated, async (req, res) => {
  try {
    res.json(availableAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

// Award points to user (for system use)
router.post('/award-points', isAuthenticated, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;

    if (!req.user?.isSuperUser) {
      return res.status(403).json({ message: 'Only super users can award points' });
    }

    // In real implementation, would store in a points/gamification table
    // For now, just return success
    res.json({
      success: true,
      message: `Awarded ${points} points to user ${userId}`,
      reason,
      awardedAt: new Date(),
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ message: 'Failed to award points' });
  }
});

// Get user achievements history
router.get('/achievements/history/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user can view this data
    if (userId !== req.user?.id && !req.user?.isSuperUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mock achievement history
    const history = [
      {
        achievementId: '1',
        unlockedAt: new Date('2024-01-15'),
        pointsAwarded: 50,
      },
      {
        achievementId: '2',
        unlockedAt: new Date('2024-01-20'),
        pointsAwarded: 100,
      }
    ];

    res.json(history);
  } catch (error) {
    console.error('Error fetching achievement history:', error);
    res.status(500).json({ message: 'Failed to fetch achievement history' });
  }
});

export default router;