import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['STUDENT', 'VISITOR'] } }
  });
  
  let updated = 0;
  for (const user of users) {
    if (user.gender === 'MALE') {
      const isMale1 = Math.random() > 0.5;
      const profilePhoto = isMale1 ? '/avatars/male1.png' : '/avatars/male2.png';
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePhoto }
      });
      updated++;
    } else if (user.gender === 'FEMALE') {
      const isFemale1 = Math.random() > 0.5;
      const profilePhoto = isFemale1 ? '/avatars/female1.png' : '/avatars/female2.png';
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePhoto }
      });
      updated++;
    }
  }

  console.log(`Updated profile photos for ${updated} users with AI-generated standard passport photos!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
