import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/logger';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  date: string;
  description?: string;
}

export const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchBalance = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (error) {
        secureLog.error('Error fetching balance', error);
        return;
      }

      setBalance(data?.balance || 0);
    } catch (error) {
      secureLog.error('Error fetching balance', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBalance();

      const transactionKey = `casino_transactions_${user.id}`;
      const savedTransactions = localStorage.getItem(transactionKey);
      if (savedTransactions) {
        try {
          setTransactions(JSON.parse(savedTransactions));
        } catch (error) {
          secureLog.error('Error loading transactions', error);
        }
      }
    }
  }, [user, fetchBalance]);

  const addTransaction = useCallback((type: Transaction['type'], amount: number, description?: string) => {
    if (!user) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      date: new Date().toISOString(),
      description
    };

    const newTransactions = [transaction, ...transactions].slice(0, 50);
    setTransactions(newTransactions);

    const transactionKey = `casino_transactions_${user.id}`;
    localStorage.setItem(transactionKey, JSON.stringify(newTransactions));
  }, [transactions, user]);

  const deposit = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false;

    const MAX_DEPOSIT = 5000;
    if (amount > MAX_DEPOSIT) {
      secureLog.error('Deposit amount exceeds maximum allowed');
      return false;
    }

    setIsLoading(true);

    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'deposit',
          amount,
          status: 'pending',
          method: 'manual',
          created_by: user.id
        }]);

      if (error) {
        secureLog.error('Failed to create pending deposit', error);
        setIsLoading(false);
        return false;
      }

      addTransaction('deposit', amount, 'Pending deposit - awaiting verification');
      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Error creating deposit request', error);
      setIsLoading(false);
      return false;
    }
  }, [user, addTransaction]);

  const devSimulateCompleteDeposit = useCallback(async (transactionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await (supabase as any)
        .rpc('dev_simulate_complete_deposit', {
          transaction_id_param: transactionId
        });

      if (error) {
        secureLog.error('Failed to simulate deposit completion', error);
        return false;
      }

      await fetchBalance();
      return true;
    } catch (error) {
      secureLog.error('Error simulating deposit completion', error);
      return false;
    }
  }, [user, fetchBalance]);

  const refreshBalance = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  const withdraw = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0 || amount > balance) return false;

    setIsLoading(true);

    try {
      const newBalance = balance - amount;
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance } as any)
        .eq('id', user.id);

      if (error) {
        secureLog.error('Error updating balance', error);
        setIsLoading(false);
        return false;
      }

      setBalance(newBalance);
      addTransaction('withdraw', -amount, `Withdrawal of $${amount}`);
      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Error processing withdrawal', error);
      setIsLoading(false);
      return false;
    }
  }, [user, balance, addTransaction]);

  const bet = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0 || amount > balance) return false;

    setIsLoading(true);

    try {
      const newBalance = balance - amount;
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance } as any)
        .eq('id', user.id);

      if (error) {
        secureLog.error('Error updating balance', error);
        setIsLoading(false);
        return false;
      }

      setBalance(newBalance);
      addTransaction('bet', -amount, `Bet of $${amount}`);
      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Error processing bet', error);
      setIsLoading(false);
      return false;
    }
  }, [user, balance, addTransaction]);

  const win = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false;

    setIsLoading(true);

    try {
      const newBalance = balance + amount;
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance } as any)
        .eq('id', user.id);

      if (error) {
        secureLog.error('Error updating balance', error);
        setIsLoading(false);
        return false;
      }

      setBalance(newBalance);
      addTransaction('win', amount, `Win of $${amount}`);
      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Error processing win', error);
      setIsLoading(false);
      return false;
    }
  }, [user, balance, addTransaction]);

  return {
    balance,
    isLoading,
    transactions,
    deposit,
    withdraw,
    bet,
    win,
    refreshBalance,
    devSimulateCompleteDeposit
  };
};