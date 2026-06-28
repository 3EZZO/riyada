import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['STUDENT', 'VISITOR'] } }
  });
  
  let updated = 0;
  for (const user of users) {
    if (user.gender === 'MALE' || user.gender === 'FEMALE') {
      const folder = user.gender === 'MALE' ? 'men' : 'women';
      const photoId = Math.floor(Math.random() * 99); // randomuser.me has 0-99
      const profilePhoto = `https://randomuser.me/api/portraits/${folder}/${photoId}.jpg`;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePhoto }
      });
      updated++;
    }
  }

  // Also update fathers to look like older men
  const fathers = await prisma.user.findMany({
    where: { role: 'PARENT' }
  });

  for (const father of fathers) {
    // We can use a different service or just older men from randomuser (randomuser doesn't easily filter by age without API call, but we can just use men)
    // Actually, xsgames has avatars. Let's stick to randomuser for simplicity.
    const photoId = Math.floor(Math.random() * 99); 
    const profilePhoto = `https://randomuser.me/api/portraits/men/${photoId}.jpg`;
    
    await prisma.user.update({
      where: { id: father.id },
      data: { profilePhoto }
    });
    updated++;
  }

  console.log(`Updated profile photos for ${updated} users with gender-accurate portraits!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
