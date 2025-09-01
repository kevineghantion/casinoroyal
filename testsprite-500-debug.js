#!/usr/bin/env node

console.log('🚨 TestSprite - 500 Error Debug');
console.log('='.repeat(35));

console.log('\n❌ ERROR: Database error saving new user (500)');
console.log('   Cause: Database trigger is failing');
console.log('   Issue: Trigger trying to insert into profiles table');

console.log('\n🔍 Likely Problems:');
console.log('1. ❌ Profiles table missing columns');
console.log('2. ❌ RLS policies too restrictive');
console.log('3. ❌ Trigger function has syntax error');
console.log('4. ❌ Username column conflict');

console.log('\n✅ TestSprite Quick Fix:');
console.log('   Disable the trigger temporarily');
console.log('   Go back to app-level profile creation');
console.log('   Fix the database schema first');

console.log('\n🛠️ Immediate Solution:');
console.log('   DROP TRIGGER on_auth_user_created ON auth.users;');
console.log('   This will stop the 500 error');

console.log('\n🎯 Then fix registration in app code');