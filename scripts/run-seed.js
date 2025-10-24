#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🌱 Starting WanderBlocks Enhanced Seed Data Script...\n');

// Run the enhanced seed script
const seedScriptPath = path.join(__dirname, 'enhanced-seed.js');

exec(`node ${seedScriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running seed script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Warnings:', stderr);
  }
  
  console.log(stdout);
  console.log('\n🎉 Seed data script completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Start your frontend: npm run dev');
  console.log('3. Login with any of the created users');
  console.log('4. Explore the Goa-centric data!');
  console.log('\n🔑 Test credentials:');
  console.log('   Email: rahul@example.com (or any user email)');
  console.log('   Password: password123');
});
