const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);
router.post("/", roomController.createRoom);
router.post("/seed", roomController.seedRooms);
router.post("/sync-from-timetable", roomController.syncRoomsFromTimetable);
router.post("/find-free", roomController.findFreeRoomsByDayTime);

module.exports = router;
