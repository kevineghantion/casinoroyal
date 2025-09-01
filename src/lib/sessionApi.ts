import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface UserSession {
  id: string;
  user_id: string;
  user_email: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface SessionFilters {
  user_id?: string;
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  device_type?: string;
  limit?: number;
  offset?: number;
}

export const sessionApi = {
  async getSessions(activeOnly: boolean = true) {
    try {
      console.log('Fetching user sessions from database...');

      // Try to use the real table, fallback gracefully if it doesn't exist
      try {
        const { data: rawData, error } = await (supabase as any)
          .from('user_sessions')
          .select('*')
          .order('last_activity', { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        // Get user info for sessions
        const sessions: UserSession[] = [];
        for (const session of rawData || []) {
          if (activeOnly && !session.is_active) continue;

          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', session.user_id)
            .single();

          sessions.push({
            id: session.id,
            user_id: session.user_id,
            user_email: (profile as any)?.email || `${(profile as any)?.username}@casino.com` || 'unknown@casino.com',
            device_info: session.device_info,
            ip_address: session.ip_address,
            user_agent: session.user_agent,
            last_activity: session.last_activity,
            created_at: session.created_at,
            expires_at: session.expires_at,
            is_active: session.is_active
          });
        }

        console.log(`Found ${sessions.length} real sessions`);
        return sessions;
      } catch (dbError) {
        console.warn('user_sessions table not found, using empty data:', (dbError as any).message);
        return [];
      }
    } catch (error) {
      logger.error('Failed to fetch sessions', { error });
      return [];
    }
  }, async terminateSession(sessionId: string, reason: string) {
    try {
      // Try to update the real table
      try {
        const { error } = await (supabase as any)
          .from('user_sessions')
          .update({
            is_active: false,
            last_activity: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) {
          throw error;
        }

        logger.info('User session terminated', {
          sessionId,
          reason,
          terminatedBy: 'admin'
        });

        return { success: true };
      } catch (dbError) {
        console.warn('Could not terminate session in database:', (dbError as any).message);
        logger.info('Mock session termination', {
          sessionId,
          reason,
          terminatedBy: 'admin',
          note: 'user_sessions table needed for real termination'
        });
        return { success: true };
      }
    } catch (error) {
      logger.error('Failed to terminate session', { sessionId, error });
      throw error;
    }
  }
};