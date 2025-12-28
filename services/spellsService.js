const User = require('../models/User');
const Trip = require('../models/Trip');
const ContentFeed = require('../models/ContentFeed');

/**
 * Exora Spells Service
 * Manages reputation score updates based on user actions
 * 
 * Rules:
 * +70 → host a trip
 * +40 → join a trip and show up
 * -30 → don't show up
 * +20 → create a post on Exora (feed content)
 */

const SPELLS_RULES = {
  HOST_TRIP: 70,
  JOIN_AND_SHOW_UP: 40,
  NO_SHOW: -30,
  CREATE_POST: 20,
};

/**
 * Update user's Exora Spells
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to add/subtract (can be negative)
 * @param {String} reason - Reason for the update (for audit)
 * @param {Object} metadata - Additional metadata (tripId, postId, etc.)
 */
const updateSpells = async (userId, amount, reason, metadata = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldSpells = user.exoraSpells || 0;
    const newSpells = Math.max(0, oldSpells + amount); // Never go below 0

    user.exoraSpells = newSpells;
    await user.save();

    // Log the update (could be extended to a SpellsHistory model)
    console.log(`Spells update: User ${userId} | ${amount > 0 ? '+' : ''}${amount} | ${reason} | New total: ${newSpells}`, metadata);

    return {
      oldSpells,
      newSpells,
      change: amount
    };
  } catch (error) {
    console.error('Error updating spells:', error);
    throw error;
  }
};

/**
 * Award spells for hosting a trip
 * @param {String} userId - Host user ID
 * @param {String} tripId - Trip ID
 */
const awardHostTrip = async (userId, tripId) => {
  // Check if already awarded for this trip (prevent double counting)
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }

  // Check if spells were already awarded (using a flag or checking trip creation date)
  // For now, we'll award on trip creation. If needed, add a flag to Trip model.
  return await updateSpells(
    userId,
    SPELLS_RULES.HOST_TRIP,
    'hosted_trip',
    { tripId }
  );
};

/**
 * Award spells for joining and showing up to a trip
 * @param {String} userId - User ID who showed up
 * @param {String} tripId - Trip ID
 */
const awardJoinAndShowUp = async (userId, tripId) => {
  return await updateSpells(
    userId,
    SPELLS_RULES.JOIN_AND_SHOW_UP,
    'joined_and_showed_up',
    { tripId }
  );
};

/**
 * Penalize user for not showing up
 * @param {String} userId - User ID who didn't show up
 * @param {String} tripId - Trip ID
 */
const penalizeNoShow = async (userId, tripId) => {
  return await updateSpells(
    userId,
    SPELLS_RULES.NO_SHOW,
    'no_show',
    { tripId }
  );
};

/**
 * Award spells for creating a post
 * @param {String} userId - User ID who created the post
 * @param {String} postId - Post ID
 */
const awardCreatePost = async (userId, postId) => {
  return await updateSpells(
    userId,
    SPELLS_RULES.CREATE_POST,
    'created_post',
    { postId }
  );
};

/**
 * Revert a spells update (for corrections)
 * @param {String} userId - User ID
 * @param {Number} originalAmount - Original amount that was added/subtracted
 * @param {String} reason - Reason for revert
 * @param {Object} metadata - Additional metadata
 */
const revertSpellsUpdate = async (userId, originalAmount, reason, metadata = {}) => {
  // Reverse the original amount
  return await updateSpells(
    userId,
    -originalAmount,
    `revert_${reason}`,
    metadata
  );
};

module.exports = {
  updateSpells,
  awardHostTrip,
  awardJoinAndShowUp,
  penalizeNoShow,
  awardCreatePost,
  revertSpellsUpdate,
  SPELLS_RULES,
};

