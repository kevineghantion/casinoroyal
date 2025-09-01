import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Undo,
  Eye,
  AlertTriangle
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
import { adminApi, type Transaction } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'reverse' | 'flag';
    transaction?: Transaction;
  }>({ open: false, type: 'reverse' });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTransactions({ query: searchQuery });
      setTransactions(data.transactions);
      setTotalTransactions(data.total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (type: string, transaction: Transaction, data?: any) => {
    try {
      switch (type) {
        case 'reverse':
          await adminApi.reverseTransaction(transaction.id, data.reason);
          toast({
            title: "Success",
            description: `Transaction ${transaction.id} has been reversed`,
          });
          break;
      }
      fetchTransactions(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform action on transaction ${transaction.id}`,
        variant: "destructive",
      });
    }
    setConfirmModal({ open: false, type: 'reverse' });
  };

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'reversed': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'adjustment':
        return ArrowDownRight;
      case 'withdraw':
      case 'bet':
        return ArrowUpRight;
      default:
        return ArrowDownRight;
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'text-green-500';
      case 'withdraw': return 'text-red-500';
      case 'bet': return 'text-orange-500';
      case 'payout': return 'text-blue-500';
      case 'adjustment': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (id) => (
        <span className="font-mono text-sm">{id}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (type) => {
        const Icon = getTypeIcon(type);
        const color = getTypeColor(type);
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className={`capitalize ${color}`}>{type}</span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (amount, transaction) => (
        <span className={`font-mono ${getTypeColor(transaction.type)}`}>
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
          {status}
        </Badge>
      ),
    },
    {
      key: 'gameType',
      header: 'Game',
      render: (gameType) => gameType ? (
        <span className="capitalize text-sm">{gameType}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Date',
      sortable: true,
      render: (timestamp) => (
        <div className="text-sm">
          <div>{new Date(timestamp).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, transaction) => (
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
            {transaction.status === 'completed' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setConfirmModal({ 
                    open: true, 
                    type: 'reverse', 
                    transaction 
                  })}
                  className="text-destructive"
                >
                  <Undo className="h-4 w-4 mr-2" />
                  Reverse Transaction
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem 
              onClick={() => setConfirmModal({ 
                open: true, 
                type: 'flag', 
                transaction 
              })}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Flag as Suspicious
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const summaryStats = [
    {
      title: 'Total Transactions',
      value: totalTransactions,
      color: 'text-primary',
    },
    {
      title: 'Completed',
      value: transactions.filter(t => t.status === 'completed').length,
      color: 'text-green-500',
    },
    {
      title: 'Pending',
      value: transactions.filter(t => t.status === 'pending').length,
      color: 'text-orange-500',
    },
    {
      title: 'Failed',
      value: transactions.filter(t => t.status === 'failed').length,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neon-glow">
            Transaction Monitor
          </h1>
          <p className="text-muted-foreground">
            Monitor all financial transactions and activities
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="btn-ghost-neon">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button className="btn-neon-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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

      {/* Transaction Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-neon lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-electric-glow">Recent Transactions</CardTitle>
            <CardDescription>
              Latest financial activities across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={transactions}
              columns={columns}
              searchable
              searchPlaceholder="Search transactions..."
              onSearch={setSearchQuery}
              loading={loading}
              onExport={() => toast({ title: "Export", description: "CSV export would start" })}
            />
          </CardContent>
        </Card>

        <Card className="card-neon">
          <CardHeader>
            <CardTitle className="text-electric-glow">Live Stream</CardTitle>
            <CardDescription>
              Real-time transaction monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'deposit', user: 'player123', amount: 250, time: '2s ago' },
                { type: 'bet', user: 'player456', amount: 50, time: '5s ago' },
                { type: 'payout', user: 'player789', amount: 125, time: '8s ago' },
                { type: 'withdraw', user: 'player321', amount: 180, time: '12s ago' },
              ].map((activity, index) => {
                const Icon = getTypeIcon(activity.type as Transaction['type']);
                const color = getTypeColor(activity.type as Transaction['type']);
                
                return (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <div>
                        <div className="font-medium capitalize">{activity.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.user}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono ${color}`}>
                        ${activity.amount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live monitoring active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: 'reverse' })}
        onConfirm={(data) => {
          if (confirmModal.transaction) {
            handleTransactionAction(confirmModal.type, confirmModal.transaction, data);
          }
        }}
        title={
          confirmModal.type === 'reverse' 
            ? 'Reverse Transaction' 
            : 'Flag Transaction'
        }
        description={
          confirmModal.type === 'reverse'
            ? `Reverse transaction ${confirmModal.transaction?.id}. This action cannot be undone and will be logged.`
            : `Flag transaction ${confirmModal.transaction?.id} as suspicious. This will be reviewed by the security team.`
        }
        variant={confirmModal.type === 'reverse' ? 'destructive' : 'default'}
        requireConfirmText={confirmModal.type === 'reverse'}
        confirmText="REVERSE"
      />
    </div>
  );
}