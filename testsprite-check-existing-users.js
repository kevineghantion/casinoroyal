#!/usr/bin/env node

console.log('🔍 TestSprite - Check Existing Users');
console.log('='.repeat(40));

console.log('\n📋 For existing users who registered before the fix:');
console.log('   Problem: They have auth accounts but no profiles');
console.log('   Solution: Create missing profiles manually');

console.log('\n🛠️ Manual Fix for Existing Users:');
console.log('   1. Open browser console on your app');
console.log('   2. Run: window.supabase (should show Supabase client)');
console.log('   3. Check profiles: await window.supabase.from("profiles").select("*")');
console.log('   4. If "abboud" user missing profile, create it:');

console.log('\n💻 Console Commands to Fix Existing User:');
console.log('```javascript');
console.log('// Check if abboud profile exists');
console.log('const { data } = await window.supabase.from("profiles").select("*").eq("username", "abboud");');
console.log('console.log("Existing profiles:", data);');
console.log('');
console.log('// If no profile found, get user ID and create profile');
console.log('const { data: { user } } = await window.supabase.auth.getUser();');
console.log('if (user) {');
console.log('  const { error } = await window.supabase.from("profiles").insert({');
console.log('    id: user.id,');
console.log('    username: "abboud",');
console.log('    email: user.email,');
console.log('    role: "user"');
console.log('  });');
console.log('  console.log("Profile created:", !error);');
console.log('}');
console.log('```');

console.log('\n🎯 TestSprite Recommendation:');
console.log('   For NEW users: Registration fix will work');
console.log('   For EXISTING users: Manual profile creation needed');
console.log('   Alternative: Re-register with new account');