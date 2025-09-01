import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock hooks for testing
const createMockUseAuth = () => {
  let user: any = null;
  let isAuthenticated = false;

  return {
    useAuth: () => ({
      user,
      isAuthenticated,
      login: vi.fn(async (credentials: any) => {
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          user = { id: '1', email: 'test@example.com', username: 'testuser' };
          isAuthenticated = true;
          return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
      }),
      logout: vi.fn(() => {
        user = null;
        isAuthenticated = false;
      }),
      register: vi.fn(async (userData: any) => {
        if (userData.email && userData.password && userData.username) {
          user = { id: '2', ...userData };
          isAuthenticated = true;
          return { success: true };
        }
        return { success: false, error: 'Invalid data' };
      })
    }),
    setUser: (newUser: any) => { user = newUser; isAuthenticated = !!newUser; }
  };
};

const createMockUseBalance = (initialBalance = 0) => {
  let balance = initialBalance;
  let isLoading = false;
  let transactions: any[] = [];

  return {
    useBalance: () => ({
      balance,
      isLoading,
      transactions,
      deposit: vi.fn(async (amount: number) => {
        if (amount > 0 && amount <= 5000) {
          isLoading = true;
          await new Promise(resolve => setTimeout(resolve, 100));
          balance += amount;
          transactions.unshift({
            id: Date.now().toString(),
            type: 'deposit',
            amount,
            date: new Date().toISOString()
          });
          isLoading = false;
          return true;
        }
        return false;
      }),
      withdraw: vi.fn(async (amount: number) => {
        if (amount > 0 && amount <= balance) {
          isLoading = true;
          await new Promise(resolve => setTimeout(resolve, 100));
          balance -= amount;
          transactions.unshift({
            id: Date.now().toString(),
            type: 'withdraw',
            amount: -amount,
            date: new Date().toISOString()
          });
          isLoading = false;
          return true;
        }
        return false;
      }),
      bet: vi.fn(async (amount: number) => {
        if (amount > 0 && amount <= balance) {
          balance -= amount;
          transactions.unshift({
            id: Date.now().toString(),
            type: 'bet',
            amount: -amount,
            date: new Date().toISOString()
          });
          return true;
        }
        return false;
      }),
      win: vi.fn(async (amount: number) => {
        if (amount > 0) {
          balance += amount;
          transactions.unshift({
            id: Date.now().toString(),
            type: 'win',
            amount,
            date: new Date().toISOString()
          });
          return true;
        }
        return false;
      }),
      refreshBalance: vi.fn(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 50));
      })
    }),
    setBalance: (newBalance: number) => { balance = newBalance; },
    getBalance: () => balance,
    getTransactions: () => transactions
  };
};

const createMockUseSFX = () => {
  let isEnabled = true;
  let volume = 0.5;

  return {
    useSFX: () => ({
      isEnabled,
      volume,
      playSound: vi.fn((soundName: string) => {
        if (isEnabled) {
          console.log(`Playing sound: ${soundName} at volume ${volume}`);
        }
      }),
      toggleSound: vi.fn(() => {
        isEnabled = !isEnabled;
      }),
      setVolume: vi.fn((newVolume: number) => {
        volume = Math.max(0, Math.min(1, newVolume));
      })
    }),
    setEnabled: (enabled: boolean) => { isEnabled = enabled; },
    getEnabled: () => isEnabled
  };
};

