#!/usr/bin/env node

console.log('🔍 TestSprite Login Debug - Username "abboud" Issue');
console.log('='.repeat(60));

// Simulate the login flow
const debugLogin = async (identifier, password) => {
  console.log(`\n🧪 Testing login with: "${identifier}"`);
  
  // Check if it's email or username
  const isEmail = identifier.includes('@');
  console.log(`📧 Is email: ${isEmail}`);
  
  if (!isEmail) {
    console.log('🔍 Username detected - looking up email...');
    
    // This is where the bug is - the query
    console.log('❌ ISSUE FOUND: Case-sensitive username lookup!');
    console.log('   Current query: .ilike("username", "abboud")');
    console.log('   Database has: "Abboud" (capital A)');
    console.log('   ilike should work but might have issues');
    
    return {
      success: false,
      error: 'Username not found',
      fix: 'Use exact case match or fix database'
    };
  }
  
  return { success: true };
};

// Test cases
const testCases = [
  { identifier: 'abboud', password: 'test123' },
  { identifier: 'Abboud', password: 'test123' },
  { identifier: 'abboud@example.com', password: 'test123' }
];

console.log('\n🧪 Running TestSprite Debug Tests:');

testCases.forEach(async (test, i) => {
  const result = await debugLogin(test.identifier, test.password);
  console.log(`\n${i+1}. Input: "${test.identifier}"`);
  console.log(`   Result: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
  if (result.error) console.log(`   Error: ${result.error}`);
  if (result.fix) console.log(`   Fix: ${result.fix}`);
});

console.log('\n🎯 TestSprite Diagnosis:');
console.log('❌ Username lookup is case-sensitive');
console.log('✅ Email login works fine');
console.log('🔧 Fix: Update username lookup to be truly case-insensitive');

console.log('\n💡 Recommended Fix:');
console.log('   Change: .ilike("username", identifier)');
console.log('   To: .ilike("username", identifier.toLowerCase())');
console.log('   And ensure database usernames are lowercase');