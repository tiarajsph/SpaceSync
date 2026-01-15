const express = require("express");
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

// Public read (students can view)
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Protected writes
router.post('/', 
  authenticate, 
  authorize('admin'), 
  roomController.createRoom
);

router.post('/seed', 
  authenticate, 
  authorize('admin'), 
  roomController.seedRooms
);

router.post("/sync-from-timetable", 
          authenticate, 
          authorize('admin'),
          roomController.syncRoomsFromTimetable);
          
router.post("/find-free", roomController.findFreeRoomsByDayTime);

module.exports = router;
