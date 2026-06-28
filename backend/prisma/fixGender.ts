import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const maleNames = ['أحمد', 'محمد', 'عمر', 'علي', 'خالد', 'عبدالله', 'عبدالرحمن', 'يوسف', 'إبراهيم', 'حسن', 'حسين'];

async function main() {
  const users = await prisma.user.findMany();
  
  let updated = 0;
  for (const user of users) {
    const firstName = user.name.split(' ')[0];
    const gender = maleNames.includes(firstName) ? 'MALE' : 'FEMALE';
    
    // Only update if it's different to save DB calls, or just update all
    if (user.gender !== gender) {
      await prisma.user.update({
        where: { id: user.id },
        data: { gender }
      });
      updated++;
    }
  }

  console.log(`Updated gender for ${updated} users based on their first names!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
