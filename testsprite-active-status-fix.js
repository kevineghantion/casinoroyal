#!/usr/bin/env node

console.log('🔍 TestSprite - Active Status Discovery');
console.log('='.repeat(40));

console.log('\n✅ DISCOVERY:');
console.log('   Existing profiles have status = "active"');
console.log('   But our inserts with "active" fail');

console.log('\n🧪 ANALYSIS:');
console.log('   Likely: Database trigger sets status AFTER insert');
console.log('   Or: Default value gets applied after constraint check');

console.log('\n🔧 SOLUTION:');
console.log('   Remove status field from insert completely');
console.log('   Let DB/trigger handle setting it to "active"');

console.log('\n🚀 Current code should work now');
console.log('   Profile insert without status field');
console.log('   DB will set status="active" automatically');