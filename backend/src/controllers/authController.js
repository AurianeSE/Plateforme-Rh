const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Pointer automatiquement l'arrivée si c'est un employé
    if (user.role === "employee") {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Vérifie si déjà pointé aujourd'hui
      const existing = await prisma.attendance.findFirst({
        where: { userId: user.id, date: startOfDay }
      });

      if (!existing) {
        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: startOfDay,
            checkIn: new Date(),
          }
        });
        console.log(`✅ Arrivée automatique pointée pour ${user.name} à ${new Date().toLocaleTimeString("fr-FR")}`);
      }
    }

    res.json({
      message: "Connexion réussie",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user && req.user.role === "employee") {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const record = await prisma.attendance.findFirst({
        where: { userId: req.user.id, date: startOfDay }
      });

      if (record && record.checkIn && !record.checkOut) {
        const now = new Date();
        let workedMinutes = Math.round((now - new Date(record.checkIn)) / 60000);

        if (record.breakStart && record.breakEnd) {
          workedMinutes -= Math.round(
            (new Date(record.breakEnd) - new Date(record.breakStart)) / 60000
          );
        }

        await prisma.attendance.update({
          where: { id: record.id },
          data: { checkOut: now, workedMinutes: Math.max(0, workedMinutes) }
        });

        console.log(`✅ Départ automatique pointé pour ${req.user.email}`);
      }
    }
    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error("Erreur logout:", err);
    res.json({ message: "Déconnexion réussie" });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, department, position, phone } = req.body;

    if (!name || !email || !password || !department || !position) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        role: "employee",
        employee: {
          create: {
            phone: phone || "",
            department,
            position,
            status: "actif",
            hireDate: new Date(),
          }
        }
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

module.exports = { login, logout, me, register };