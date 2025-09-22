import { 
  Trophy, 
  Star, 
  Medal, 
  Award,
  Target,
  Zap,
  Crown,
  TrendingUp,
  Users,
  Gift,
  Flame,
  Shield,
  Gem,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  ArrowUp,
  BarChart3,
  PieChart,
  Activity,
  Book,
  GraduationCap,
  Briefcase,
  Heart,
  MessageSquare,
  Share2,
  RefreshCw,
  Filter,
  Search,
  Download,
  Eye,
  Lock,
  Unlock,
  ChevronRight,
  MapPin,
  User,
  Calendar as CalendarIcon,
  Sparkles,
  Coins,
  Rocket,
  Leaf,
  Mountain
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'social' | 'skill' | 'milestone' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: {
    current: number;
    required: number;
  };
  requirements: string[];
  rarity: number; // percentage of users who have this achievement
}

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  earnedDate: string;
  level?: number;
  maxLevel?: number;
}

interface LeaderboardEntry {
  _id: string;
  userId: string;
  name: string;
  avatar?: string;
  rank: number;
  points: number;
  level: number;
  badges: number;
  achievements: number;
  streak: number;
  department?: string;
  semester?: string;
}

interface Reward {
  _id: string;
  title: string;
  description: string;
  type: 'discount' | 'voucher' | 'privilege' | 'item' | 'access';
  pointsCost: number;
  originalPrice?: number;
  discountedPrice?: number;
  availability: number;
  expiryDate?: string;
  category: string;
  image?: string;
  isRedeemed: boolean;
  redeemedDate?: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  currentExp: number;
  expToNext: number;
  rank: number;
  totalUsers: number;
  streak: number;
  longestStreak: number;
  totalAchievements: number;
  totalBadges: number;
  rewardsRedeemed: number;
  joinDate: string;
}

interface Activity {
  _id: string;
  type: 'achievement' | 'badge' | 'level_up' | 'reward' | 'streak';
  title: string;
  description: string;
  points: number;
  date: string;
  icon: string;
}

