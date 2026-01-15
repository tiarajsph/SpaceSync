const { db, admin } = require('../config/firebase');

// ============================================
// Get all bookings (Admin only)
// ============================================
exports.getAllBookings = async (req, res) => {
  try {
    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// Get user's own bookings (or all for admin)
// ============================================
exports.getMyBookings = async (req, res) => {
  try {
    let query = db.collection('bookings');

    if (req.user.role !== 'admin') {
      query = query.where('user_id', '==', req.user.uid);
    }

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// Book room (Club Lead / Admin)
// ============================================
exports.bookRoom = async (req, res) => {
  const { roomId, userId, duration, purpose } = req.body;
  console.log("Booking request received:", { roomId, userId, duration, purpose });
  
  if (!roomId || !userId) {
    return res.status(400).json({
      message: 'roomId and userId are required'
    });
  }

  try {
    // 🔍 Find room by room_id field
    const roomQuery = await db
      .collection('rooms')
      .where('room_id', '==', roomId)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      throw new Error('Room does not exist');
    }

    // Get the room document reference and data
    const roomSnap = roomQuery.docs[0];
    const roomRef = roomSnap.ref;
    const roomData = roomSnap.data();

    // 🚨 Core safety check
    // If status is not set, default to 'available' (for rooms that only have room_id)
    const roomStatus = roomData.status || 'available';
    if (roomStatus !== 'available') {
      throw new Error('Room is already occupied');
    }

    const bookingRef = db.collection('bookings').doc();

    await db.runTransaction(async (transaction) => {
      const now = new Date();
      const bookingDuration = duration || 30; // minutes
      const expiresAt = new Date(now.getTime() + bookingDuration * 60 * 1000);

      // Create booking
      transaction.set(bookingRef, {
        room_id: roomId,
        user_id: req.user.uid,
        user_email: req.user.email,
        user_role: req.user.role,
        purpose: purpose || 'Club activity',
        start_time: now,
        expires_at: expiresAt,
        status: 'active',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      // Lock room
      transaction.update(roomRef, {
        status: 'occupied',
        current_booking_id: bookingRef.id,
        occupied_by: req.user.email
      });
    });
    
    res.status(201).json({
      message: 'Room booked successfully',
      booking_id: bookingRef.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// Cancel booking (Own booking or Admin)
// ============================================
exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const bookingData = bookingSnap.data();

    // Ownership check
    if (req.user.role !== 'admin' && bookingData.user_id !== req.user.uid) {
      return res.status(403).json({ message: 'Can only cancel your own bookings' });
    }

    // 🔍 Find room by room_id field
    const roomQuery = await db
      .collection('rooms')
      .where('room_id', '==', bookingData.room_id)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return res.status(404).json({ message: 'Associated room not found' });
    }

    const roomRef = roomQuery.docs[0].ref;

    await db.runTransaction(async (transaction) => {
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
        cancelled_by: req.user.uid
      });

      transaction.update(roomRef, {
        status: 'available',
        current_booking_id: null,
        occupied_by: null
      });
    });

    res.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// Mark room free (Verified Rep / Admin)
// ============================================
exports.markRoomFree = async (req, res) => {
  const { roomId, notes } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required' });
  }

  try {
    // 🔍 Find room
    const roomQuery = await db
      .collection('rooms')
      .where('room_id', '==', roomId)
      .limit(1)
      .get();

    if (roomQuery.empty) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Log confirmation
    await db.collection('room_confirmations').add({
      room_id: roomId,
      confirmed_by: req.user.uid,
      confirmed_by_email: req.user.email,
      batch: req.user.batch || null,
      notes: notes || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      message: 'Room marked as free',
      confirmed_by: req.user.email
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};