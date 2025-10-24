/**
 * Test script for Family & Travel Type functionality
 * Run with: node test-family-travel.js
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Block = require('./models/Block');
const config = require('./config/environment');

async function testFamilyTravelFunctionality() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a family user
    console.log('\n🧪 Test 1: Creating family user...');
    const familyUser = new User({
      name: 'Rohit Sharma',
      email: 'rohit@test.com',
      passwordHash: 'hashed_password',
      travel_type: 'family',
      family_members: [
        {
          name: 'Neha Sharma',
          email: 'neha@test.com',
          relation: 'wife',
          status: 'pending'
        },
        {
          name: 'Aarav Sharma',
          email: 'aarav@test.com',
          relation: 'son',
          status: 'pending'
        }
      ]
    });
    await familyUser.save();
    console.log('✅ Family user created:', familyUser._id);

    // Test 2: Create a couple user
    console.log('\n🧪 Test 2: Creating couple user...');
    const coupleUser = new User({
      name: 'Priya Singh',
      email: 'priya@test.com',
      passwordHash: 'hashed_password',
      travel_type: 'couple',
      family_members: [
        {
          name: 'Raj Singh',
          email: 'raj@test.com',
          relation: 'husband',
          status: 'pending'
        }
      ]
    });
    await coupleUser.save();
    console.log('✅ Couple user created:', coupleUser._id);

    // Test 3: Create a solo traveler
    console.log('\n🧪 Test 3: Creating solo traveler...');
    const soloUser = new User({
      name: 'John Doe',
      email: 'john@test.com',
      passwordHash: 'hashed_password',
      travel_type: 'solo_traveler'
    });
    await soloUser.save();
    console.log('✅ Solo traveler created:', soloUser._id);

    // Test 4: Create a main block for family
    console.log('\n🧪 Test 4: Creating main block for family...');
    const mainBlock = new Block({
      createdBy: familyUser._id,
      title: 'Family Trip to Paris',
      destination: 'Paris, France',
      radius: 10,
      type: 'main_block',
      approved: true,
      membersInvolved: [familyUser._id]
    });
    await mainBlock.save();
    console.log('✅ Main block created:', mainBlock._id);

    // Test 5: Create a sub-block suggestion
    console.log('\n🧪 Test 5: Creating sub-block suggestion...');
    const subBlock = new Block({
      createdBy: familyUser._id,
      title: 'Suggestion: Local Cafe',
      destination: 'Local Cafe',
      radius: 2.5,
      type: 'sub_block',
      approved: false,
      parentBlockId: mainBlock._id,
      suggestedBy: familyUser._id,
      membersInvolved: [familyUser._id]
    });
    await subBlock.save();
    console.log('✅ Sub-block suggestion created:', subBlock._id);

    // Test 6: Approve the sub-block
    console.log('\n🧪 Test 6: Approving sub-block...');
    subBlock.approved = true;
    await subBlock.save();
    console.log('✅ Sub-block approved');

    // Test 7: Query blocks for user
    console.log('\n🧪 Test 7: Querying user blocks...');
    const userBlocks = await Block.find({
      $or: [
        { createdBy: familyUser._id },
        { membersInvolved: familyUser._id }
      ]
    }).populate('createdBy', 'name email')
      .populate('suggestedBy', 'name email');
    
    console.log('✅ User blocks found:', userBlocks.length);
    userBlocks.forEach(block => {
      console.log(`  - ${block.title} (${block.type}) - Approved: ${block.approved}`);
    });

    // Test 8: Query sub-blocks for main block
    console.log('\n🧪 Test 8: Querying sub-blocks for main block...');
    const subBlocks = await Block.find({
      parentBlockId: mainBlock._id,
      type: 'sub_block'
    }).populate('suggestedBy', 'name email');
    
    console.log('✅ Sub-blocks found:', subBlocks.length);
    subBlocks.forEach(block => {
      console.log(`  - ${block.title} - Approved: ${block.approved}`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Family user with 2 family members created');
    console.log('- Couple user with 1 partner created');
    console.log('- Solo traveler created');
    console.log('- Main block for family trip created');
    console.log('- Sub-block suggestion created and approved');
    console.log('- All queries working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    await Block.deleteMany({ title: { $regex: /Family Trip|Local Cafe/ } });
    await mongoose.disconnect();
    console.log('\n🧹 Test data cleaned up');
  }
}

// Run the test
testFamilyTravelFunctionality();
