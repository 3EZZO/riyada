/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Mock Universities
  const universitiesData = [
    { name: 'جامعة الخرطوم', location: 'الخرطوم' },
    { name: 'جامعة السودان للعلوم والتكنولوجيا', location: 'الخرطوم' },
    { name: 'جامعة أم درمان الإسلامية', location: 'أم درمان' },
    { name: 'جامعة النيلين', location: 'الخرطوم' },
    { name: 'جامعة الأحفاد للبنات', location: 'أم درمان' },
  ];

  const createdUniversities = [];

  for (const uni of universitiesData) {
    const adminEmail = `admin@${uni.name.replace(/\s+/g, '').toLowerCase()}.edu`;
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const admin = await prisma.user.create({
        data: {
          name: `مدير ${uni.name}`,
          email: adminEmail,
          password: hashedPassword,
          phone: `+24912345${Math.floor(Math.random() * 1000)}`,
          nationalId: `11${Math.floor(Math.random() * 10000000)}`,
          role: 'UNIVERSITY',
          wallet: { create: { balance: Math.floor(Math.random() * 5000000) } }
        }
      });

      const newUni = await prisma.university.create({
        data: {
          name: uni.name,
          location: uni.location,
          adminId: admin.id,
          showGradesToParent: false,
          showBehaviorToParent: false,
          showFeesToParent: true,
          publicationMode: 'HYBRID',
          majors: {
            create: [
              { name: 'الطب والجراحة', tuitionFee: 1500000 },
              { name: 'الهندسة الكهربائية', tuitionFee: 850000 },
              { name: 'علوم الحاسوب', tuitionFee: 750000 },
            ]
          },
          schedules: {
            create: [
              { courseName: 'الرياضيات الهندسية', teacherName: 'د. أحمد محمود', day: 'الأحد', time: '09:00 AM' },
              { courseName: 'مقدمة في البرمجة', teacherName: 'د. سارة عثمان', day: 'الإثنين', time: '11:00 AM' },
              { courseName: 'الفيزياء العامة', teacherName: 'د. عمر حسن', day: 'الأربعاء', time: '02:00 PM' }
            ]
          }
        },
        include: { majors: true, schedules: true }
      });
      createdUniversities.push(newUni);
      console.log(`✅ Created ${uni.name} with admin, majors, and schedules.`);
    }
  }

  // 2. Create Mock Students, Parents & Transactions
  if (createdUniversities.length > 0) {
    console.log('Generating 20 mock students and parents...');
    for (let i = 1; i <= 20; i++) {
      const email = `student${i}@test.com`;
      const existing = await prisma.user.findUnique({ where: { email } });
      
      if (!existing) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const gender = i % 2 === 0 ? 'FEMALE' : 'MALE';
        
        const student = await prisma.user.create({
          data: {
            name: gender === 'FEMALE' ? `طالبة تجريبية ${i}` : `طالب تجريبي ${i}`,
            email: email,
            password: hashedPassword,
            phone: `+24991${Math.floor(Math.random() * 10000000)}`,
            nationalId: `12${Math.floor(Math.random() * 10000000)}`,
            role: 'STUDENT',
            gender: gender
          }
        });

        // Create a parent
        const parent = await prisma.user.create({
          data: {
            name: `ولي أمر ${student.name}`,
            email: `parent${i}@test.com`,
            password: hashedPassword,
            phone: `+24911${Math.floor(Math.random() * 10000000)}`,
            nationalId: `10${Math.floor(Math.random() * 10000000)}`,
            role: 'PARENT',
            linkedStudentId: student.id,
            gender: 'MALE'
          }
        });

        const depositAmount = Math.floor(Math.random() * 2000000) + 500000;
        const wallet = await prisma.wallet.create({
          data: {
            userId: student.id,
            balance: depositAmount,
            transactions: {
              create: [
                { amount: depositAmount, type: 'DEPOSIT', description: 'شحن محفظة مبدئي' }
              ]
            }
          }
        });

        const randomUni = createdUniversities[Math.floor(Math.random() * createdUniversities.length)];
        const randomMajor = randomUni.majors[Math.floor(Math.random() * randomUni.majors.length)];
        const degreeType = i % 5 === 0 ? 'POSTGRAD' : 'UNDERGRAD'; // 20% are grad students

        if (wallet.balance >= randomMajor.tuitionFee) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: { decrement: randomMajor.tuitionFee } }
          });
          
          await prisma.transaction.create({
            data: {
              walletId: wallet.id,
              amount: -randomMajor.tuitionFee,
              type: 'PAYMENT',
              description: `سداد رسوم ${randomMajor.name} - ${randomUni.name}`
            }
          });

          await prisma.application.create({
            data: {
              studentId: student.id,
              universityId: randomUni.id,
              majorId: randomMajor.id,
              degreeType: degreeType,
              status: 'PAID'
            }
          });
        }

        // Add some mock feedback randomly
        if (i % 3 === 0) {
          await prisma.feedback.create({
            data: {
              universityId: randomUni.id,
              senderId: student.id,
              type: 'COMPLAINT',
              message: 'جدول المحاضرات يحتاج إلى تعديل لتجنب التعارض.',
              status: 'NEW'
            }
          });
        }
        if (i % 4 === 0) {
          await prisma.feedback.create({
            data: {
              universityId: randomUni.id,
              senderId: parent.id,
              type: 'SUGGESTION',
              message: 'نرجو توفير حافلات نقل إضافية للطالبات.',
              status: 'REVIEW'
            }
          });
        }
      }
    }
    console.log('✅ Generated 20 students, parents, and processed simulated tuition payments.');
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
