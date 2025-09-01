import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Users,
  Clock,
  Smartphone,
  MoreHorizontal,
  Eye,
  StopCircle,
  AlertTriangle,
  Activity,
  Globe,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { sessionApi, type UserSession } from '@/lib/sessionApi';
import { useToast } from '@/hooks/use-toast';

export default function Sessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [deviceFilter, setDeviceFilter] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'terminate';
    session?: UserSession;
  }>({ open: false, type: 'terminate' });

  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, [activeOnly]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getSessions(activeOnly);
      setSessions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (type: string, session: UserSession, data?: any) => {
    try {
      switch (type) {
        case 'terminate':
          await sessionApi.terminateSession(session.id, data.reason);
          toast({
            title: "Success",
            description: `Session has been terminated`,
          });
          break;
      }
      fetchSessions(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform action on session`,
        variant: "destructive",
      });
    }
    setConfirmModal({ open: false, type: 'terminate' });
  };

  const getDeviceIcon = (device: string) => {
    if (device?.toLowerCase().includes('mobile')) return Smartphone;
    return Monitor;
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSessionActivityType = (session: UserSession) => {
    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const createdAt = new Date(session.created_at);
    const diffInMinutes = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));
    const sessionAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

    // Determine activity type based on session data
    if (sessionAge < 5) {
      return { event: 'User logged in', type: 'login' };
    } else if (diffInMinutes < 5) {
      return { event: 'Recent activity detected', type: 'activity' };
    } else if (!session.is_active) {
      return { event: 'Session ended', type: 'logout' };
    } else if (diffInMinutes > 30) {
      return { event: 'Session idle', type: 'idle' };
    } else {
      return { event: 'Active session', type: 'active' };
    }
  };

  const columns: Column<UserSession>[] = [
    {
      key: 'user_email',
      header: 'User',
      render: (email) => (
        <span className="font-medium">{email}</span>
      ),
    },
    {
      key: 'device_info',
      header: 'Device',
      sortable: true,
      render: (device) => {
        const Icon = getDeviceIcon(device || '');
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{device || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (ip) => (
        <span className="font-mono text-sm">{ip}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (isActive) => (
        <Badge variant={getStatusBadgeVariant(isActive)}>
          {isActive && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Started',
      sortable: true,
      render: (createdAt) => (
        <div className="text-sm">
          <div>{new Date(createdAt).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'actions' as keyof UserSession,
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
            {session.is_active && (
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
            User Sessions
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage user authentication sessions
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
                  {stat.value.toLocaleString()}
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
                <SelectItem value="all">All Devices</SelectItem>
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
              ? 'Currently active user sessions that can be monitored and managed'
              : 'Complete history of user sessions including active and expired ones'
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

      {/* Real-time Session Activity */}
      {activeOnly && (
        <Card className="card-neon">
          <CardHeader>
            <CardTitle className="text-electric-glow">Live Session Activity</CardTitle>
            <CardDescription>
              Real-time updates from user authentication sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 6).map((session, index) => {
                const timeAgo = formatTimeAgo(session.last_activity);
                const isRecentActivity = new Date(session.last_activity) > new Date(Date.now() - 10 * 60 * 1000); // 10 min
                const activityType = getSessionActivityType(session);

                return (
                  <motion.div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isRecentActivity
                          ? 'bg-green-500 animate-pulse'
                          : session.is_active
                            ? 'bg-primary'
                            : 'bg-gray-500'
                        }`}></div>
                      <div>
                        <div className="font-medium">{activityType.event}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.user_email} • {session.device_info || 'Unknown device'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{timeAgo}</span>
                      {session.is_active && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {sessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active sessions to monitor</p>
                  <p className="text-sm">Sessions will appear here when users login</p>
                </div>
              )}
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