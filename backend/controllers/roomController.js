const { db } = require("../config/firebase");

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
    const snapshot = await db.collection("rooms").get();
    const rooms = [];

    snapshot.forEach((doc) => {
      rooms.push({
        id: doc.id,
        ...doc.data(),
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
    const roomRef = db.collection("rooms").doc(req.params.id);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      id: roomDoc.id,
      ...roomDoc.data(),
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
      return res.status(400).json({ message: "room_id is required" });
    }

    const roomData = {
      room_id,
      status: "available",
      current_booking_id: null,
    };

    const roomRef = await db.collection("rooms").add(roomData);

    res.status(201).json({
      id: roomRef.id,
      ...roomData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seed rooms (DEMO ONLY)
exports.seedRooms = async (req, res) => {
  try {
    const demoRooms = [
      { room_id: "LH-301" },
      { room_id: "LH-304" },
      { room_id: "B201" },
    ];

    const batch = db.batch();

    demoRooms.forEach((room) => {
      const ref = db.collection("rooms").doc();
      batch.set(ref, {
        room_id: room.room_id,
        status: "available",
        current_booking_id: null,
      });
    });

    await batch.commit();

    res.status(201).json({
      message: "Rooms seeded successfully",
      rooms: demoRooms,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// sync rooms from lab_windows
async function syncRoomsFromLabWindows() {
  // Fetch all lab_windows documents
  const labWindowsSnapshot = await db.collection("lab_windows").get();

  if (labWindowsSnapshot.empty) {
    return {
      success: false,
      message: "No timetable data found",
      stats: { total_rooms_found: 0, new_rooms_created: 0, existing_rooms: 0 },
      new_rooms: [],
      existing_rooms: [],
    };
  }

  // Extract unique room_id values (rooms) - note: timetable stores as room_id
  const roomSet = new Set();
  const labKeywords = ["lab", "LAB", "Lab", "LABS", "Labs"];

  labWindowsSnapshot.forEach((doc) => {
    const data = doc.data();
    // timetableController stores room_id field (not classroom)
    const roomId = data.room_id;

    if (roomId && typeof roomId === "string") {
      // Filter out labs - check if room name contains lab keywords
      const isLab = labKeywords.some((keyword) =>
        roomId.toUpperCase().includes(keyword.toUpperCase())
      );

      // Only add if it's not a lab
      if (!isLab && roomId.trim() !== "") {
        roomSet.add(roomId.trim());
      }
    }
  });

  if (roomSet.size === 0) {
    return {
      success: false,
      message: "No rooms found in timetable data. Only labs were detected.",
      stats: { total_rooms_found: 0, new_rooms_created: 0, existing_rooms: 0 },
      new_rooms: [],
      existing_rooms: [],
    };
  }

  // Get existing rooms to avoid duplicates
  const existingRoomsSnapshot = await db.collection("rooms").get();
  const existingRoomIds = new Set();

  existingRoomsSnapshot.forEach((doc) => {
    const roomData = doc.data();
    if (roomData.room_id) {
      existingRoomIds.add(roomData.room_id);
    }
  });

  // Create batch for new rooms
  const batch = db.batch();
  const newRooms = [];
  const updatedRooms = [];

  roomSet.forEach((roomId) => {
    if (existingRoomIds.has(roomId)) {
      // Room already exists, skip
      updatedRooms.push(roomId);
    } else {
      // Create new room
      const roomRef = db.collection("rooms").doc();
      batch.set(roomRef, {
        room_id: roomId,
        status: "available",
        current_booking_id: null,
        created_at: new Date(),
        synced_from_timetable: true,
      });
      newRooms.push(roomId);
    }
  });

  if (newRooms.length > 0) {
    await batch.commit();
  }

  return {
    success: true,
    message: "Rooms synced successfully from timetable",
    stats: {
      total_rooms_found: roomSet.size,
      new_rooms_created: newRooms.length,
      existing_rooms: updatedRooms.length,
    },
    new_rooms: newRooms,
    existing_rooms: updatedRooms,
  };
}

// Sync rooms from timetable endpoint
exports.syncRoomsFromTimetable = async (req, res) => {
  try {
    const result = await syncRoomsFromLabWindows();

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Sync rooms from timetable failed:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export the internal function for use in other controllers
exports.syncRoomsFromLabWindows = syncRoomsFromLabWindows;

// Find free rooms at a given day and time
exports.findFreeRoomsByDayTime = async (req, res) => {
  try {
    const { day, time } = req.body;
    console.log("[DEBUG] Request received for findFreeRoomsByDayTime:", {
      day,
      time,
    });

    if (!day || !time) {
      return res.status(400).json({ error: "day and time are required" });
    }

    // 1. Get all lab_windows for the given day
    const labWindowsSnapshot = await db
      .collection("lab_windows")
      .where("day", "==", day)
      .get();

    // 2. Filter lab_windows where current time is within the window
    const roomIds = new Set();
    labWindowsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.room_id && data.time) {
        // Parse "12:30 to 3:30" into start and end
        const [start, end] = data.time.split(" to ").map((t) => t.trim());
        if (isTimeInRange(time, start, end)) {
          roomIds.add(data.room_id);
        }
      }
    });

    if (roomIds.size === 0) {
      console.log("[DEBUG] No room_ids found for given day/time");
      return res.status(200).json([]);
    }

    // 3. Query bookings for these room_ids that are currently active
    const now = new Date();
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("status", "==", "active")
      .get();

    console.log("[DEBUG] Active bookings found:", bookingsSnapshot.size);

    const bookedRoomIds = new Set();
    bookingsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.room_id &&
        data.start_time.toDate() <= now &&
        data.expires_at.toDate() >= now
      ) {
        bookedRoomIds.add(data.room_id);
      }
    });
    console.log(
      "[DEBUG] Booked room_ids (room names from bookings):",
      Array.from(bookedRoomIds)
    );

    // 4. Get actual room documents from rooms collection, excluding booked ones
    const roomsSnapshot = await db.collection("rooms").get();
    console.log("[DEBUG] Total rooms in DB:", roomsSnapshot.size);

    const roomMap = new Map();
    roomsSnapshot.forEach((doc) => {
      const roomData = doc.data();
      if (roomData.room_id) {
        roomMap.set(roomData.room_id, {
          id: doc.id,
          ...roomData,
        });
      }
    });
    console.log(
      "[DEBUG] Room map keys (room names):",
      Array.from(roomMap.keys())
    );

    // 5. Only include rooms that are not currently booked (compare by room_id name)
    const freeRooms = [];
    roomIds.forEach((roomId) => {
      const roomDoc = roomMap.get(roomId);
      // Compare using room_id (room name), not Firestore doc ID
      if (roomDoc && !bookedRoomIds.has(roomId)) {
        freeRooms.push(roomDoc);
      }
    });
    console.log("[DEBUG] Free rooms to return:", freeRooms);

    res.status(200).json(freeRooms);
  } catch (error) {
    console.error("[ERROR] findFreeRoomsByDayTime failed:", error);
    res.status(500).json({ error: error.message });
  }

  // Helper function for time comparison
  function toMinutes(str) {
    // Handles "HH:MM" or "H:MM" or "H:MM am/pm"
    let [time, period] = str.split(/(am|pm)/i).map((s) => s.trim());
    let [h, m] = time.split(":").map(Number);
    if (period) {
      if (/pm/i.test(period) && h < 12) h += 12;
      if (/am/i.test(period) && h === 12) h = 0;
    }
    return h * 60 + (m || 0);
  }
  function isTimeInRange(current, start, end) {
    const curMin = toMinutes(current);
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    return curMin >= startMin && curMin <= endMin;
  }
};