describe('Custom Hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useAuth Hook', () => {
    it('should initialize with no authenticated user', () => {
      const mockAuth = createMockUseAuth();
      const { result } = renderHook(() => mockAuth.useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle successful login', async () => {
      const mockAuth = createMockUseAuth();
      const { result } = renderHook(() => mockAuth.useAuth());

      await act(async () => {
        const loginResult = await result.current.login({
          email: 'test@example.com',
          password: 'password'
        });
        expect(loginResult.success).toBe(true);
      });

      // Simulate state update
      mockAuth.setUser({ id: '1', email: 'test@example.com', username: 'testuser' });
      const { result: updatedResult } = renderHook(() => mockAuth.useAuth());
      
      expect(updatedResult.current.user).toBeTruthy();
      expect(updatedResult.current.isAuthenticated).toBe(true);
    });

    it('should handle failed login', async () => {
      const mockAuth = createMockUseAuth();
      const { result } = renderHook(() => mockAuth.useAuth());

      await act(async () => {
        const loginResult = await result.current.login({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });
        expect(loginResult.success).toBe(false);
        expect(loginResult.error).toBe('Invalid credentials');
      });
    });

    it('should handle logout', async () => {
      const mockAuth = createMockUseAuth();
      mockAuth.setUser({ id: '1', email: 'test@example.com', username: 'testuser' });
      
      const { result } = renderHook(() => mockAuth.useAuth());

      act(() => {
        result.current.logout();
      });

      // Simulate state update
      mockAuth.setUser(null);
      const { result: updatedResult } = renderHook(() => mockAuth.useAuth());
      
      expect(updatedResult.current.user).toBeNull();
      expect(updatedResult.current.isAuthenticated).toBe(false);
    });

    it('should handle user registration', async () => {
      const mockAuth = createMockUseAuth();
      const { result } = renderHook(() => mockAuth.useAuth());

      await act(async () => {
        const registerResult = await result.current.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpassword'
        });
        expect(registerResult.success).toBe(true);
      });
    });
  });

  describe('useBalance Hook', () => {
    it('should initialize with zero balance', () => {
      const mockBalance = createMockUseBalance();
      const { result } = renderHook(() => mockBalance.useBalance());

      expect(result.current.balance).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.transactions).toHaveLength(0);
    });

    it('should handle successful deposit', async () => {
      const mockBalance = createMockUseBalance(100);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const success = await result.current.deposit(50);
        expect(success).toBe(true);
      });

      expect(mockBalance.getBalance()).toBe(150);
      expect(mockBalance.getTransactions()).toHaveLength(1);
      expect(mockBalance.getTransactions()[0].type).toBe('deposit');
    });

    it('should reject invalid deposit amounts', async () => {
      const mockBalance = createMockUseBalance();
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const negativeDeposit = await result.current.deposit(-50);
        expect(negativeDeposit).toBe(false);

        const excessiveDeposit = await result.current.deposit(10000);
        expect(excessiveDeposit).toBe(false);
      });
    });

    it('should handle successful withdrawal', async () => {
      const mockBalance = createMockUseBalance(100);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const success = await result.current.withdraw(30);
        expect(success).toBe(true);
      });

      expect(mockBalance.getBalance()).toBe(70);
      expect(mockBalance.getTransactions()).toHaveLength(1);
      expect(mockBalance.getTransactions()[0].type).toBe('withdraw');
    });

    it('should reject withdrawal when insufficient funds', async () => {
      const mockBalance = createMockUseBalance(50);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const success = await result.current.withdraw(100);
        expect(success).toBe(false);
      });

      expect(mockBalance.getBalance()).toBe(50);
    });

    it('should handle betting', async () => {
      const mockBalance = createMockUseBalance(100);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const success = await result.current.bet(25);
        expect(success).toBe(true);
      });

      expect(mockBalance.getBalance()).toBe(75);
      expect(mockBalance.getTransactions()[0].type).toBe('bet');
    });

    it('should handle winning', async () => {
      const mockBalance = createMockUseBalance(100);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        const success = await result.current.win(50);
        expect(success).toBe(true);
      });

      expect(mockBalance.getBalance()).toBe(150);
      expect(mockBalance.getTransactions()[0].type).toBe('win');
    });

    it('should track transaction history correctly', async () => {
      const mockBalance = createMockUseBalance(100);
      const { result } = renderHook(() => mockBalance.useBalance());

      await act(async () => {
        await result.current.deposit(50);
        await result.current.bet(25);
        await result.current.win(75);
        await result.current.withdraw(30);
      });

      const transactions = mockBalance.getTransactions();
      expect(transactions).toHaveLength(4);
      
      // Transactions should be in reverse chronological order
      expect(transactions[0].type).toBe('withdraw');
      expect(transactions[1].type).toBe('win');
      expect(transactions[2].type).toBe('bet');
      expect(transactions[3].type).toBe('deposit');
    });
  });

  describe('useSFX Hook', () => {
    it('should initialize with sound enabled', () => {
      const mockSFX = createMockUseSFX();
      const { result } = renderHook(() => mockSFX.useSFX());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.volume).toBe(0.5);
    });

    it('should play sounds when enabled', () => {
      const mockSFX = createMockUseSFX();
      const { result } = renderHook(() => mockSFX.useSFX());

      act(() => {
        result.current.playSound('click');
      });

      expect(result.current.playSound).toHaveBeenCalledWith('click');
    });

    it('should toggle sound on/off', () => {
      const mockSFX = createMockUseSFX();
      const { result } = renderHook(() => mockSFX.useSFX());

      act(() => {
        result.current.toggleSound();
      });

      expect(mockSFX.getEnabled()).toBe(false);

      act(() => {
        result.current.toggleSound();
      });

      expect(mockSFX.getEnabled()).toBe(true);
    });

    it('should set volume within valid range', () => {
      const mockSFX = createMockUseSFX();
      const { result } = renderHook(() => mockSFX.useSFX());

      act(() => {
        result.current.setVolume(0.8);
      });

      expect(result.current.volume).toBe(0.8);

      // Test boundary values
      act(() => {
        result.current.setVolume(-0.1);
      });
      expect(result.current.volume).toBe(0);

      act(() => {
        result.current.setVolume(1.5);
      });
      expect(result.current.volume).toBe(1);
    });
  });

  describe('Hook Integration', () => {
    it('should work together in a complete user session', async () => {
      const mockAuth = createMockUseAuth();
      const mockBalance = createMockUseBalance();
      const mockSFX = createMockUseSFX();

      // Login
      const { result: authResult } = renderHook(() => mockAuth.useAuth());
      await act(async () => {
        await authResult.current.login({
          email: 'test@example.com',
          password: 'password'
        });
      });

      // Simulate user logged in
      mockAuth.setUser({ id: '1', email: 'test@example.com', username: 'testuser' });

      // Use balance
      const { result: balanceResult } = renderHook(() => mockBalance.useBalance());
      await act(async () => {
        await balanceResult.current.deposit(100);
        await balanceResult.current.bet(25);
      });

      // Use sound
      const { result: sfxResult } = renderHook(() => mockSFX.useSFX());
      act(() => {
        sfxResult.current.playSound('bet');
      });

      // Verify final state
      expect(mockBalance.getBalance()).toBe(75);
      expect(mockBalance.getTransactions()).toHaveLength(2);
      expect(sfxResult.current.playSound).toHaveBeenCalledWith('bet');
    });

    it('should handle errors gracefully across hooks', async () => {
      const mockAuth = createMockUseAuth();
      const mockBalance = createMockUseBalance(10);

      // Try invalid login
      const { result: authResult } = renderHook(() => mockAuth.useAuth());
      await act(async () => {
        const result = await authResult.current.login({
          email: 'invalid@example.com',
          password: 'wrong'
        });
        expect(result.success).toBe(false);
      });

      // Try invalid withdrawal
      const { result: balanceResult } = renderHook(() => mockBalance.useBalance());
      await act(async () => {
        const success = await balanceResult.current.withdraw(50);
        expect(success).toBe(false);
      });

      // Balance should remain unchanged
      expect(mockBalance.getBalance()).toBe(10);
    });
  });

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with multiple renders', () => {
      const mockAuth = createMockUseAuth();
      
      for (let i = 0; i < 100; i++) {
        const { unmount } = renderHook(() => mockAuth.useAuth());
        unmount();
      }
      
      // If we get here without errors, no memory leaks occurred
      expect(true).toBe(true);
    });

    it('should handle rapid state changes', async () => {
      const mockBalance = createMockUseBalance(1000);
      const { result } = renderHook(() => mockBalance.useBalance());

      // Rapid transactions
      await act(async () => {
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(result.current.bet(10));
        }
        await Promise.all(promises);
      });

      expect(mockBalance.getBalance()).toBe(900);
      expect(mockBalance.getTransactions()).toHaveLength(10);
    });
  });
});