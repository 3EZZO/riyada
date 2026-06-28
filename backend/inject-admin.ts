import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@riyada.com';
  
  // Check if exists
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('adminalmas', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        phone: '+249000000000',
        nationalId: '0000000000',
        role: 'ADMIN',
        gender: 'MALE',
      }
    });
    console.log('✅ Super Admin admin@riyada.com created successfully with password adminalmas');
  } else {
    const hashedPassword = await bcrypt.hash('adminalmas', 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'ADMIN' }
    });
    console.log('✅ Super Admin admin@riyada.com updated successfully with password adminalmas');
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
