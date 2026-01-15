const { db } = require('../config/firebase');

// Get all bookings (READ-ONLY, for debug/demo)
exports.getAllBookings = async (req, res) => {
  try {
    const snapshot = await db.collection('bookings').get();
    const bookings = [];

    snapshot.forEach(doc => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by ID (READ-ONLY)
exports.getBookingById = async (req, res) => {
  try {
    const docRef = db.collection('bookings').doc(req.params.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      id: docSnap.id,
      ...docSnap.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🚫 UNSAFE CREATE BOOKING — DISABLED
exports.createBooking = async (req, res) => {
  return res.status(501).json({
    message: 'Direct booking creation is disabled. Use /book endpoint.'
  });
};

// 🚫 DELETE BOOKING — DISABLED (avoids state corruption)
exports.deleteBooking = async (req, res) => {
  return res.status(501).json({
    message: 'Deleting bookings is disabled.'
  });
};

exports.bookRoom = async (req, res) => {
  const { roomId, userId } = req.body;
  console.log("Booking request received:", { roomId, userId });
  if (!roomId || !userId) {
    return res.status(400).json({
      message: 'roomId and userId are required'
    });
  }

  const roomRef = db.collection('rooms').doc(roomId);
  const bookingRef = db.collection('bookings').doc();

  try {
    await db.runTransaction(async (transaction) => {
      const roomSnap = await transaction.get(roomRef);

      if (!roomSnap.exists) {
        throw new Error('Room does not exist');
      }

      const roomData = roomSnap.data();

      // 🚨 Core safety check
      // If status is not set, default to 'available' (for rooms that only have room_id)
      const roomStatus = roomData.status || 'available';
      if (roomStatus !== 'available') {
        throw new Error('Room is already occupied');
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

      // Create booking
      transaction.set(bookingRef, {
        room_id: roomId,
        user_id: userId,
        start_time: now,
        expires_at: expiresAt,
        status: 'active'
      });

      // Lock room
      transaction.update(roomRef, {
        status: 'occupied',
        current_booking_id: bookingRef.id
      });
    });
    
    res.status(201).json({
      message: 'Room booked successfully'
    });
  } catch (error) {
    res.status(409).json({
      error: error.message
    });
  }
};
