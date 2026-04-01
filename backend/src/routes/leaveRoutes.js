const express = require("express");
const router = express.Router();
const { getAll, create, updateStatus, remove } = require("../controllers/leaveController");
const { protect, requireRole } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", getAll);
router.post("/", create);
router.put("/:id/status", requireRole("admin"), updateStatus);
router.delete("/:id", remove);

module.exports = router;