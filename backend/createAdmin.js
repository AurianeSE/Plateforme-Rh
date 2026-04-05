const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const admin = await prisma.user.create({
    data: {
      name: 'AMOUSSOU Serge',
      email: 'sergio@rh.com',
      password: bcrypt.hashSync('admin2.01', 10),
      role: 'admin',
      employee: {
        create: {
          phone: '',
          department: 'Direction',
          position: 'Administrateur',
          status: 'actif',
          hireDate: new Date()
        }
      }
    }
  });
  console.log('✅ Compte admin créé :', admin.email);
  await prisma.$disconnect();
}

createAdmin().catch(console.error);