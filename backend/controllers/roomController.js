const { db } = require('../config/firebase');

/**
 * ROOM SCHEMA (LOCKED)
 * {
 *   room_id: string,
 *   status: "available" | "occupied",
 *   current_booking_id: string | null
 * }
 */

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const snapshot = await db.collection('rooms').get();
    const rooms = [];

    snapshot.forEach(doc => {
      rooms.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const roomRef = db.collection('rooms').doc(req.params.id);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      id: roomDoc.id,
      ...roomDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create room (ADMIN / SEED ONLY)
exports.createRoom = async (req, res) => {
  try {
    const { room_id } = req.body;

    if (!room_id) {
      return res.status(400).json({ message: 'room_id is required' });
    }

    const roomData = {
      room_id,
      status: 'available',
      current_booking_id: null
    };

    const roomRef = await db.collection('rooms').add(roomData);

    res.status(201).json({
      id: roomRef.id,
      ...roomData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seed rooms (DEMO ONLY)
exports.seedRooms = async (req, res) => {
  try {
    const demoRooms = [
      { room_id: 'LH-301' },
      { room_id: 'LH-304' },
      { room_id: 'B201' }
    ];

    const batch = db.batch();

    demoRooms.forEach(room => {
      const ref = db.collection('rooms').doc();
      batch.set(ref, {
        room_id: room.room_id,
        status: 'available',
        current_booking_id: null
      });
    });

    await batch.commit();

    res.status(201).json({
      message: 'Rooms seeded successfully',
      rooms: demoRooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
