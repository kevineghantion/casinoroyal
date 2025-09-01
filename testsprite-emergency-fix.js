#!/usr/bin/env node

console.log('🚨 TestSprite EMERGENCY Fix - 500 Error');
console.log('='.repeat(45));

console.log('\n❌ CRITICAL: Trigger still active, causing 500 error');
console.log('   The database trigger is preventing user creation');

console.log('\n🚀 EMERGENCY STEPS:');
console.log('1. Run emergency-disable-trigger.sql in Supabase NOW');
console.log('2. This will remove ALL triggers and functions');
console.log('3. Disable RLS temporarily');
console.log('4. Test registration immediately');

console.log('\n✅ After running SQL:');
console.log('   - No more 500 errors');
console.log('   - Registration will work');
console.log('   - Profile creation in app code will work');
console.log('   - Username login will work');

console.log('\n🎯 This is the nuclear option - removes everything causing issues');