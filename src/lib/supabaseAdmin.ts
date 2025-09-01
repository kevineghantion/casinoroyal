import { supabase } from '@/integrations/supabase/client';
import { validateAndSanitize } from './inputValidator';
import { secureLog } from './logger';

export interface RealKPIData {
  totalUsers: number;
  activeSessions: number;
  totalBalance: number;
  dailyDeposits: number;
  dailyWithdrawals: number;
  revenue24h: number;
  revenue7d: number;
  revenue30d: number;
}

export const supabaseAdmin = {
  async getRealKPIs(): Promise<RealKPIData> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total balance (sum of all user balances)
      const { data: balanceData } = await supabase
        .from('profiles')
        .select('balance');

      const totalBalance = balanceData?.reduce((sum, profile) => sum + (profile.balance || 0), 0) || 0;

      // Get recent transactions for revenue calculation
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get daily deposits (last 24h)
      const { data: dailyDepositsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'deposit')
        .gte('created_at', yesterday.toISOString());

      const dailyDeposits = dailyDepositsData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

      // Get daily withdrawals (last 24h)
      const { data: dailyWithdrawalsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'withdraw')
        .gte('created_at', yesterday.toISOString());

      const dailyWithdrawals = dailyWithdrawalsData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

      // Calculate revenue (deposits - withdrawals + losses - wins)
      const { data: revenue24hData } = await supabase
        .from('transactions')
        .select('amount, type')
        .in('type', ['deposit', 'withdraw', 'win', 'loss'])
        .gte('created_at', yesterday.toISOString());

      const revenue24h = revenue24hData?.reduce((sum, tx) => {
        if (tx.type === 'deposit' || tx.type === 'loss') return sum + tx.amount;
        if (tx.type === 'withdraw' || tx.type === 'win') return sum - tx.amount;
        return sum;
      }, 0) || 0;

      // 7-day revenue
      const { data: revenue7dData } = await supabase
        .from('transactions')
        .select('amount, type')
        .in('type', ['deposit', 'withdraw', 'win', 'loss'])
        .gte('created_at', weekAgo.toISOString());

      const revenue7d = revenue7dData?.reduce((sum, tx) => {
        if (tx.type === 'deposit' || tx.type === 'loss') return sum + tx.amount;
        if (tx.type === 'withdraw' || tx.type === 'win') return sum - tx.amount;
        return sum;
      }, 0) || 0;

      // 30-day revenue
      const { data: revenue30dData } = await supabase
        .from('transactions')
        .select('amount, type')
        .in('type', ['deposit', 'withdraw', 'win', 'loss'])
        .gte('created_at', monthAgo.toISOString());

      const revenue30d = revenue30dData?.reduce((sum, tx) => {
        if (tx.type === 'deposit' || tx.type === 'loss') return sum + tx.amount;
        if (tx.type === 'withdraw' || tx.type === 'win') return sum - tx.amount;
        return sum;
      }, 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        activeSessions: 0, // Would need real-time session tracking
        totalBalance,
        dailyDeposits,
        dailyWithdrawals,
        revenue24h,
        revenue7d,
        revenue30d,
      };
    } catch (error) {
      console.error('Error fetching real KPIs:', error);
      // Return zeros if error
      return {
        totalUsers: 0,
        activeSessions: 0,
        totalBalance: 0,
        dailyDeposits: 0,
        dailyWithdrawals: 0,
        revenue24h: 0,
        revenue7d: 0,
        revenue30d: 0,
      };
    }
  },

  async getRealUsers(params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: users, error, count } = await supabase
      .from('profiles')
      .select('id, username, email, role, status, balance, created_at, last_login_at', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      users: users || [],
      total: count || 0,
    };
  },

  async getRealTransactions(params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      transactions: transactions || [],
      total: count || 0,
    };
  },

  async createUser(username: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, email }
      }
    });

    if (error) throw error;

    // Create profile manually since we removed the trigger
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          role: 'user',
          balance: 0,
          total_winnings: 0,
          total_losses: 0,
          games_played: 0,
          status: 'active'
        });

      if (profileError) {
        secureLog.error('Profile creation error', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
    }

    return data;
  },

  async adjustUserBalance(userId: string, amount: number, reason: string, adminId: string) {
    // Validate inputs
    if (!validateAndSanitize.uuid(userId) || !validateAndSanitize.uuid(adminId)) {
      throw new Error('Invalid user ID format');
    }

    const sanitizedReason = validateAndSanitize.string(reason, 500);

    // Get current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance, username')
      .eq('id', userId)
      .single();

    if (!profile) throw new Error('User not found');

    const balanceBefore = profile.balance || 0;
    const balanceAfter = balanceBefore + amount;

    if (balanceAfter < 0) {
      throw new Error('Insufficient balance for this operation');
    }

    // Update balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: balanceAfter })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create transaction record with validation
    const validatedUserId = validateAndSanitize.uuid(userId);
    const validatedAdminId = validateAndSanitize.uuid(adminId);
    
    if (!validatedUserId || !validatedAdminId) {
      throw new Error('Invalid UUID format for transaction');
    }

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: validatedUserId,
        admin_id: validatedAdminId,
        type: 'adjustment',
        amount: Math.abs(amount),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: sanitizedReason,
        status: 'completed'
      });

    if (txError) throw txError;

    // Log admin action with error handling
    try {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: validatedAdminId,
          target_user_id: validatedUserId,
          action: 'balance_adjustment',
          details: {
            amount,
            reason: sanitizedReason,
            balance_before: balanceBefore,
            balance_after: balanceAfter
          }
        });
    } catch (auditError) {
      secureLog.error('Failed to log admin action', auditError instanceof Error ? auditError.message : 'Unknown error');
    }

    return { newBalance: balanceAfter, username: profile.username };
  },

  async getRecentActivity(limit = 10) {
    // Get recent transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles!inner(username)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Get recent user registrations
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('username, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const activities = [];

    // Add transactions
    transactions?.forEach(tx => {
      let action = '';
      let type = '';

      switch (tx.type) {
        case 'deposit':
          action = 'Deposit processed';
          type = 'deposit';
          break;
        case 'withdraw':
          action = 'Withdrawal processed';
          type = 'withdrawal';
          break;
        case 'adjustment':
          action = 'User balance adjusted';
          type = 'adjustment';
          break;
        case 'win':
          action = 'Game win recorded';
          type = 'win';
          break;
        case 'loss':
          action = 'Game loss recorded';
          type = 'loss';
          break;
      }

      activities.push({
        action,
        user: tx.profiles?.username || 'Unknown',
        time: tx.created_at,
        type
      });
    });

    // Add new registrations
    newUsers?.forEach(user => {
      activities.push({
        action: 'New user registered',
        user: user.username,
        time: user.created_at,
        type: 'registration'
      });
    });

    // Sort by time and return latest
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  },

  async updateUserStatus(userId: string, status: string, adminId: string, reason: string) {
    // Validate inputs
    if (!validateAndSanitize.uuid(userId) || !validateAndSanitize.uuid(adminId)) {
      throw new Error('Invalid user ID format');
    }

    const validStatuses = ['active', 'suspended', 'blocked'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const sanitizedReason = validateAndSanitize.string(reason, 500);

    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) throw error;

    // Log admin action with validation
    const validatedAdminId = validateAndSanitize.uuid(adminId);
    const validatedUserId = validateAndSanitize.uuid(userId);
    
    if (validatedAdminId && validatedUserId) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: validatedAdminId,
          target_user_id: validatedUserId,
          action: `status_change_${status}`,
          details: { reason: sanitizedReason, new_status: status }
        });
    }

    return { success: true };
  },

  async updateUserRole(userId: string, role: string, adminId: string, reason: string) {
    // Validate inputs
    if (!validateAndSanitize.uuid(userId) || !validateAndSanitize.uuid(adminId)) {
      throw new Error('Invalid user ID format');
    }

    const validRoles = ['user', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role value');
    }

    const sanitizedReason = validateAndSanitize.string(reason, 500);

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;

    // Log admin action with validation
    const validatedAdminId = validateAndSanitize.uuid(adminId);
    const validatedUserId = validateAndSanitize.uuid(userId);
    
    if (validatedAdminId && validatedUserId) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: validatedAdminId,
          target_user_id: validatedUserId,
          action: 'role_change',
          details: { reason: sanitizedReason, new_role: role }
        });
    }

    return { success: true };
  },

  async deleteUser(userId: string, adminId: string, reason: string) {
    // Validate inputs
    if (!validateAndSanitize.uuid(userId) || !validateAndSanitize.uuid(adminId)) {
      throw new Error('Invalid user ID format');
    }

    const sanitizedReason = validateAndSanitize.string(reason, 500);

    // Log admin action before deletion with validation
    const validatedAdminId = validateAndSanitize.uuid(adminId);
    const validatedUserId = validateAndSanitize.uuid(userId);
    
    if (validatedAdminId && validatedUserId) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: validatedAdminId,
          target_user_id: validatedUserId,
          action: 'user_delete',
          details: { reason: sanitizedReason }
        });
    }

    // Delete from auth.users (will cascade to profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    return { success: true };
  },

  formatTimeAgo(timestamp: string | null) {
    if (!timestamp) return 'Never';

    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // For older dates, show formatted date
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  async addCredits(userId: string, amount: number, reason: string, adminId: string) {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    return await this.adjustUserBalance(userId, amount, reason, adminId);
  }
};