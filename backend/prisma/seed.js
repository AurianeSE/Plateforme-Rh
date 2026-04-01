const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Remplissage de la base de données...");

  // Créer les utilisateurs
  const alice = await prisma.user.upsert({
    where: { email: "alice@rh.com" },
    update: {},
    create: {
      name: "Alice Dupont",
      email: "alice@rh.com",
      password: bcrypt.hashSync("password", 10),
      role: "admin",
      employee: {
        create: {
          phone: "+229 97 00 00 01",
          department: "Ressources Humaines",
          position: "Directrice RH",
          status: "actif",
          hireDate: new Date("2021-03-15"),
        }
      }
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@rh.com" },
    update: {},
    create: {
      name: "Bob Martin",
      email: "bob@rh.com",
      password: bcrypt.hashSync("password", 10),
      role: "employee",
      employee: {
        create: {
          phone: "+229 97 00 00 02",
          department: "Informatique",
          position: "Développeur",
          status: "actif",
          hireDate: new Date("2022-06-01"),
        }
      }
    }
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara@rh.com" },
    update: {},
    create: {
      name: "Sara Koné",
      email: "sara@rh.com",
      password: bcrypt.hashSync("password", 10),
      role: "employee",
      employee: {
        create: {
          phone: "+229 97 00 00 03",
          department: "Comptabilité",
          position: "Comptable",
          status: "actif",
          hireDate: new Date("2023-01-10"),
        }
      }
    }
  });

  // Créer des demandes de congés
  await prisma.leave.createMany({
    data: [
      {
        userId: bob.id,
        type: "Congé annuel",
        startDate: new Date("2026-04-10"),
        endDate: new Date("2026-04-15"),
        days: 5,
        reason: "Vacances en famille",
        status: "en attente",
      },
      {
        userId: sara.id,
        type: "Congé maladie",
        startDate: new Date("2026-04-05"),
        endDate: new Date("2026-04-07"),
        days: 2,
        reason: "Consultation médicale",
        status: "approuvé",
      }
    ]
  });

  console.log("✅ Base de données remplie avec succès !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());