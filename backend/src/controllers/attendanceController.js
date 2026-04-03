const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getOrCreateToday = async (userId) => {
  const today = getToday();
  let record = await prisma.attendance.findFirst({
    where: { userId, date: today }
  });
  if (!record) {
    record = await prisma.attendance.create({
      data: { userId, date: today }
    });
  }
  return record;
};

const calcWorkedMinutes = (checkIn, breakStart, breakEnd, checkOut) => {
  if (!checkIn || !checkOut) return null;
  let total = (new Date(checkOut) - new Date(checkIn)) / 60000;
  if (breakStart && breakEnd) {
    total -= (new Date(breakEnd) - new Date(breakStart)) / 60000;
  }
  return Math.max(0, Math.round(total));
};

// GET — Pointage du jour
const getTodays = async (req, res) => {
  try {
    const record = await getOrCreateToday(req.user.id);
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET — Historique
const getHistory = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
      take: 30
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET — Tous les pointages du jour (admin)
const getAllToday = async (req, res) => {
  try {
    const today = getToday();
    const records = await prisma.attendance.findMany({
      where: { date: today },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST — Pointer arrivée
const checkIn = async (req, res) => {
  try {
    const record = await getOrCreateToday(req.user.id);
    if (record.checkIn) {
      return res.status(400).json({ message: "Arrivée déjà pointée aujourd'hui" });
    }
    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { checkIn: new Date() }
    });
    res.json({ message: "Arrivée pointée avec succès", attendance: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST — Pointer début de pause
const breakStart = async (req, res) => {
  try {
    const record = await getOrCreateToday(req.user.id);
    if (!record.checkIn) {
      return res.status(400).json({ message: "Pointez d'abord votre arrivée" });
    }
    if (record.breakStart) {
      return res.status(400).json({ message: "Pause déjà commencée" });
    }
    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { breakStart: new Date() }
    });
    res.json({ message: "Début de pause pointé", attendance: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST — Pointer fin de pause
const breakEnd = async (req, res) => {
  try {
    const record = await getOrCreateToday(req.user.id);
    if (!record.breakStart) {
      return res.status(400).json({ message: "Pointez d'abord le début de pause" });
    }
    if (record.breakEnd) {
      return res.status(400).json({ message: "Fin de pause déjà pointée" });
    }
    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { breakEnd: new Date() }
    });
    res.json({ message: "Fin de pause pointée", attendance: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST — Pointer départ
const checkOut = async (req, res) => {
  try {
    const record = await getOrCreateToday(req.user.id);
    if (!record.checkIn) {
      return res.status(400).json({ message: "Pointez d'abord votre arrivée" });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: "Départ déjà pointé aujourd'hui" });
    }
    const now = new Date();
    const workedMinutes = calcWorkedMinutes(
      record.checkIn,
      record.breakStart,
      record.breakEnd,
      now
    );
    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: { checkOut: now, workedMinutes }
    });
    res.json({ message: "Départ pointé avec succès", attendance: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getTodays, getHistory, getAllToday, checkIn, breakStart, breakEnd, checkOut };