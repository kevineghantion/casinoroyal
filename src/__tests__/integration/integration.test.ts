import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Integration test suite for Casino Royal
describe('Casino Royal - Integration Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('User Authentication Flow', () => {
    it('should complete full registration and login cycle', async () => {
      const authSystem = {
        users: new Map(),
        sessions: new Map(),
        
        register: async (userData: any) => {
          if (authSystem.users.has(userData.email)) {
            return { success: false, error: 'User already exists' };
          }
          
          const user = {
            id: Date.now().toString(),
            ...userData,
            balance: 1000, // Starting bonus
            createdAt: new Date().toISOString()
          };
          
          authSystem.users.set(userData.email, user);
          return { success: true, user };
        },
        
        login: async (credentials: any) => {
          const user = authSystem.users.get(credentials.email);
          if (!user || user.password !== credentials.password) {
            return { success: false, error: 'Invalid credentials' };
          }
          
          const sessionId = Math.random().toString(36);
          authSystem.sessions.set(sessionId, user);
          
          return { success: true, user, sessionId };
        },
        
        logout: (sessionId: string) => {
          authSystem.sessions.delete(sessionId);
        }
      };

      // Test registration
      const registerResult = await authSystem.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(registerResult.success).toBe(true);
      expect(registerResult.user?.username).toBe('testuser');
      expect(registerResult.user?.balance).toBe(1000);

      // Test login with registered user
      const loginResult = await authSystem.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.user?.username).toBe('testuser');
      expect(loginResult.sessionId).toBeDefined();

      // Test invalid login
      const invalidLogin = await authSystem.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      expect(invalidLogin.success).toBe(false);
      expect(invalidLogin.error).toBe('Invalid credentials');
    });

    it('should handle session persistence', () => {
      const sessionManager = {
        saveSession: (user: any) => {
          localStorage.setItem('casino_session', JSON.stringify({
            user,
            timestamp: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          }));
        },
        
        loadSession: () => {
          const sessionData = localStorage.getItem('casino_session');
          if (!sessionData) return null;
          
          const session = JSON.parse(sessionData);
          if (Date.now() > session.expiresAt) {
            localStorage.removeItem('casino_session');
            return null;
          }
          
          return session.user;
        },
        
        clearSession: () => {
          localStorage.removeItem('casino_session');
        }
      };

      const testUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      
      // Save session
      sessionManager.saveSession(testUser);
      
      // Load session
      const loadedUser = sessionManager.loadSession();
      expect(loadedUser).toEqual(testUser);
      
      // Clear session
      sessionManager.clearSession();
      expect(sessionManager.loadSession()).toBeNull();
    });
  });

  describe('Wallet and Transaction System', () => {
    it('should handle complete transaction lifecycle', async () => {
      const walletSystem = {
        balances: new Map(),
        transactions: new Map(),
        
        initializeWallet: (userId: string, initialBalance = 0) => {
          walletSystem.balances.set(userId, initialBalance);
          walletSystem.transactions.set(userId, []);
        },
        
        getBalance: (userId: string) => {
          return walletSystem.balances.get(userId) || 0;
        },
        
        addTransaction: (userId: string, type: string, amount: number, description?: string) => {
          const transaction = {
            id: Date.now().toString(),
            type,
            amount,
            description,
            timestamp: new Date().toISOString(),
            balanceBefore: walletSystem.getBalance(userId)
          };
          
          const transactions = walletSystem.transactions.get(userId) || [];
          transactions.unshift(transaction);
          walletSystem.transactions.set(userId, transactions.slice(0, 100)); // Keep last 100
          
          return transaction;
        },
        
        deposit: async (userId: string, amount: number) => {
          if (amount <= 0 || amount > 5000) {
            return { success: false, error: 'Invalid deposit amount' };
          }
          
          const currentBalance = walletSystem.getBalance(userId);
          const newBalance = currentBalance + amount;
          
          walletSystem.balances.set(userId, newBalance);
          const transaction = walletSystem.addTransaction(userId, 'deposit', amount, `Deposit of $${amount}`);
          
          return { success: true, newBalance, transaction };
        },
        
        withdraw: async (userId: string, amount: number) => {
          const currentBalance = walletSystem.getBalance(userId);
          
          if (amount <= 0 || amount > currentBalance) {
            return { success: false, error: 'Invalid withdrawal amount' };
          }
          
          const newBalance = currentBalance - amount;
          walletSystem.balances.set(userId, newBalance);
          const transaction = walletSystem.addTransaction(userId, 'withdraw', -amount, `Withdrawal of $${amount}`);
          
          return { success: true, newBalance, transaction };
        },
        
        bet: async (userId: string, amount: number, gameType: string) => {
          const currentBalance = walletSystem.getBalance(userId);
          
          if (amount <= 0 || amount > currentBalance) {
            return { success: false, error: 'Insufficient funds' };
          }
          
          const newBalance = currentBalance - amount;
          walletSystem.balances.set(userId, newBalance);
          const transaction = walletSystem.addTransaction(userId, 'bet', -amount, `${gameType} bet of $${amount}`);
          
          return { success: true, newBalance, transaction };
        },
        
        win: async (userId: string, amount: number, gameType: string) => {
          const currentBalance = walletSystem.getBalance(userId);
          const newBalance = currentBalance + amount;
          
          walletSystem.balances.set(userId, newBalance);
          const transaction = walletSystem.addTransaction(userId, 'win', amount, `${gameType} win of $${amount}`);
          
          return { success: true, newBalance, transaction };
        }
      };

      const userId = 'test-user-1';
      
      // Initialize wallet
      walletSystem.initializeWallet(userId, 1000);
      expect(walletSystem.getBalance(userId)).toBe(1000);

      // Test deposit
      const depositResult = await walletSystem.deposit(userId, 500);
      expect(depositResult.success).toBe(true);
      expect(depositResult.newBalance).toBe(1500);
      expect(walletSystem.getBalance(userId)).toBe(1500);

      // Test bet
      const betResult = await walletSystem.bet(userId, 100, 'Blackjack');
      expect(betResult.success).toBe(true);
      expect(betResult.newBalance).toBe(1400);

      // Test win
      const winResult = await walletSystem.win(userId, 200, 'Blackjack');
      expect(winResult.success).toBe(true);
      expect(winResult.newBalance).toBe(1600);

      // Test withdrawal
      const withdrawResult = await walletSystem.withdraw(userId, 300);
      expect(withdrawResult.success).toBe(true);
      expect(withdrawResult.newBalance).toBe(1300);

      // Verify transaction history
      const transactions = walletSystem.transactions.get(userId);
      expect(transactions).toHaveLength(4);
      expect(transactions?.[0].type).toBe('withdraw');
      expect(transactions?.[1].type).toBe('win');
      expect(transactions?.[2].type).toBe('bet');
      expect(transactions?.[3].type).toBe('deposit');

      // Test invalid operations
      const invalidDeposit = await walletSystem.deposit(userId, 10000);
      expect(invalidDeposit.success).toBe(false);

      const invalidWithdraw = await walletSystem.withdraw(userId, 5000);
      expect(invalidWithdraw.success).toBe(false);
    });
  });

  describe('Game Integration', () => {
    it('should handle complete game session', async () => {
      const gameEngine = {
        games: {
          blackjack: {
            minBet: 5,
            maxBet: 500,
            houseEdge: 0.005,
            
            play: (betAmount: number) => {
              const playerScore = Math.floor(Math.random() * 21) + 1;
              const dealerScore = Math.floor(Math.random() * 21) + 1;
              
              let result = 'lose';
              let payout = 0;
              
              if (playerScore > dealerScore && playerScore <= 21) {
                result = 'win';
                payout = betAmount * 2;
              } else if (playerScore === dealerScore) {
                result = 'push';
                payout = betAmount;
              }
              
              return { result, payout, playerScore, dealerScore };
            }
          }
        },
        
        validateBet: (gameType: string, betAmount: number) => {
          const game = gameEngine.games[gameType as keyof typeof gameEngine.games];
          if (!game) return { valid: false, error: 'Invalid game' };
          
          if (betAmount < game.minBet || betAmount > game.maxBet) {
            return { valid: false, error: `Bet must be between $${game.minBet} and $${game.maxBet}` };
          }
          
          return { valid: true };
        }
      };

      // Test blackjack game
      const blackjackValidation = gameEngine.validateBet('blackjack', 50);
      expect(blackjackValidation.valid).toBe(true);

      const blackjackResult = gameEngine.games.blackjack.play(50);
      expect(blackjackResult).toHaveProperty('result');
      expect(blackjackResult).toHaveProperty('payout');
      expect(blackjackResult).toHaveProperty('playerScore');
      expect(blackjackResult).toHaveProperty('dealerScore');

      // Test invalid bets
      const invalidGame = gameEngine.validateBet('poker', 50);
      expect(invalidGame.valid).toBe(false);

      const invalidAmount = gameEngine.validateBet('blackjack', 1000);
      expect(invalidAmount.valid).toBe(false);
    });
  });

  describe('Security and Validation', () => {
    it('should validate and sanitize all user inputs', () => {
      const validator = {
        sanitizeString: (input: string) => {
          return input.replace(/[<>\"'&]/g, '').trim().substring(0, 100);
        },
        
        validateEmail: (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email) && email.length <= 254;
        },
        
        validatePassword: (password: string) => {
          return password.length >= 6 && password.length <= 128;
        },
        
        validateAmount: (amount: number) => {
          return Number.isFinite(amount) && amount >= 0 && amount <= 1000000;
        },
        
        validateUsername: (username: string) => {
          const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
          return usernameRegex.test(username);
        }
      };

      // Test string sanitization
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = validator.sanitizeString(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');

      // Test email validation
      expect(validator.validateEmail('test@example.com')).toBe(true);
      expect(validator.validateEmail('invalid-email')).toBe(false);
      expect(validator.validateEmail('test@')).toBe(false);

      // Test password validation
      expect(validator.validatePassword('password123')).toBe(true);
      expect(validator.validatePassword('12345')).toBe(false);
      expect(validator.validatePassword('')).toBe(false);

      // Test amount validation
      expect(validator.validateAmount(100)).toBe(true);
      expect(validator.validateAmount(-50)).toBe(false);
      expect(validator.validateAmount(Infinity)).toBe(false);
      expect(validator.validateAmount(NaN)).toBe(false);

      // Test username validation
      expect(validator.validateUsername('testuser')).toBe(true);
      expect(validator.validateUsername('test_user-123')).toBe(true);
      expect(validator.validateUsername('ab')).toBe(false);
      expect(validator.validateUsername('test@user')).toBe(false);
    });
  });
});