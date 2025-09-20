'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  PlayCircle,
  BookOpen,
  Target,
  Calendar,
  Award,
  Brain,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Star,
  VideoIcon,
  Timer,
  Lightbulb,
  Zap,
  Trophy,
  ChevronUp,
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';

interface LearningSession {
  date: string;
  duration: number; // in minutes
  videosWatched: number;
  notesCreated: number;
  playlistsCompleted: number;
  categories: string[];
}

interface PlaylistProgress {
  playlistId: string;
  title: string;
  category: string;
  progress: number;
  timeSpent: number;
  lastWatched: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  currentHours: number;
  deadline: string;
  category: string;
  isCompleted: boolean;
}

interface LearningAnalyticsProps {
  sessions: LearningSession[];
  playlistProgress: PlaylistProgress[];
  goals: LearningGoal[];
  totalPlaylists: number;
  totalVideos: number;
  totalNotes: number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

export default function LearningAnalytics({
  sessions,
  playlistProgress,
  goals,
  totalPlaylists,
  totalVideos,
  totalNotes,
}: LearningAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('duration');

  // Filter sessions based on time range
  const filteredSessions = useMemo(() => {
    if (timeRange === 'all') return sessions;
    
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return sessions.filter(session => new Date(session.date) >= cutoffDate);
  }, [sessions, timeRange]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalVideos = filteredSessions.reduce((sum, session) => sum + session.videosWatched, 0);
    const totalNotes = filteredSessions.reduce((sum, session) => sum + session.notesCreated, 0);
    const totalPlaylistsCompleted = filteredSessions.reduce((sum, session) => sum + session.playlistsCompleted, 0);
    const averageSessionLength = filteredSessions.length > 0 ? totalTime / filteredSessions.length : 0;
    const streakDays = calculateStreakDays(filteredSessions);
    
    return {
      totalTime,
      totalVideos,
      totalNotes,
      totalPlaylistsCompleted,
      averageSessionLength,
      streakDays,
      activeDays: filteredSessions.length,
    };
  }, [filteredSessions]);

  function calculateStreakDays(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    
    const sortedDates = sessions
      .map(s => new Date(s.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const sessionDate = new Date(sortedDates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today.getTime() - (streak * 24 * 60 * 60 * 1000));
      
      if (sessionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last30Days.map(date => {
      const session = filteredSessions.find(s => s.date === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        duration: session?.duration || 0,
        videos: session?.videosWatched || 0,
        notes: session?.notesCreated || 0,
        playlists: session?.playlistsCompleted || 0,
      };
    });
  }, [filteredSessions]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const categoryStats: Record<string, number> = {};
    
    filteredSessions.forEach(session => {
      session.categories.forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + session.duration;
      });
    });
    
    return Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
  }, [filteredSessions]);

  // Progress distribution
  const progressData = useMemo(() => {
    const completed = playlistProgress.filter(p => p.isCompleted).length;
    const inProgress = playlistProgress.filter(p => p.progress > 0 && !p.isCompleted).length;
    const notStarted = playlistProgress.filter(p => p.progress === 0).length;
    
    return [
      { name: 'Completed', value: completed, color: '#22c55e' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Not Started', value: notStarted, color: '#6b7280' },
    ];
  }, [playlistProgress]);

  // Goals progress
  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProductivityScore = () => {
    const baseScore = Math.min(100, (stats.totalTime / 60) * 10); // 10 points per hour
    const streakBonus = Math.min(20, stats.streakDays * 2); // 2 points per streak day, max 20
    const consistencyBonus = Math.min(15, (stats.activeDays / 30) * 15); // 15 points for daily activity
    
    return Math.round(baseScore + streakBonus + consistencyBonus);
  };

  const productivityScore = getProductivityScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Learning Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
                <p className="text-xs text-gray-500">
                  Avg: {formatTime(stats.averageSessionLength)}/session
                </p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Videos Watched</p>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
                <p className="text-xs text-gray-500">
                  {stats.activeDays} active days
                </p>
              </div>
              <VideoIcon className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes Created</p>
                <p className="text-2xl font-bold">{stats.totalNotes}</p>
                <p className="text-xs text-gray-500">
                  Knowledge captured
                </p>
              </div>
              <BookOpen className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Streak</p>
                <p className="text-2xl font-bold">{stats.streakDays}</p>
                <p className="text-xs text-gray-500">
                  {stats.streakDays > 0 ? 'Keep it up!' : 'Start your streak!'}
                </p>
              </div>
              <Zap className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray={`${productivityScore}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{productivityScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                {productivityScore >= 80 ? 'Excellent!' : 
                 productivityScore >= 60 ? 'Good Progress' : 
                 productivityScore >= 40 ? 'Getting There' : 'Keep Going!'}
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Base score: {Math.min(100, Math.round((stats.totalTime / 60) * 10))}/100
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Streak bonus: +{Math.min(20, stats.streakDays * 2)}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Consistency bonus: +{Math.min(15, Math.round((stats.activeDays / 30) * 15))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Activity
              </CardTitle>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duration">Time</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    selectedMetric === 'duration' ? formatTime(value as number) : value,
                    name === 'duration' ? 'Minutes' : name === 'videos' ? 'Videos' : 'Notes'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatTime(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Playlist Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Playlist Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {progressData.map((item, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-sm font-medium">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.slice(0, 3).map((goal) => {
                const progress = (goal.currentHours / goal.targetHours) * 100;
                const isOverdue = new Date(goal.deadline) < new Date();
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{goal.title}</h4>
                      <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
                        {goal.currentHours}h / {goal.targetHours}h
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          progress >= 100 ? 'bg-green-500' : 
                          progress >= 75 ? 'bg-blue-500' : 
                          progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{goal.category}</span>
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
              
              {completedGoals.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {completedGoals.length} goal{completedGoals.length !== 1 ? 's' : ''} completed!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.streakDays >= 7 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Amazing streak!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You've been learning consistently for {stats.streakDays} days. Keep it up!
                  </p>
                </div>
              </div>
            )}
            
            {stats.averageSessionLength < 30 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Try longer sessions
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Consider extending your sessions to 45+ minutes for deeper learning.
                  </p>
                </div>
              </div>
            )}
            
            {categoryData.length > 3 && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Diverse learning
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Great job exploring {categoryData.length} different categories!
                  </p>
                </div>
              </div>
            )}
            
            {stats.totalNotes / stats.totalVideos < 0.5 && stats.totalVideos > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">
                    Take more notes
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Try taking notes while watching to improve retention.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}