import { supabase } from '@/integrations/supabase/client';
import { secureLog } from './logger';

export interface Transaction {
  id: string;
  user_id: string;
  user_email: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'payout' | 'adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  balance_before?: number;
  balance_after?: number;
  game_type?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const transactionApi = {
  async getTransactions(filters: TransactionFilters = {}) {
    try {
      secureLog.info('Attempting to fetch transactions', '');

      // Try to access transactions table with graceful error handling
      try {
        // @ts-ignore - Table might not exist in types yet
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .limit(filters.limit || 20)
          .offset(filters.offset || 0)
          .order('created_at', { ascending: false });

        if (error) {
          secureLog.info('Transactions table error', error.message);
          return { transactions: [], total: 0 };
        }

        // Transform data to match expected format
        const transactions = (data || []).map((t: any) => ({
          id: t.id,
          user_id: t.user_id,
          user_email: 'Unknown User', // Will be populated when table relations are fixed
          type: t.type,
          amount: t.amount,
          status: t.status,
          balance_before: t.balance_before,
          balance_after: t.balance_after,
          game_type: t.game_type,
          description: t.description,
          created_at: t.created_at,
          updated_at: t.updated_at
        }));

        secureLog.info('Found transactions', `count: ${transactions.length}`);
        return { transactions, total: transactions.length };
      } catch (tableError: any) {
        secureLog.info('Transactions table does not exist yet', tableError.message);
        return { transactions: [], total: 0 };
      }
    } catch (error) {
      secureLog.error('Failed to fetch transactions', error instanceof Error ? error.message : 'Unknown error');
      return { transactions: [], total: 0 }; // Return empty data instead of throwing
    }
  },

  async reverseTransaction(transactionId: string, reason: string) {
    try {
      secureLog.info('Transaction reversal feature requires database table setup', '');
      return { success: false, message: 'Please create the transactions table first' };
    } catch (error) {
      secureLog.error('Failed to reverse transaction', `transactionId: ${transactionId}, error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },

  async exportTransactions(filters: TransactionFilters = {}) {
    try {
      const { transactions } = await this.getTransactions({ ...filters, limit: 10000 });

      if (transactions.length === 0) {
        secureLog.info('No transactions to export', '');
        return { success: false, message: 'No transactions found' };
      }

      const csvHeaders = [
        'Transaction ID',
        'User Email',
        'Type',
        'Amount',
        'Status',
        'Game Type',
        'Description',
        'Created At'
      ];

      const csvRows = transactions.map(t => [
        t.id,
        t.user_email,
        t.type,
        t.amount,
        t.status,
        t.game_type || '',
        t.description || '',
        new Date(t.created_at).toLocaleString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      secureLog.error('Failed to export transactions', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
};
