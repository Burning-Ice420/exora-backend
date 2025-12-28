const Trip = require('../models/Trip');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');
const spellsService = require('../services/spellsService');

/**
 * Get attendance list for a trip (host only)
 * Shows approved participants with initials and spells only (privacy-first)
 */
const getTripAttendance = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  const trip = await Trip.findById(tripId)
    .populate('membersInvolved', 'name exoraSpells')
    .populate('attendance.userId', 'name exoraSpells');

  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  // Verify user is the trip owner
  if (trip.createdBy.toString() !== userId.toString()) {
    throw new ValidationError('Not authorized to view attendance for this trip');
  }

  // Get approved participants (membersInvolved excluding the host)
  const participants = trip.membersInvolved
    .filter(member => member._id.toString() !== trip.createdBy.toString())
    .map(member => {
      const memberObj = member.toObject ? member.toObject() : member;
      // Get attendance status
      const attendanceRecord = trip.attendance.find(
        a => a.userId.toString() === memberObj._id.toString()
      );

      return {
        userId: memberObj._id,
        initials: getInitials(memberObj.name),
        exoraSpells: memberObj.exoraSpells || 0,
        attendanceStatus: attendanceRecord?.status || 'pending',
        markedAt: attendanceRecord?.markedAt || null
      };
    });

  res.json({
    status: 'success',
    tripId: trip._id,
    tripName: trip.name,
    participants
  });
});

/**
 * Mark attendance for a participant (host only)
 */
const markAttendance = catchAsync(async (req, res) => {
  const { tripId } = req.params;
  const { userId: participantId, status } = req.body;
  const hostId = req.user._id;

  if (!['showed_up', 'no_show'].includes(status)) {
    throw new ValidationError('Invalid attendance status. Must be "showed_up" or "no_show"');
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  // Verify user is the trip owner
  if (trip.createdBy.toString() !== hostId.toString()) {
    throw new ValidationError('Not authorized to mark attendance for this trip');
  }

  // Verify participant is a member of the trip
  const isMember = trip.membersInvolved.some(
    member => member.toString() === participantId
  );
  if (!isMember) {
    throw new ValidationError('User is not a member of this trip');
  }

  // Check if trip is cancelled (no penalties/rewards for cancelled trips)
  if (trip.status === 'cancelled') {
    throw new ValidationError('Cannot mark attendance for a cancelled trip');
  }

  // Find existing attendance record
  const existingRecordIndex = trip.attendance.findIndex(
    a => a.userId.toString() === participantId
  );

  let previousStatus = null;
  if (existingRecordIndex >= 0) {
    previousStatus = trip.attendance[existingRecordIndex].status;
    // Prevent re-marking if already marked (unless explicitly allowing corrections)
    // If you want to allow corrections, remove this check
    if (previousStatus !== 'pending' && previousStatus === status) {
      throw new ValidationError('Attendance has already been marked. Cannot mark the same status again.');
    }
  }

  // Update or create attendance record
  const markedAt = new Date();
  const attendanceRecord = {
    userId: participantId,
    status,
    markedAt: markedAt,
    markedBy: hostId
  };

  if (existingRecordIndex >= 0) {
    // Update existing record
    trip.attendance[existingRecordIndex] = attendanceRecord;
  } else {
    // Create new record
    trip.attendance.push(attendanceRecord);
  }

  await trip.save();
  
  // Get the saved attendance record to ensure we have the correct markedAt
  const savedTrip = await Trip.findById(tripId);
  const savedAttendanceRecord = savedTrip.attendance.find(
    a => a.userId.toString() === participantId
  );

  // Handle spells updates
  // If correcting a previous mark, revert the previous spells change first
  if (previousStatus && previousStatus !== 'pending') {
    if (previousStatus === 'showed_up') {
      // Revert the +40 for showing up
      await spellsService.revertSpellsUpdate(
        participantId,
        spellsService.SPELLS_RULES.JOIN_AND_SHOW_UP,
        'joined_and_showed_up',
        { tripId }
      );
    } else if (previousStatus === 'no_show') {
      // Revert the -30 for no-show
      await spellsService.revertSpellsUpdate(
        participantId,
        spellsService.SPELLS_RULES.NO_SHOW,
        'no_show',
        { tripId }
      );
    }
  }

  // Apply new spells change
  if (status === 'showed_up') {
    await spellsService.awardJoinAndShowUp(participantId, tripId);
  } else if (status === 'no_show') {
    await spellsService.penalizeNoShow(participantId, tripId);
  }

  // Get updated participant info
  const participant = await User.findById(participantId).select('name exoraSpells');
  const participantInfo = {
    userId: participant._id,
    initials: getInitials(participant.name),
    exoraSpells: participant.exoraSpells || 0,
    attendanceStatus: status,
    markedAt: savedAttendanceRecord?.markedAt || markedAt
  };

  res.json({
    status: 'success',
    message: `Attendance marked as ${status === 'showed_up' ? 'showed up' : 'no show'}`,
    participant: participantInfo
  });
});

/**
 * Helper function to get user initials
 */
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

module.exports = {
  getTripAttendance,
  markAttendance
};

