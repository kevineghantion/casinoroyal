import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Gamepad2, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Snowflake,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/admin/AnimatedCounter';
import { adminApi, type KPIData } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSummary(timeRange);
      setKpis(data.kpis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Users",
      value: kpis?.totalUsers || 0,
      description: "Registered players",
      icon: Users,
      color: "text-neon-blue",
      bgColor: "bg-accent/20",
    },
    {
      title: "Active Sessions",
      value: kpis?.activeSessions || 0,
      description: "Players online now",
      icon: Gamepad2,
      color: "text-neon-green",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Total Balance",
      value: kpis?.totalBalance || 0,
      description: "All player wallets",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/20",
      prefix: "$",
    },
    {
      title: "Revenue (24h)",
      value: kpis?.revenue24h || 0,
      description: "+12% from yesterday",
      icon: TrendingUp,
      color: "text-neon-purple",
      bgColor: "bg-purple-500/20",
      prefix: "$",
    },
  ];

  const quickActions = [
    {
      title: "Create User",
      description: "Add new player account",
      icon: Plus,
      action: () => toast({ title: "Feature", description: "Create user modal would open" }),
    },
    {
      title: "Seed Funds",
      description: "Add balance to system",
      icon: DollarSign,
      action: () => toast({ title: "Feature", description: "Seed funds modal would open" }),
    },
    {
      title: "Freeze Site",
      description: "Emergency site lock",
      icon: Snowflake,
      action: () => toast({ title: "Feature", description: "Site freeze confirmation would appear" }),
      variant: "destructive" as const,
    },
    {
      title: "Monitor Transactions",
      description: "View real-time activity",
      icon: Activity,
      action: () => toast({ title: "Feature", description: "Transaction monitor would open" }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neon-glow">
            Owner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your casino operations
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32 input-neon">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1, duration: 0.4 }}
            variants={cardVariants}
          >
            <Card className="card-neon">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  <AnimatedCounter
                    value={kpi.value}
                    prefix={kpi.prefix}
                    duration={1500}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-neon">
          <CardHeader>
            <CardTitle className="text-electric-glow">Revenue Trend</CardTitle>
            <CardDescription>
              Revenue over the last {timeRange}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart component would render here
            </div>
          </CardContent>
        </Card>

        <Card className="card-neon">
          <CardHeader>
            <CardTitle className="text-electric-glow">Transaction Distribution</CardTitle>
            <CardDescription>
              Transaction types breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Pie chart component would render here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="text-electric-glow">Quick Actions</CardTitle>
          <CardDescription>
            Frequently used administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Button
                  variant="outline"
                  className={`w-full h-auto p-4 flex flex-col items-start gap-3 hover:scale-105 transition-all duration-200 ${
                    action.variant === 'destructive' 
                      ? 'border-destructive/50 hover:border-destructive hover:bg-destructive/10' 
                      : 'card-glow'
                  }`}
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${
                    action.variant === 'destructive' 
                      ? 'bg-destructive/20 text-destructive' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="text-electric-glow">Recent Activity</CardTitle>
          <CardDescription>
            Latest administrative actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "User balance adjusted", user: "player123", time: "2 minutes ago", type: "adjustment" },
              { action: "New user registered", user: "newplayer456", time: "5 minutes ago", type: "registration" },
              { action: "Withdrawal processed", user: "player789", time: "8 minutes ago", type: "withdrawal" },
              { action: "Game session terminated", user: "system", time: "12 minutes ago", type: "system" },
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.8 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-neon-pulse"></div>
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.user} • {activity.time}
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  activity.type === 'adjustment' ? 'bg-primary/20 text-primary' :
                  activity.type === 'registration' ? 'bg-green-500/20 text-green-500' :
                  activity.type === 'withdrawal' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-orange-500/20 text-orange-500'
                }`}>
                  {activity.type}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}