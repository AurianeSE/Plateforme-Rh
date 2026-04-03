const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const calcDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

const getAll = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.id };
    const leaves = await prisma.leave.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    const result = leaves.map((l) => ({
      id: l.id,
      employeeId: l.userId,
      employeeName: l.user.name,
      type: l.type,
      startDate: l.startDate.toISOString().split("T")[0],
      endDate: l.endDate.toISOString().split("T")[0],
      days: l.days,
      reason: l.reason,
      status: l.status,
      createdAt: l.createdAt.toISOString().split("T")[0],
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const create = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: "Type, date début et date fin sont requis" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    const leave = await prisma.leave.create({
      data: {
        userId: req.user.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: calcDays(startDate, endDate),
        reason: reason || "",
        status: "en attente",
      }
    });

    res.status(201).json({ message: "Demande envoyée avec succès", leave });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approuvé", "rejeté"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const leave = await prisma.leave.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { user: true }
    });

    // Créer une notification pour l'employé
    const emoji = status === "approuvé" ? "✅" : "❌";
    await prisma.notification.create({
      data: {
        userId: leave.userId,
        message: `${emoji} Votre demande de congé du ${leave.startDate.toLocaleDateString("fr-FR")} au ${leave.endDate.toLocaleDateString("fr-FR")} a été ${status}.`,
        type: status === "approuvé" ? "success" : "danger",
        read: false
      }
    });

    res.json({ message: `Demande ${status} avec succès`, leave });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const remove = async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!leave) return res.status(404).json({ message: "Demande introuvable" });
    if (leave.status !== "en attente") {
      return res.status(400).json({ message: "Impossible de supprimer une demande déjà traitée" });
    }

    await prisma.leave.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Demande supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getAll, create, updateStatus, remove };