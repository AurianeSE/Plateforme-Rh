const express = require("express");
const router = express.Router();
const { login, logout, me } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

//Routes publiques (sans token)
router.post("/login",  login);

//Routes protégées (avec token)
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;