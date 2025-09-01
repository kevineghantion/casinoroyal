// Debug script to test profile persistence after reload
console.log('🔍 Testing profile persistence fix...');

// Check current auth state
if (window.__auth_debug) {
  const state = window.__auth_debug.getState();
  console.log('Current auth state:', state);
  
  if (state.user && state.profile) {
    console.log('✅ User and profile loaded correctly');
    console.log('Username:', state.profile.username);
    console.log('Role:', state.profile.role);
  } else if (state.user && !state.profile) {
    console.log('❌ User loaded but profile missing');
  } else {
    console.log('ℹ️ No user logged in');
  }
} else {
  console.log('❌ Auth debug not available');
}

// Test logout functionality
if (window.__auth_debug) {
  console.log('\n🔍 Testing logout...');
  // Don't actually logout, just check if function exists
  console.log('Logout function available:', typeof window.__auth_debug.logout === 'function');
}

console.log('\n✅ Debug complete');