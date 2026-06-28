import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const firstNames = ['أحمد', 'محمد', 'عمر', 'علي', 'خالد', 'فاطمة', 'عائشة', 'مريم', 'زينب', 'سارة', 'عبدالله', 'عبدالرحمن', 'يوسف', 'إبراهيم', 'حسن', 'حسين', 'منى', 'نور', 'ليلى', 'آية'];
const lastNames = ['المهدي', 'عثمان', 'عبدالله', 'محمد', 'علي', 'حسان', 'إدريس', 'حسن', 'آدم', 'الطيب', 'صالح', 'إبراهيم', 'يعقوب', 'سليمان', 'يونس'];

function randomName() {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getAvatar(id: number) {
  return `https://i.pravatar.cc/150?u=${id}`;
}

async function main() {
  const password = await bcrypt.hash('123456', 10);
  
  const universities = await prisma.university.findMany({ include: { majors: true } });
  if (universities.length === 0) {
    console.log("No universities found, please run standard seed first.");
    return;
  }

  console.log("Seeding 500 registered students...");
  const registeredStudents = [];
  for (let i = 0; i < 500; i++) {
    const uni = universities[Math.floor(Math.random() * universities.length)];
    const major = uni.majors[Math.floor(Math.random() * uni.majors.length)];
    const name = randomName();
    
    const student = await prisma.user.create({
      data: {
        name,
        email: `student_m${i}@riyada.com`,
        password,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        nationalId: `NAT${Math.floor(100000000 + Math.random() * 900000000)}_${i}`,
        profilePhoto: getAvatar(i + 10000),
        role: 'STUDENT',
        wallet: { create: { balance: Math.floor(Math.random() * 50000) } },
        applications: {
          create: {
            universityId: uni.id,
            majorId: major.id,
            status: 'PAID'
          }
        }
      }
    });
    registeredStudents.push(student);
    if ((i + 1) % 100 === 0) console.log(`... ${i + 1} students created`);
  }

  console.log("Seeding 500 fathers...");
  for (let i = 0; i < 500; i++) {
    const student = registeredStudents[i];
    const fatherName = student.name.split(' ')[1] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)]; 
    
    await prisma.user.create({
      data: {
        name: fatherName,
        email: `parent_m${i}@riyada.com`,
        password,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        nationalId: `NAT${Math.floor(100000000 + Math.random() * 900000000)}_${i}_P`,
        profilePhoto: getAvatar(i + 20000),
        role: 'PARENT',
        linkedStudentId: student.id,
        wallet: { create: { balance: Math.floor(Math.random() * 500000) } }
      }
    });
    if ((i + 1) % 100 === 0) console.log(`... ${i + 1} fathers created`);
  }

  console.log("Seeding 200 visitors...");
  for (let i = 0; i < 200; i++) {
    const name = randomName();
    const uni = universities[Math.floor(Math.random() * universities.length)];
    
    await prisma.user.create({
      data: {
        name,
        email: `visitor_m${i}@riyada.com`,
        password,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        nationalId: `NAT${Math.floor(100000000 + Math.random() * 900000000)}_${i}_V`,
        profilePhoto: getAvatar(i + 30000),
        role: 'VISITOR',
        targetUniversityId: uni.id,
        wallet: { create: { balance: 0 } }
      }
    });
    if ((i + 1) % 100 === 0) console.log(`... ${i + 1} visitors created`);
  }

  console.log("Massive Seeding Completed! The platform now holds 1,200 simulated identities.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
