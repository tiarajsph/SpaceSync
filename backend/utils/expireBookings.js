const { db } = require('../config/firebase');

/**
 * Expires active bookings whose expiry time has passed
 * and frees the corresponding rooms.
 */
const expireBookings = async () => {
  try {
    const now = new Date();

    const snapshot = await db
      .collection('bookings')
      .where('status', '==', 'active')
      .where('expires_at', '<=', now)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();

    snapshot.forEach(doc => {
      const booking = doc.data();

      const bookingRef = db.collection('bookings').doc(doc.id);
      const roomRef = db.collection('rooms').doc(booking.room_id);

      // Mark booking as expired
      batch.update(bookingRef, {
        status: 'expired'
      });

      // Free the room
      batch.update(roomRef, {
        status: 'available',
        current_booking_id: null
      });
    });

    await batch.commit();
    console.log(`Expired ${snapshot.size} booking(s)`);
  } catch (error) {
    console.error('Error expiring bookings:', error.message);
  }
};

module.exports = expireBookings;
