const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { user: { select: { name: true, email: true, role: true } } }
    });
    const result = employees.map((e) => ({
      id: e.id,
      name: e.user.name,
      email: e.user.email,
      role: e.user.role,
      phone: e.phone,
      department: e.department,
      position: e.position,
      status: e.status,
      hireDate: e.hireDate?.toISOString().split("T")[0],
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getOne = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true }
    });
    if (!employee) return res.status(404).json({ message: "Employé introuvable" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const create = async (req, res) => {
  try {
    const { name, email, phone, department, position, role, hireDate } = req.body;

    if (!name || !email || !department || !position) {
      return res.status(400).json({ message: "Nom, email, département et poste sont requis" });
    }

    const bcrypt = require("bcryptjs");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync("password", 10),
        role: role || "employee",
        employee: {
          create: {
            phone: phone || "",
            department,
            position,
            status: "actif",
            hireDate: hireDate ? new Date(hireDate) : new Date(),
          }
        }
      },
      include: { employee: true }
    });

    res.status(201).json({ message: "Employé créé avec succès", employee: user });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Cet email existe déjà" });
    }
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, email, phone, department, position, status } = req.body;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!employee) return res.status(404).json({ message: "Employé introuvable" });

    await prisma.user.update({
      where: { id: employee.userId },
      data: { name, email }
    });

    const updated = await prisma.employee.update({
      where: { id: parseInt(req.params.id) },
      data: { phone, department, position, status }
    });

    res.json({ message: "Employé modifié avec succès", employee: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

const remove = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!employee) return res.status(404).json({ message: "Employé introuvable" });

    await prisma.user.delete({ where: { id: employee.userId } });
    res.json({ message: "Employé supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };