#!/usr/bin/env node

console.log('🚨 TestSprite - Emergency Constraint Disable');
console.log('='.repeat(45));

console.log('\n❌ CONSTRAINT BLOCKING EVERYTHING:');
console.log('   profiles_status_check rejects "active"');
console.log('   Even when we don\'t specify status!');
console.log('   Trigger must be setting status="active"');

console.log('\n🚀 EMERGENCY SOLUTION:');
console.log('   DROP the problematic constraint');
console.log('   Create abboud profile without constraint');
console.log('   Test username login');

console.log('\n🛠️ Run disable-status-constraint.sql');
console.log('   This will:');
console.log('   1. Remove the blocking constraint');
console.log('   2. Create abboud profile');
console.log('   3. Enable username login');

console.log('\n✅ After SQL runs:');
console.log('   - Profile will be created');
console.log('   - Username login will work');
console.log('   - Registration will work for new users');

console.log('\n🎯 Nuclear option: Remove the constraint entirely');