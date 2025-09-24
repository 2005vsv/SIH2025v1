import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Trophy,
  Star,
  Medal,
  Gift,
  Flame,
  Crown,
} from 'lucide-react';

// Helpers
const getProgressPercentage = (current, required) => {
  if (!required || required <= 0) return 0;
  return Math.min((current / required) * 100, 100);
};

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-500" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
  return <Star className="w-5 h-5 text-gray-400" />;
};

const RewardModal = ({ reward, userPoints, onClose, onRedeem }) => {
  if (!reward) return null;
  const canRedeem = userPoints >= reward.pointsCost && !reward.isRedeemed;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{reward.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="space-y-2 text-sm">
          <div><strong>Description:</strong> {reward.description}</div>
          <div><strong>Category:</strong> {reward.category}</div>
          <div><strong>Type:</strong> {reward.type}</div>
          <div><strong>Point Cost:</strong> {reward.pointsCost} pts</div>
          {reward.originalPrice != null && reward.discountedPrice != null && (
            <div>
              <strong>Value:</strong>{' '}
              {reward.discountedPrice > 0 ? (
                <>
                  <span className="line-through mr-2">₹{reward.originalPrice}</span>
                  <span>₹{reward.discountedPrice}</span>
                </>
              ) : (
                <>Free (₹{reward.originalPrice} value)</>
              )}
            </div>
          )}
          <div><strong>Availability:</strong> {reward.availability} remaining</div>
          {reward.expiryDate && (
            <div><strong>Expires:</strong> {new Date(reward.expiryDate).toLocaleDateString()}</div>
          )}
          <div className={`font-semibold ${canRedeem ? 'text-green-600' : 'text-red-600'}`}>
            Your Balance: {userPoints.toLocaleString()} pts
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => onRedeem(reward)}
            disabled={!canRedeem}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reward.isRedeemed ? 'Already Redeemed' : userPoints < reward.pointsCost ? 'Insufficient Points' : 'Redeem Now'}
          </button>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StudentGamification = () => {
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [leaderboardFilter, setLeaderboardFilter] = useState('overall');
  const [showRewardModal, setShowRewardModal] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);

        // Mock user
        const mockUser = {
          name: 'You',
          level: 12,
          currentExp: 320,
          expToNext: 500,
          totalPoints: 2450,
          totalAchievements: 18,
          totalBadges: 9,
          rewardsRedeemed: 3,
          rank: 23,
          totalUsers: 540,
          streak: 7,
          longestStreak: 15,
          joinDate: '2024-01-01',
        };

        const mockAchievements = [
          {
            _id: 'a1',
            title: 'Library Enthusiast',
            description: 'Visited library 10 times in a month',
            points: 100,
            difficulty: 'bronze',
            unlocked: true,
            unlockedDate: '2024-01-10',
            rarity: 34,
            category: 'academic',
            requirements: ['Visit 10 times', 'Borrow 3 books'],
          },
          {
            _id: 'a2',
            title: 'Knowledge Seeker',
            description: 'Complete 5 skill modules',
            points: 150,
            difficulty: 'silver',
            unlocked: false,
            rarity: 12,
            category: 'skill',
            progress: { current: 3, required: 5 },
            requirements: ['Finish 5 modules'],
          },
        ];

        const mockBadges = [
          { _id: 'b1', name: 'Helper', level: 1, maxLevel: 5 },
          { _id: 'b2', name: 'Contributor', level: 2, maxLevel: 5 },
        ];

        const mockLeaderboard = Array.from({ length: 10 }).map((_, i) => ({
          _id: String(i + 1),
          userId: `user${i + 1}`,
          name: i === 9 ? 'You' : `Student ${i + 1}`,
          rank: i + 1,
          points: 5000 - i * 200,
          level: 10 + i,
          badges: 5 + (i % 3),
          achievements: 15 + (i % 4),
          streak: 3 + (i % 5),
          department: 'Computer Science',
          semester: `${(i % 8) + 1}th`,
        }));

        const mockRewards = [
          {
            _id: 'r1',
            title: 'Cafeteria Voucher',
            description: '₹100 off on cafeteria meals',
            type: 'voucher',
            pointsCost: 200,
            originalPrice: 100,
            discountedPrice: 0,
            availability: 12,
            expiryDate: '2025-12-31',
            category: 'Food',
            isRedeemed: false,
          },
          {
            _id: 'r2',
            title: 'Library Late Return Waiver',
            description: 'Waive late return fees for one book',
            type: 'privilege',
            pointsCost: 200,
            availability: 4,
            category: 'Library',
            isRedeemed: true,
            redeemedDate: '2025-01-15',
          },
        ];

        const mockActivities = [
          { _id: 'ac1', type: 'achievement', title: 'New Achievement Unlocked!', description: 'Earned "Library Enthusiast"', points: 100, date: '2025-01-10', icon: 'trophy' },
          { _id: 'ac2', type: 'level_up', title: 'Level Up!', description: 'Reached Level 12', points: 0, date: '2025-01-08', icon: 'star' },
          { _id: 'ac3', type: 'badge', title: 'New Badge Earned!', description: 'Earned "Knowledge Seeker"', points: 0, date: '2025-01-08', icon: 'medal' },
          { _id: 'ac4', type: 'streak', title: 'Streak Milestone!', description: '15-day login streak achieved', points: 0, date: '2025-01-05', icon: 'flame' },
          { _id: 'ac5', type: 'reward', title: 'Reward Redeemed!', description: 'Library Late Return Waiver used', points: -200, date: '2025-01-15', icon: 'gift' },
        ];

        setUserStats(mockUser);
        setAchievements(mockAchievements);
        setBadges(mockBadges);
        setLeaderboard(mockLeaderboard);
        setRewards(mockRewards);
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching gamification data:', error);
        toast.error('Failed to load gamification data');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const redeemReward = async (reward) => {
    try {
      if (!userStats || userStats.totalPoints < reward.pointsCost) {
        toast.error('Insufficient points to redeem this reward');
        return;
      }
      setUserStats(prev => prev ? { ...prev, totalPoints: prev.totalPoints - reward.pointsCost } : prev);
      setRewards(prev => prev.map(r =>
        r._id === reward._id
          ? { ...r, isRedeemed: true, redeemedDate: new Date().toISOString().split('T')[0] }
          : r
      ));
      const newActivity = {
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

  const filteredAchievements = achievements.filter(achievement => {
    if (achievementFilter === 'all') return true;
    if (achievementFilter === 'unlocked') return achievement.unlocked;
    if (achievementFilter === 'locked') return !achievement.unlocked;
    return achievement.category === achievementFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Gamification Center</h1>
        <p className="text-lg text-gray-600">Track your progress, earn rewards, and compete with peers</p>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-6 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'achievements' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaderboard' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'rewards' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Rewards Store
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="font-semibold">Recent Activities</div>
            {activities.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-yellow-100">
                    {activity.icon === 'trophy' && <Trophy className="w-5 h-5 text-yellow-600" />}
                    {activity.icon === 'star' && <Star className="w-5 h-5 text-purple-600" />}
                    {activity.icon === 'medal' && <Medal className="w-5 h-5 text-blue-600" />}
                    {activity.icon === 'flame' && <Flame className="w-5 h-5 text-orange-600" />}
                    {activity.icon === 'gift' && <Gift className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <div className="font-semibold">{activity.title}</div>
                    <div className="text-gray-500 text-sm">{activity.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={activity.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {activity.points >= 0 ? '+' : ''}{activity.points} pts
                  </div>
                  <div className="text-xs text-gray-400">{new Date(activity.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="font-semibold">Recent Badges</div>
            <div className="grid grid-cols-2 gap-3">
              {badges.slice(0, 4).map((badge) => (
                <div key={badge._id} className="text-center p-3 rounded-lg bg-gray-50">
                  <Medal className="w-6 h-6 mx-auto text-yellow-600" />
                  <div className="font-medium mt-1">{badge.name}</div>
                  <div className="text-xs text-gray-500">Level {badge.level}/{badge.maxLevel}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'unlocked', 'locked', 'academic', 'social', 'skill', 'milestone', 'special'].map(filter => (
              <button
                key={filter}
                onClick={() => setAchievementFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${achievementFilter === filter ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <div key={achievement._id} className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative ${achievement.unlocked ? '' : 'opacity-60'}`}>
                <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Trophy className={`w-8 h-8 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div className="mt-3 font-semibold">{achievement.title}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
                <div className="mt-2 text-sm">+{achievement.points} pts</div>
                {achievement.progress && !achievement.unlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress.current}/{achievement.progress.required}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${getProgressPercentage(achievement.progress.current, achievement.progress.required)}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">{achievement.rarity}% of students have this achievement</div>
                {achievement.unlocked && achievement.unlockedDate && (
                  <div className="mt-2 text-xs text-green-700">Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {['overall', 'department', 'semester', 'weekly', 'monthly'].map(filter => (
              <button
                key={filter}
                onClick={() => setLeaderboardFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${leaderboardFilter === filter ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <div className="font-semibold mb-3">Top Performers</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((entry) => (
                <div key={entry._id} className="text-center p-4 rounded-lg bg-gray-50">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-600">
                    {entry.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    {getRankIcon(entry.rank)}
                    <div className="font-semibold">{entry.name}</div>
                  </div>
                  <div className="text-sm text-gray-600">{entry.department}</div>
                  <div className="mt-1 text-sm">{entry.points.toLocaleString()} pts</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Full Rankings</div>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div key={entry._id} className={`flex items-center justify-between p-4 rounded-lg ${entry.name === 'You' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className="font-semibold w-6 text-right">{entry.rank}</div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-xs text-gray-500">{entry.department} • {entry.semester} Semester</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-right">
                      <div className="font-semibold">{entry.points.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.level}</div>
                      <div className="text-xs text-gray-500">Level</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.badges}</div>
                      <div className="text-xs text-gray-500">Badges</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.streak}</div>
                      <div className="text-xs text-gray-500">Streak</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-white shadow border border-gray-100">
            <div className="font-semibold">Your Points Balance</div>
            <div className="text-2xl">{userStats?.totalPoints.toLocaleString()} pts</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward._id} className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${reward.isRedeemed ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{reward.title}</div>
                    <div className="text-sm text-gray-600">{reward.description}</div>
                  </div>
                  {reward.isRedeemed && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Redeemed</span>
                  )}
                </div>
                <div className="mt-3 text-sm">
                  <div>
                    <span className="text-gray-500">Cost:</span> {reward.pointsCost} pts
                  </div>
                  {reward.originalPrice != null && reward.discountedPrice != null && (
                    <div>
                      <span className="text-gray-500">Value:</span>{' '}
                      {reward.discountedPrice > 0 ? (
                        <>
                          <span className="line-through mr-2">₹{reward.originalPrice}</span>
                          <span>₹{reward.discountedPrice}</span>
                        </>
                      ) : (
                        <>Free (₹{reward.originalPrice} value)</>
                      )}
                    </div>
                  )}
                  <div><span className="text-gray-500">Available:</span> {reward.availability} left</div>
                  {reward.expiryDate && (
                    <div><span className="text-gray-500">Expires:</span> {new Date(reward.expiryDate).toLocaleDateString()}</div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowRewardModal(reward)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
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
                  <div className="mt-2 text-xs text-gray-500">Redeemed on {new Date(reward.redeemedDate).toLocaleDateString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showRewardModal && (
        <RewardModal
          reward={showRewardModal}
          userPoints={userStats?.totalPoints || 0}
          onClose={() => setShowRewardModal(null)}
          onRedeem={redeemReward}
        />
      )}
    </div>
  );
};

export default StudentGamification;