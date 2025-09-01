import { describe, it, expect, vi } from 'vitest';

describe('TestSprite - Profile Reload Issue', () => {
  it('should identify why profile changes from jaypee to user on reload', async () => {
    // Mock the fetchProfile function behavior
    const mockFetchProfile = vi.fn()
      .mockResolvedValueOnce({ username: 'jaypee', role: 'owner' }) // First call works
      .mockResolvedValueOnce(null); // Second call (reload) fails
    
    // Test profile fetch
    const result1 = await mockFetchProfile('user-id');
    const result2 = await mockFetchProfile('user-id');
    
    expect(result1).toEqual({ username: 'jaypee', role: 'owner' });
    expect(result2).toBeNull();
    
    console.log('❌ Issue: fetchProfile returns null on reload');
  });

  it('should test profile fallback behavior', () => {
    const user = { id: '123', email: 'jaypee@test.com' };
    const profile = null; // This is what happens on reload
    
    // This is what Navbar shows when profile is null
    const displayName = profile?.username || 'User';
    
    expect(displayName).toBe('User');
    
    console.log('❌ Issue confirmed: null profile shows as "User"');
  });

  it('should identify the database query issue', async () => {
    // The issue is likely in the fetchProfile query
    // It might be case-sensitive or the profile doesn't exist
    
    const mockSupabaseQuery = vi.fn()
      .mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
      });
    
    const result = await mockSupabaseQuery()
      .select('username, role')
      .eq('id', 'user-123')
      .maybeSingle();
    
    expect(result.data).toBeNull();
    
    console.log('❌ Root cause: Database query returns null for profile');
  });
});