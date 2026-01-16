const { db, admin } = require("../config/firebase");

/**
 * Expires active bookings whose expiry time has passed
 * and frees the corresponding rooms.
 */
const expireBookings = async () => {
  try {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("bookings")
      .where("status", "==", "active")
      .where("expires_at", "<=", now)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();
    const roomLookups = [];

    snapshot.forEach((doc) => {
      const booking = doc.data();
      const bookingRef = db.collection("bookings").doc(doc.id);

      // Prepare a promise for each room lookup
      const roomLookup = db
        .collection("rooms")
        .where("room_id", "==", booking.room_id)
        .limit(1)
        .get()
        .then((roomSnap) => {
          if (!roomSnap.empty) {
            const roomRef = roomSnap.docs[0].ref;
            // Mark booking as expired
            batch.update(bookingRef, { status: "expired" });
            // Free the room
            batch.update(roomRef, {
              status: "available",
              current_booking_id: null,
            });
          } else {
            // Just expire the booking if room not found
            batch.update(bookingRef, { status: "expired" });
          }
        });

      roomLookups.push(roomLookup);
    });

    // Wait for all room lookups to finish
    await Promise.all(roomLookups);

    await batch.commit();
    console.log(`Expired ${snapshot.size} booking(s)`);
  } catch (error) {
    console.error("Error expiring bookings:", error.message);
  }
};

module.exports = expireBookings;
