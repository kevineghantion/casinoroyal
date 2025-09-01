import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2,
  Users,
  Play,
  Square,
  MoreHorizontal,
  Eye,
  StopCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { adminApi, type GameSession } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

export default function Sessions() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'terminate';
    session?: GameSession;
  }>({ open: false, type: 'terminate' });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, [activeOnly]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSessions(activeOnly);
      setSessions(data.sessions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load game sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (type: string, session: GameSession, data?: any) => {
    try {
      switch (type) {
        case 'terminate':
          await adminApi.terminateSession(session.id, data.reason);
          toast({
            title: "Success",
            description: `Session ${session.id} has been terminated`,
          });
          break;
      }
      fetchSessions(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform action on session ${session.id}`,
        variant: "destructive",
      });
    }
    setConfirmModal({ open: false, type: 'terminate' });
  };

  const getGameIcon = (gameType: GameSession['gameType']) => {
    return Gamepad2; // Could expand with specific game icons
  };

  const getGameColor = (gameType: GameSession['gameType']) => {
    switch (gameType) {
      case 'rocket': return 'text-red-500';
      case 'blackjack': return 'text-yellow-500';
      case 'poker': return 'text-blue-500';
      case 'slots': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: GameSession['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'terminated': return 'destructive';
      default: return 'outline';
    }
  };

  const columns: Column<GameSession>[] = [
    {
      key: 'id',
      header: 'Session ID',
      render: (id) => (
        <span className="font-mono text-sm">{id}</span>
      ),
    },
    {
      key: 'gameType',
      header: 'Game',
      sortable: true,
      render: (gameType) => {
        const Icon = getGameIcon(gameType);
        const color = getGameColor(gameType);
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className={`capitalize ${color} font-medium`}>{gameType}</span>
          </div>
        );
      },
    },
    {
      key: 'playersCount',
      header: 'Players',
      sortable: true,
      render: (count) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{count}</span>
        </div>
      ),
    },
    {
      key: 'totalBet',
      header: 'Total Bet',
      sortable: true,
      render: (amount) => (
        <span className="font-mono text-orange-500">
          ${amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'totalPayout',
      header: 'Total Payout',
      sortable: true,
      render: (amount) => (
        <span className="font-mono text-green-500">
          ${amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (status) => (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status === 'active' && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
          {status}
        </Badge>
      ),
    },
    {
      key: 'startedAt',
      header: 'Started',
      sortable: true,
      render: (startedAt) => (
        <div className="text-sm">
          <div>{new Date(startedAt).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(startedAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, session) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="card-neon">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="h-4 w-4 mr-2" />
              Live Console
            </DropdownMenuItem>
            {session.status === 'active' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setConfirmModal({ 
                    open: true, 
                    type: 'terminate', 
                    session 
                  })}
                  className="text-destructive"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Terminate Session
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const activeSessions = sessions.filter(s => s.is_active);
  const summaryStats = [
    {
      title: 'Active Sessions',
      value: activeSessions.length,
      color: 'text-primary',
    },
    {
      title: 'Total Users',
      value: sessions.length,
      color: 'text-neon-blue',
    },
    {
      title: 'Mobile Sessions',
      value: sessions.filter(s => s.device_info?.toLowerCase().includes('mobile')).length,
      color: 'text-orange-500',
    },
    {
      title: 'Desktop Sessions',
      value: sessions.filter(s => !s.device_info?.toLowerCase().includes('mobile')).length,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neon-glow">
            Game Sessions
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage active game sessions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={activeOnly ? "default" : "outline"}
            onClick={() => setActiveOnly(!activeOnly)}
            className={activeOnly ? "btn-neon-primary" : ""}
          >
            {activeOnly ? 'Active Sessions' : 'All Sessions'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-neon">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.prefix}{stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="text-electric-glow">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="select-neon">
                <SelectValue placeholder="All Devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Devices</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-neon"
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-neon"
            />
            <Button 
              variant="outline"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setDeviceFilter('');
              }}
              className="btn-ghost-neon"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="text-electric-glow">
            {activeOnly ? 'Active Sessions' : 'All Sessions'}
          </CardTitle>
          <CardDescription>
            {activeOnly 
              ? 'Currently running game sessions that can be monitored and managed'
              : 'Complete history of game sessions including completed and terminated ones'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sessions}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage,
              totalPages: Math.ceil(totalSessions / 20),
              onPageChange: setCurrentPage
            }}
          />
        </CardContent>
      </Card>

      {/* Real-time Session Monitor */}
      {activeOnly && (
        <Card className="card-neon">
          <CardHeader>
            <CardTitle className="text-electric-glow">Live Session Monitor</CardTitle>
            <CardDescription>
              Real-time updates from active game sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { session: 'rocket_123', event: 'New player joined', player: 'player456', time: '2s ago' },
                { session: 'blackjack_456', event: 'Round completed', player: 'system', time: '5s ago' },
                { session: 'poker_789', event: 'Big win occurred', player: 'player789', time: '8s ago' },
                { session: 'slots_321', event: 'Jackpot triggered', player: 'player123', time: '12s ago' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">{activity.event}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.session} • {activity.player}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'terminate' })}
        onConfirm={(data) => {
          if (confirmModal.session) {
            handleSessionAction(confirmModal.type, confirmModal.session, data);
          }
        }}
        title="Terminate User Session"
        description={`Terminate session for ${confirmModal.session?.user_email}. The user will be logged out from all devices immediately.`}
        variant="destructive"
        requireConfirmText={true}
        confirmText="TERMINATE"
      />
    </div>
  );
}