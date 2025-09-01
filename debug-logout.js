// Real-time logout debugging script
console.log('🔍 Starting logout debug...');

// Test 1: Check if the issue is with window.location.href
console.log('Test 1: Window location manipulation');
const originalHref = window.location.href;
console.log('Original href:', originalHref);

try {
  // This is what the logout function does
  window.location.href = '/';
  console.log('✅ window.location.href = "/" works');
} catch (error) {
  console.error('❌ window.location.href failed:', error);
}

// Test 2: Check localStorage clearing
console.log('\nTest 2: localStorage clearing');
localStorage.setItem('test-key', 'test-value');
console.log('Before clear:', localStorage.getItem('test-key'));
localStorage.clear();
console.log('After clear:', localStorage.getItem('test-key'));

// Test 3: Check if auth context is available
console.log('\nTest 3: Auth context debugging');
if (window.__auth_debug) {
  console.log('Auth debug available:', window.__auth_debug.getState());
  
  // Try logout
  console.log('Attempting logout...');
  window.__auth_debug.logout();
} else {
  console.log('❌ Auth debug not available - app might not be loaded');
}

// Test 4: Check supabase client
console.log('\nTest 4: Supabase client');
if (window.supabase) {
  console.log('✅ Supabase client available');
  
  // Test signOut
  window.supabase.auth.signOut().then(() => {
    console.log('✅ Supabase signOut successful');
  }).catch(error => {
    console.error('❌ Supabase signOut failed:', error);
  });
} else {
  console.log('❌ Supabase client not available');
}

console.log('\n🔍 Debug complete. Check console for results.');