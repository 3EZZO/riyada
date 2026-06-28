import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient({ log: ['info'] });

router.get('/platform', async (req: any, res: any) => {
  try {
    // Total Students
    const studentCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    });

    // Total Universities
    const universityCount = await prisma.university.count();

    // Total Active Enrollments
    const enrollmentCount = await prisma.enrollment.count();

    // Total Processed Volume (Only PAYMENT transactions)
    const transactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'PAYMENT' } // Summing actual payments made, not deposits
    });

    // Calculate metrics
    // Ensure amount isn't null if there are no transactions
    // Note: Our transactions are negative for payments (deductions). 
    // We take Math.abs to get total volume.
    const totalVolume = Math.abs(transactions._sum.amount || 0); 
    const platformCommission = totalVolume * 0.02; // 2% fee

    res.json({
      students: studentCount,
      universities: universityCount,
      enrollments: enrollmentCount,
      totalVolume,
      platformCommission
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
});

export default router;
