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

export const sessionApi = {
    async getSessions(activeOnly: boolean = true) {
        try {
            // Query user_sessions with profiles joined
            const { data, error } = await supabase
                .from('user_sessions')
                .select(`
          id,
          user_id,
          device_info,
          ip_address,
          user_agent,
          created_at,
          last_activity,
          expires_at,
          is_active,
          profiles!inner(username)
        `)
                .eq(activeOnly ? 'is_active' : null, activeOnly ? true : null)
                .order('last_activity', { ascending: false });

            if (error) throw error;

            const sessions: UserSession[] = (data || []).map(session => ({
                id: session.id,
                user_id: session.user_id,
                user_email: `${session.profiles.username}@casino.com`,
                device_info: session.device_info,
                ip_address: session.ip_address,
                user_agent: session.user_agent,
                last_activity: session.last_activity,
                created_at: session.created_at,
                expires_at: session.expires_at,
                is_active: session.is_active
            }));

            return sessions;
        } catch (error) {
            logger.error('Failed to fetch sessions', { error });
            throw error;
        }
    },

    async terminateSession(sessionId: string, reason: string) {
        try {
            const { error } = await supabase
                .from('user_sessions')
                .update({ is_active: false })
                .eq('id', sessionId);

            if (error) throw error;

            logger.info('User session terminated', {
                sessionId,
                reason,
                terminatedBy: 'admin'
            });

            return { success: true };
        } catch (error) {
            logger.error('Failed to terminate session', { sessionId, error });
            throw error;
        }
    }
};
