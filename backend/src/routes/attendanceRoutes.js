const express = require("express");
const router = express.Router();
const {
  getTodays, getHistory, getAllToday,
  checkIn, breakStart, breakEnd, checkOut
} = require("../controllers/attendanceController");
const { protect, requireRole } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/today", getTodays);
router.get("/history", getHistory);
router.get("/all-today", requireRole("admin"), getAllToday);
router.post("/checkin", checkIn);
router.post("/break-start", breakStart);
router.post("/break-end", breakEnd);
router.post("/checkout", checkOut);

module.exports = router;