// Admin API Client Functions with Mock Data Support
// In production, these would connect to real backend endpoints

const DEV_MOCKS = process.env.NODE_ENV === 'development';

export interface User {
  id: string;
  avatar: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  status: 'active' | 'blocked' | 'suspended';
  balance: number;
  lastLogin: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  user: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'payout' | 'adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  timestamp: string;
  txId: string;
  gameType?: string;
}

export interface GameSession {
  id: string;
  gameType: 'rocket' | 'blackjack' | 'poker' | 'slots';
  playersCount: number;
  startedAt: string;
  status: 'active' | 'completed' | 'terminated';
  totalBet: number;
  totalPayout: number;
}

export interface KPIData {
  totalUsers: number;
  activeSessions: number;
  totalBalance: number;
  dailyDeposits: number;
  dailyWithdrawals: number;
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: any;
  timestamp: string;
  ip: string;
}

// Mock Data Generators
const generateMockUsers = (count: number = 50): User[] => {
  const users: User[] = [];
  const roles: User['role'][] = ['user', 'user', 'user', 'user', 'admin'];
  const statuses: User['status'][] = ['active', 'active', 'active', 'blocked'];
  
  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user_${i}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      username: `player${i}`,
      email: `player${i}@casino.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      balance: Math.floor(Math.random() * 10000),
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return users;
};

const generateMockTransactions = (count: number = 100): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: Transaction['type'][] = ['deposit', 'withdraw', 'bet', 'payout', 'adjustment'];
  const statuses: Transaction['status'][] = ['completed', 'pending', 'failed'];
  
  for (let i = 1; i <= count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    transactions.push({
      id: `tx_${i}`,
      userId: `user_${Math.floor(Math.random() * 50) + 1}`,
      user: `player${Math.floor(Math.random() * 50) + 1}`,
      type,
      amount: Math.floor(Math.random() * 1000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      txId: `tx_${Date.now()}_${i}`,
      gameType: type === 'bet' || type === 'payout' ? ['rocket', 'blackjack', 'poker'][Math.floor(Math.random() * 3)] : undefined,
    });
  }
  return transactions;
};

const generateMockSessions = (count: number = 20): GameSession[] => {
  const sessions: GameSession[] = [];
  const gameTypes: GameSession['gameType'][] = ['rocket', 'blackjack', 'poker', 'slots'];
  
  for (let i = 1; i <= count; i++) {
    const totalBet = Math.floor(Math.random() * 5000);
    sessions.push({
      id: `session_${i}`,
      gameType: gameTypes[Math.floor(Math.random() * gameTypes.length)],
      playersCount: Math.floor(Math.random() * 10) + 1,
      startedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.3 ? 'active' : 'completed',
      totalBet,
      totalPayout: Math.floor(totalBet * (0.8 + Math.random() * 0.4)),
    });
  }
  return sessions;
};

// API Functions
export const adminApi = {
  // Dashboard & Analytics
  async getSummary(range: '24h' | '7d' | '30d' = '24h'): Promise<{ kpis: KPIData; charts: any }> {
    if (DEV_MOCKS) {
      const kpis: KPIData = {
        totalUsers: 1247,
        activeSessions: 23,
        totalBalance: 2847392,
        dailyDeposits: 45632,
        dailyWithdrawals: 23156,
        revenue24h: 8456,
        revenue7d: 67234,
        revenue30d: 245678,
      };
      
      const charts = {
        revenue: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          revenue: Math.floor(Math.random() * 1000),
        })),
        transactions: [
          { type: 'deposits', value: 35, color: '#e91e63' },
          { type: 'withdrawals', value: 25, color: '#00bcd4' },
          { type: 'bets', value: 40, color: '#9c27b0' },
        ],
      };
      
      return { kpis, charts };
    }
    
    const response = await fetch(`/api/admin/summary?range=${range}`, {
      credentials: 'include',
    });
    return response.json();
  },

  // User Management
  async getUsers(params: {
    query?: string;
    page?: number;
    limit?: number;
    sort?: string;
    filter?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    if (DEV_MOCKS) {
      const users = generateMockUsers();
      const filtered = users.filter(user => 
        !params.query || 
        user.username.toLowerCase().includes(params.query.toLowerCase()) ||
        user.email.toLowerCase().includes(params.query.toLowerCase())
      );
      
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        users: filtered.slice(start, end),
        total: filtered.length,
      };
    }
    
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(`/api/admin/users?${searchParams}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async adjustUserBalance(userId: string, amount: number, reason: string): Promise<{ success: boolean; updatedBalance: number; auditId: string }> {
    if (DEV_MOCKS) {
      return {
        success: true,
        updatedBalance: Math.floor(Math.random() * 10000),
        auditId: `audit_${Date.now()}`,
      };
    }
    
    const response = await fetch(`/api/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    return response.json();
  },

  async updateUserRole(userId: string, role: User['role'], reason: string): Promise<{ success: boolean }> {
    if (DEV_MOCKS) {
      return { success: true };
    }
    
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, reason }),
    });
    return response.json();
  },

  async freezeUser(userId: string, reason: string): Promise<{ success: boolean }> {
    if (DEV_MOCKS) {
      return { success: true };
    }
    
    const response = await fetch(`/api/admin/users/${userId}/freeze`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Transactions
  async getTransactions(filters: any = {}): Promise<{ transactions: Transaction[]; total: number }> {
    if (DEV_MOCKS) {
      const transactions = generateMockTransactions();
      return {
        transactions: transactions.slice(0, 20),
        total: transactions.length,
      };
    }
    
    const searchParams = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/transactions?${searchParams}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async reverseTransaction(txId: string, reason: string): Promise<{ success: boolean; auditId: string }> {
    if (DEV_MOCKS) {
      return {
        success: true,
        auditId: `audit_${Date.now()}`,
      };
    }
    
    const response = await fetch(`/api/admin/transactions/${txId}/reverse`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Game Sessions
  async getSessions(active = true): Promise<{ sessions: GameSession[] }> {
    if (DEV_MOCKS) {
      const sessions = generateMockSessions();
      return {
        sessions: active ? sessions.filter(s => s.status === 'active') : sessions,
      };
    }
    
    const response = await fetch(`/api/admin/sessions?active=${active}`, {
      credentials: 'include',
    });
    return response.json();
  },

  async terminateSession(sessionId: string, reason: string): Promise<{ success: boolean }> {
    if (DEV_MOCKS) {
      return { success: true };
    }
    
    const response = await fetch(`/api/admin/sessions/${sessionId}/terminate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Audit Logs
  async getAuditLogs(filters: any = {}): Promise<{ logs: AuditLog[] }> {
    if (DEV_MOCKS) {
      const logs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
        id: `audit_${i}`,
        actor: `admin_${Math.floor(Math.random() * 3) + 1}`,
        action: ['adjust_balance', 'change_role', 'freeze_user', 'reverse_transaction'][Math.floor(Math.random() * 4)],
        target: `user_${Math.floor(Math.random() * 50) + 1}`,
        details: { amount: Math.floor(Math.random() * 1000), reason: 'Administrative action' },
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      }));
      
      return { logs };
    }
    
    const searchParams = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/audit?${searchParams}`, {
      credentials: 'include',
    });
    return response.json();
  },
};