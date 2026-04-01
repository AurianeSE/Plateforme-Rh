const express = require("express");
const router = express.Router();
const {
  getAll, getOne, create, update, remove
} = require("../controllers/employeeController");
const { protect, requireRole } = require("../middlewares/authMiddleware");

// Toutes les routes nécessitent d'être connecté
router.use(protect);

router.get("/", getAll);                          // Voir tous
router.get("/:id", getOne);                       // Voir un
router.post("/", requireRole("admin"), create);   // Créer (admin seulement)
router.put("/:id", requireRole("admin"), update); // Modifier (admin seulement)
router.delete("/:id", requireRole("admin"), remove); // Supprimer (admin seulement)

module.exports = router;