/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@riyada.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: 'وزير التعليم',
        email: email,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log(`✅ Admin account created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: password123`);
  } else {
    console.log(`⚠️ Admin account already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
