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
  AlertTriangle,
  Calendar,
  DollarSign
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
import { TransactionDetailsModal } from '@/components/admin/TransactionDetailsModal';
import { transactionApi, type Transaction } from '@/lib/transactionApi';
import { useToast } from '@/hooks/use-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'reverse' | 'flag';
    transaction?: Transaction;
  }>({ open: false, type: 'reverse' });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, typeFilter, statusFilter, dateFrom, dateTo, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionApi.getTransactions({ 
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: 20,
        offset: currentPage * 20
      });
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
          await transactionApi.reverseTransaction(transaction.id, data.reason);
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

  const handleExport = async () => {
    try {
      await transactionApi.exportTransactions({
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      });
      toast({
        title: "Success",
        description: "Transaction data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export transaction data",
        variant: "destructive",
      });
    }
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
      key: 'user_email',
      header: 'User',
      sortable: true,
      render: (email) => (
        <span className="text-sm">{email}</span>
      ),
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
      key: 'game_type',
      header: 'Game',
      render: (gameType) => gameType ? (
        <span className="capitalize text-sm">{gameType}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      key: 'created_at',
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
            <DropdownMenuItem
              onClick={() => {
                setSelectedTransaction(transaction);
                setDetailsModalOpen(true);
              }}
            >
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
          <Button 
            variant="outline" 
            className="btn-ghost-neon"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-neon"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="select-neon">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdraw">Withdraw</SelectItem>
                <SelectItem value="bet">Bet</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="select-neon">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="card-neon">
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
            loading={loading}
            pagination={{
              currentPage,
              totalPages: Math.ceil(totalTransactions / 20),
              onPageChange: setCurrentPage
            }}
          />
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedTransaction(null);
        }}
      />

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