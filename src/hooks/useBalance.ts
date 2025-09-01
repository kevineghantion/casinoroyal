import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  date: string;
  description?: string;
}

export const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(100); // Default starting balance
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      // Load balance and transactions from localStorage per user
      const userKey = `casino_balance_${user.id}`;
      const transactionKey = `casino_transactions_${user.id}`;
      
      const savedBalance = localStorage.getItem(userKey);
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }
      
      const savedTransactions = localStorage.getItem(transactionKey);
      if (savedTransactions) {
        try {
          setTransactions(JSON.parse(savedTransactions));
        } catch (error) {
          console.error('Error loading transactions:', error);
        }
      }
    }
  }, [user]);

  const addTransaction = useCallback((type: Transaction['type'], amount: number, description?: string) => {
    if (!user) return;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      date: new Date().toISOString(),
      description
    };
    
    const newTransactions = [transaction, ...transactions].slice(0, 50); // Keep last 50
    setTransactions(newTransactions);
    
    const transactionKey = `casino_transactions_${user.id}`;
    localStorage.setItem(transactionKey, JSON.stringify(newTransactions));
  }, [transactions, user]);

  const updateBalance = useCallback(async (amount: number, type?: Transaction['type']): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Update balance
      const newBalance = Math.max(0, balance + amount);
      setBalance(newBalance);
      
      // Save to localStorage
      const userKey = `casino_balance_${user.id}`;
      localStorage.setItem(userKey, newBalance.toString());
      
      // Add transaction record
      if (type) {
        addTransaction(type, amount);
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, balance, addTransaction]);

  const deposit = useCallback(async (amount: number): Promise<boolean> => {
    if (amount <= 0) return false;
    return updateBalance(amount, 'deposit');
  }, [updateBalance]);

  const withdraw = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0 || amount > balance) return false;
    return updateBalance(-amount, 'withdraw');
  }, [user, balance, updateBalance]);

  const bet = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || amount <= 0 || amount > balance) return false;
    return updateBalance(-amount, 'bet');
  }, [user, balance, updateBalance]);

  const win = useCallback(async (amount: number): Promise<boolean> => {
    if (amount <= 0) return false;
    return updateBalance(amount, 'win');
  }, [updateBalance]);

  return {
    balance,
    isLoading,
    transactions,
    updateBalance: (amount: number) => updateBalance(amount, amount > 0 ? 'deposit' : 'withdraw'),
    deposit,
    withdraw,
    bet,
    win
  };
};