const StudentGamification: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard' | 'rewards'>('overview');
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [leaderboardFilter, setLeaderboardFilter] = useState('overall');
  const [showRewardModal, setShowRewardModal] = useState<Reward | null>(null);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      setUserStats({
        totalPoints: 3850,
        level: 12,
        currentExp: 350,
        expToNext: 150,
        rank: 23,
        totalUsers: 1250,
        streak: 15,
        longestStreak: 28,
        totalAchievements: 18,
        totalBadges: 12,
        rewardsRedeemed: 5,
        joinDate: '2023-08-15'
      });

      setAchievements([
        {
          _id: '1',
          title: 'First Steps',
          description: 'Complete your first assignment submission',
          icon: 'trophy',
          category: 'milestone',
          difficulty: 'bronze',
          points: 50,
          unlocked: true,
          unlockedDate: '2023-08-20',
          requirements: ['Submit first assignment'],
          rarity: 98.5
        },
        {
          _id: '2',
          title: 'Academic Excellence',
          description: 'Maintain GPA above 8.5 for a semester',
          icon: 'star',
          category: 'academic',
          difficulty: 'gold',
          points: 500,
          unlocked: true,
          unlockedDate: '2023-12-15',
          requirements: ['GPA >= 8.5', 'Complete semester'],
          rarity: 15.2
        },
        {
          _id: '3',
          title: 'Library Enthusiast',
          description: 'Borrow 50 books from the library',
          icon: 'book',
          category: 'skill',
          difficulty: 'silver',
          points: 200,
          unlocked: true,
          unlockedDate: '2024-01-10',
          progress: { current: 50, required: 50 },
          requirements: ['Borrow 50 books'],
          rarity: 8.7
        },
        {
          _id: '4',
          title: 'Social Butterfly',
          description: 'Participate in 10 college events',
          icon: 'users',
          category: 'social',
          difficulty: 'silver',
          points: 300,
          unlocked: false,
          progress: { current: 7, required: 10 },
          requirements: ['Participate in 10 events'],
          rarity: 25.4
        },
        {
          _id: '5',
          title: 'Perfect Attendance',
          description: 'Maintain 100% attendance for a month',
          icon: 'calendar',
          category: 'academic',
          difficulty: 'gold',
          points: 400,
          unlocked: false,
          progress: { current: 28, required: 30 },
          requirements: ['100% attendance for 30 days'],
          rarity: 12.1
        },
        {
          _id: '6',
          title: 'Code Master',
          description: 'Complete advanced programming course with distinction',
          icon: 'zap',
          category: 'skill',
          difficulty: 'platinum',
          points: 750,
          unlocked: false,
          progress: { current: 85, required: 100 },
          requirements: ['Complete advanced programming', 'Score >= 90%'],
          rarity: 5.3
        }
      ]);

      setBadges([
        {
          _id: '1',
          name: 'Early Bird',
          description: 'Submit assignments 24 hours before deadline',
          icon: 'clock',
          color: 'blue',
          category: 'Academic',
          earnedDate: '2023-09-05',
          level: 3,
          maxLevel: 5
        },
        {
          _id: '2',
          name: 'Helping Hand',
          description: 'Help 5 fellow students with their studies',
          icon: 'heart',
          color: 'pink',
          category: 'Social',
          earnedDate: '2023-10-12',
          level: 1,
          maxLevel: 3
        },
        {
          _id: '3',
          name: 'Streak Master',
          description: 'Maintain a 30-day login streak',
          icon: 'flame',
          color: 'orange',
          category: 'Engagement',
          earnedDate: '2023-11-20',
          level: 2,
          maxLevel: 5
        },
        {
          _id: '4',
          name: 'Knowledge Seeker',
          description: 'Complete 100 quiz questions correctly',
          icon: 'book',
          color: 'green',
          category: 'Academic',
          earnedDate: '2024-01-08',
          level: 4,
          maxLevel: 5
        }
      ]);

      setLeaderboard([
        {
          _id: '1',
          userId: 'user1',
          name: 'Alice Johnson',
          rank: 1,
          points: 8950,
          level: 18,
          badges: 25,
          achievements: 32,
          streak: 45,
          department: 'Computer Science',
          semester: '8th'
        },
        {
          _id: '2',
          userId: 'user2',
          name: 'Bob Smith',
          rank: 2,
          points: 8740,
          level: 17,
          badges: 23,
          achievements: 29,
          streak: 38,
          department: 'Computer Science',
          semester: '6th'
        },
        {
          _id: '3',
          userId: 'user3',
          name: 'Carol Davis',
          rank: 3,
          points: 8520,
          level: 17,
          badges: 22,
          achievements: 28,
          streak: 42,
          department: 'Electronics',
          semester: '7th'
        },
        // ... more entries
        {
          _id: '23',
          userId: 'current',
          name: 'You',
          rank: 23,
          points: 3850,
          level: 12,
          badges: 12,
          achievements: 18,
          streak: 15,
          department: 'Computer Science',
          semester: '6th'
        }
      ]);

      setRewards([
        {
          _id: '1',
          title: 'Cafeteria Voucher',
          description: '₹100 off on cafeteria meals',
          type: 'voucher',
          pointsCost: 500,
          originalPrice: 100,
          discountedPrice: 0,
          availability: 25,
          expiryDate: '2024-03-31',
          category: 'Food',
          isRedeemed: false
        },
        {
          _id: '2',
          title: 'Library Late Return Waiver',
          description: 'Waive late return fees for one book',
          type: 'privilege',
          pointsCost: 200,
          availability: 50,
          category: 'Library',
          isRedeemed: true,
          redeemedDate: '2024-01-15'
        },
        {
          _id: '3',
          title: 'Stationery Kit',
          description: 'Premium stationery kit with notebooks and pens',
          type: 'item',
          pointsCost: 800,
          originalPrice: 500,
          discountedPrice: 200,
          availability: 15,
          category: 'Stationery',
          isRedeemed: false
        },
        {
          _id: '4',
          title: 'Priority Registration',
          description: 'Early access to course registration',
          type: 'access',
          pointsCost: 1000,
          availability: 10,
          expiryDate: '2024-06-30',
          category: 'Academic',
          isRedeemed: false
        },
        {
          _id: '5',
          title: 'Tech Store Discount',
          description: '20% off on electronics from campus store',
          type: 'discount',
          pointsCost: 600,
          availability: 30,
          expiryDate: '2024-04-30',
          category: 'Electronics',
          isRedeemed: false
        }
      ]);

      setActivities([
        {
          _id: '1',
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          description: 'Earned "Library Enthusiast" achievement',
          points: 200,
          date: '2024-01-10',
          icon: 'trophy'
        },
        {
          _id: '2',
          type: 'level_up',
          title: 'Level Up!',
          description: 'Reached Level 12',
          points: 100,
          date: '2024-01-08',
          icon: 'star'
        },
        {
          _id: '3',
          type: 'badge',
          title: 'New Badge Earned!',
          description: 'Earned "Knowledge Seeker" badge',
          points: 50,
          date: '2024-01-08',
          icon: 'medal'
        },
        {
          _id: '4',
          type: 'streak',
          title: 'Streak Milestone!',
          description: '15-day login streak achieved',
          points: 75,
          date: '2024-01-05',
          icon: 'flame'
        },
        {
          _id: '5',
          type: 'reward',
          title: 'Reward Redeemed!',
          description: 'Library Late Return Waiver used',
          points: -200,
          date: '2024-01-15',
          icon: 'gift'
        }
      ]);

    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (reward: Reward) => {
    try {
      if (!userStats || userStats.totalPoints < reward.pointsCost) {
        toast.error('Insufficient points to redeem this reward');
        return;
      }

      // Mock API call
      setUserStats(prev => prev ? { ...prev, totalPoints: prev.totalPoints - reward.pointsCost } : prev);
      setRewards(prev => prev.map(r => 
        r._id === reward._id 
          ? { ...r, isRedeemed: true, redeemedDate: new Date().toISOString().split('T')[0] }
          : r
      ));
      
      // Add activity
      const newActivity: Activity = {
        _id: Date.now().toString(),
        type: 'reward',
        title: 'Reward Redeemed!',
        description: `Redeemed "${reward.title}"`,
        points: -reward.pointsCost,
        date: new Date().toISOString(),
        icon: 'gift'
      };
      setActivities(prev => [newActivity, ...prev]);

      setShowRewardModal(null);
      toast.success(`Successfully redeemed ${reward.title}!`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'diamond': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return <Medal className="w-4 h-4" />;
      case 'silver': return <Medal className="w-4 h-4" />;
      case 'gold': return <Trophy className="w-4 h-4" />;
      case 'platinum': return <Crown className="w-4 h-4" />;
      case 'diamond': return <Gem className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <Trophy className="w-6 h-6 text-blue-500" />;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (achievementFilter === 'all') return true;
    if (achievementFilter === 'unlocked') return achievement.unlocked;
    if (achievementFilter === 'locked') return !achievement.unlocked;
    return achievement.category === achievementFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gamification Center</h1>
          <p className="text-gray-600">Track your progress, earn rewards, and compete with peers</p>
        </motion.div>

        {/* User Stats Overview */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl shadow-lg p-6 mb-8 text-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 rounded-full bg-white bg-opacity-20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Points</div>
              </div>
              
              <div className="text-center">
                <div className="p-3 rounded-full bg-white bg-opacity-20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Star className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold">Level {userStats.level}</div>
                <div className="text-sm opacity-90">
                  {userStats.currentExp}/{userStats.expToNext} to next level
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(userStats.currentExp / userStats.expToNext) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-3 rounded-full bg-white bg-opacity-20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold">#{userStats.rank}</div>
                <div className="text-sm opacity-90">
                  out of {userStats.totalUsers.toLocaleString()} students
                </div>
              </div>
              
              <div className="text-center">
                <div className="p-3 rounded-full bg-white bg-opacity-20 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Flame className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold">{userStats.streak}</div>
                <div className="text-sm opacity-90">
                  Day Streak (Best: {userStats.longestStreak})
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalAchievements}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalBadges}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.rewardsRedeemed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Days Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((new Date().getTime() - new Date(userStats?.joinDate || '').getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Achievements
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'leaderboard'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rewards'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rewards Store
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.type === 'achievement' ? 'bg-yellow-100' :
                        activity.type === 'level_up' ? 'bg-purple-100' :
                        activity.type === 'badge' ? 'bg-blue-100' :
                        activity.type === 'streak' ? 'bg-orange-100' :
                        'bg-green-100'
                      }`}>
                        {activity.icon === 'trophy' && <Trophy className="w-5 h-5 text-yellow-600" />}
                        {activity.icon === 'star' && <Star className="w-5 h-5 text-purple-600" />}
                        {activity.icon === 'medal' && <Medal className="w-5 h-5 text-blue-600" />}
                        {activity.icon === 'flame' && <Flame className="w-5 h-5 text-orange-600" />}
                        {activity.icon === 'gift' && <Gift className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${activity.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.points >= 0 ? '+' : ''}{activity.points} pts
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges & Quick Stats */}
            <div className="space-y-6">
              {/* Recent Badges */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Badges</h3>
                <div className="grid grid-cols-2 gap-3">
                  {badges.slice(0, 4).map((badge, index) => (
                    <motion.div
                      key={badge._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="text-center p-3 rounded-lg bg-gray-50"
                    >
                      <div className={`p-3 rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center bg-${badge.color}-100`}>
                        <Award className={`w-6 h-6 text-${badge.color}-600`} />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900">{badge.name}</h4>
                      <p className="text-xs text-gray-600">Level {badge.level}/{badge.maxLevel}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>Level Progress</span>
                      <span>{userStats?.currentExp}/{userStats?.expToNext} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${userStats ? (userStats.currentExp / userStats.expToNext) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>Achievement Progress</span>
                      <span>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap gap-3">
                {['all', 'unlocked', 'locked', 'academic', 'social', 'skill', 'milestone', 'special'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setAchievementFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      achievementFilter === filter
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative ${
                    achievement.unlocked ? '' : 'opacity-60'
                  }`}
                >
                  {!achievement.unlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <Trophy className={`w-8 h-8 ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(achievement.difficulty)}`}>
                      {getDifficultyIcon(achievement.difficulty)}
                      <span className="ml-1 capitalize">{achievement.difficulty}</span>
                    </span>
                    <span className="text-sm font-medium text-yellow-600">
                      +{achievement.points} pts
                    </span>
                  </div>

                  {achievement.progress && !achievement.unlocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress.current}/{achievement.progress.required}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(achievement.progress.current, achievement.progress.required)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {achievement.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {achievement.unlocked && achievement.unlockedDate && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Unlocked:</strong> {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    <span>{achievement.rarity}% of students have this achievement</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Leaderboard Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap gap-3">
                {['overall', 'department', 'semester', 'weekly', 'monthly'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setLeaderboardFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      leaderboardFilter === filter
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 3 Podium */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Top Performers</h3>
              <div className="flex justify-center items-end space-x-8">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
                  >
                    <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}>
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="mb-2">{getRankIcon(entry.rank)}</div>
                    <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                    <p className="text-sm text-gray-600">{entry.department}</p>
                    <p className="text-lg font-bold text-yellow-600">{entry.points.toLocaleString()} pts</p>
                    <div className={`mt-4 h-16 w-16 mx-auto rounded ${
                      index === 0 ? 'bg-yellow-400 h-20' :
                      index === 1 ? 'bg-gray-400 h-16' :
                      'bg-orange-400 h-12'
                    }`}></div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Rankings</h3>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      entry.userId === 'current' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-sm">
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                      <p className="text-sm text-gray-600">{entry.department} • {entry.semester} Semester</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <p className="font-bold text-yellow-600">{entry.points.toLocaleString()}</p>
                        <p className="text-gray-500">Points</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-600">{entry.level}</p>
                        <p className="text-gray-500">Level</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{entry.badges}</p>
                        <p className="text-gray-500">Badges</p>
                      </div>
                      <div>
                        <p className="font-bold text-orange-600">{entry.streak}</p>
                        <p className="text-gray-500">Streak</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Points Balance */}
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Your Points Balance</h3>
                  <p className="text-3xl font-bold">{userStats?.totalPoints.toLocaleString()} pts</p>
                </div>
                <div className="p-4 rounded-full bg-white bg-opacity-20">
                  <Coins className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${
                    reward.isRedeemed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-100">
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                    {reward.isRedeemed && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        Redeemed
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Cost:</span>
                      <span className="text-lg font-bold text-green-600">{reward.pointsCost} pts</span>
                    </div>
                    
                    {reward.originalPrice && reward.discountedPrice !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Value:</span>
                        <div className="text-right">
                          {reward.discountedPrice > 0 ? (
                            <>
                              <span className="text-sm line-through text-gray-500">₹{reward.originalPrice}</span>
                              <span className="text-sm font-bold text-green-600 ml-2">₹{reward.discountedPrice}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-green-600">Free (₹{reward.originalPrice} value)</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Available:</span>
                      <span className="text-sm text-gray-600">{reward.availability} left</span>
                    </div>

                    {reward.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Expires:</span>
                        <span className="text-sm text-gray-600">
                          {new Date(reward.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowRewardModal(reward)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      Details
                    </button>
                    <button
                      onClick={() => redeemReward(reward)}
                      disabled={reward.isRedeemed || !userStats || userStats.totalPoints < reward.pointsCost}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reward.isRedeemed ? 'Redeemed' : 'Redeem'}
                    </button>
                  </div>

                  {reward.isRedeemed && reward.redeemedDate && (
                    <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Redeemed on {new Date(reward.redeemedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Reward Details Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <RewardModal
            reward={showRewardModal}
            userPoints={userStats?.totalPoints || 0}
            onClose={() => setShowRewardModal(null)}
            onRedeem={redeemReward}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Reward Modal Component
const RewardModal: React.FC<{
  reward: Reward;
  userPoints: number;
  onClose: () => void;
  onRedeem: (reward: Reward) => void;
}> = ({ reward, userPoints, onClose, onRedeem }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{reward.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="p-6 rounded-xl bg-green-100 mb-6">
              <Gift className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Description</h3>
                <p className="text-gray-600">{reward.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Category</h3>
                <p className="text-gray-600">{reward.category}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Type</h3>
                <p className="text-gray-600 capitalize">{reward.type}</p>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Point Cost</h4>
                <p className="text-2xl font-bold text-green-600">{reward.pointsCost} pts</p>
              </div>
              
              {reward.originalPrice && reward.discountedPrice !== undefined && (
                <div>
                  <h4 className="font-medium text-gray-900">Value</h4>
                  {reward.discountedPrice > 0 ? (
                    <div>
                      <span className="text-lg line-through text-gray-500">₹{reward.originalPrice}</span>
                      <span className="text-xl font-bold text-green-600 ml-2">₹{reward.discountedPrice}</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-green-600">Free (₹{reward.originalPrice} value)</p>
                  )}
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">Availability</h4>
                <p className="text-gray-600">{reward.availability} remaining</p>
              </div>

              {reward.expiryDate && (
                <div>
                  <h4 className="font-medium text-gray-900">Expires</h4>
                  <p className="text-gray-600">{new Date(reward.expiryDate).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">Your Balance</h4>
                <p className={`text-lg font-bold ${userPoints >= reward.pointsCost ? 'text-green-600' : 'text-red-600'}`}>
                  {userPoints.toLocaleString()} pts
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => onRedeem(reward)}
                disabled={reward.isRedeemed || userPoints < reward.pointsCost}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reward.isRedeemed ? 'Already Redeemed' : 
                 userPoints < reward.pointsCost ? 'Insufficient Points' : 
                 'Redeem Now'}
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentGamification;