#!/usr/bin/env node

console.log('🔧 TestSprite - Remove Status Field');
console.log('='.repeat(35));

console.log('\n❌ ALL STATUS VALUES REJECTED:');
console.log('   "active" → CHECK constraint violation');
console.log('   null → NOT NULL constraint violation');
console.log('   "pending" → CHECK constraint violation');

console.log('\n✅ FINAL FIX:');
console.log('   Removed status field completely');
console.log('   Let database handle default value');

console.log('\n🧪 Next Steps:');
console.log('1. Run get-constraint-definition.sql to see exact constraint');
console.log('2. Test registration without status field');
console.log('3. If still fails, we need to see constraint definition');

console.log('\n🎯 This should work if DB has valid default');
console.log('   Or we need to see what values are actually allowed');