const express = require("express");
const router = express.Router();
const { getAll, markRead, markAllRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", getAll);
router.put("/:id/read", markRead);
router.put("/read-all", markAllRead);

module.exports = router;