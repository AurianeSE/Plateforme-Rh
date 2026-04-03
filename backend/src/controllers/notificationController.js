const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET — Mes notifications
const getAll = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT — Marquer comme lue
const markRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true }
    });
    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// PUT — Tout marquer comme lu
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getAll, markRead, markAllRead };