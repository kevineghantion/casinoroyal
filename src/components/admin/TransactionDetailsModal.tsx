import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Calendar, User, DollarSign, Hash } from 'lucide-react';
import { Transaction } from '@/lib/transactionApi';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  if (!transaction) return null;

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

  const getStatusBadgeVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'reversed': return 'outline';
      default: return 'outline';
    }
  };

  const Icon = getTypeIcon(transaction.type);
  const typeColor = getTypeColor(transaction.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="card-neon max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-electric-glow flex items-center gap-2">
            <Icon className={`h-5 w-5 ${typeColor}`} />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-neon">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                </div>
                <span className="font-mono text-sm">{transaction.id}</span>
              </CardContent>
            </Card>

            <Card className="card-neon">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Amount</span>
                </div>
                <span className={`text-xl font-bold ${typeColor}`}>
                  ${transaction.amount.toLocaleString()}
                </span>
              </CardContent>
            </Card>

            <Card className="card-neon">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-neon">
              <CardHeader>
                <CardTitle className="text-lg">Transaction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${typeColor}`} />
                    <span className={`capitalize ${typeColor} font-medium`}>
                      {transaction.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{transaction.user_email}</span>
                  </div>
                </div>

                {transaction.game_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Game</span>
                    <span className="capitalize font-medium">{transaction.game_type}</span>
                  </div>
                )}

                {transaction.description && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground">Description</span>
                    <p className="text-sm bg-secondary/30 p-3 rounded-lg">
                      {transaction.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-neon">
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Date(transaction.updated_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.updated_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Processing time: {
                        Math.round(
                          (new Date(transaction.updated_at).getTime() - 
                           new Date(transaction.created_at).getTime()) / 1000
                        )
                      }s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}