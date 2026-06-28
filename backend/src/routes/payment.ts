import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient({ log: ['info'] });

// Simulated Bank of Sudan Deposit
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: parseInt(userId) } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + parseFloat(amount) }
    });
    
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        description: 'إيداع من بنك السودان المركزي'
      }
    });
    
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store Purchase Route
router.post('/purchase', async (req, res) => {
  try {
    const { userId, amount, item } = req.body;
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: parseInt(userId) } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    if (wallet.balance < parseFloat(amount)) return res.status(400).json({ error: 'رصيد غير كافٍ' });
    
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - parseFloat(amount) }
    });
    
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -parseFloat(amount),
        type: 'PAYMENT',
        description: `شراء متجر: ${item}`
      }
    });
    
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pay Tuition to University
router.post('/pay-tuition', async (req, res) => {
  try {
    const { studentId, universityId, amountToPay, universityNumber } = req.body;

    // Use transaction for safety
    const result = await prisma.$transaction(async (tx) => {
      const studentWallet = await tx.wallet.findUnique({ where: { userId: parseInt(studentId) } });
      
      if (!studentWallet || studentWallet.balance < parseFloat(amountToPay)) {
        throw new Error('Insufficient funds in wallet');
      }

      // Deduct from student
      const updatedStudentWallet = await tx.wallet.update({
        where: { userId: parseInt(studentId) },
        data: { balance: { decrement: parseFloat(amountToPay) } }
      });

      // Record Student Transaction
      const studentTx = await tx.transaction.create({
        data: {
          walletId: studentWallet.id,
          amount: -parseFloat(amountToPay),
          type: 'PAYMENT',
          description: `سداد رسوم دراسية لجامعة (ID: ${universityId})`,
          reference: universityNumber || '',
        }
      });

      // Find University Admin
      const university = await tx.university.findUnique({
        where: { id: parseInt(universityId) },
        select: { adminId: true, name: true }
      });

      if (!university) throw new Error('University not found');

      // Calculate Riyada Revenue Split (e.g., 2% fee)
      const riyadaFee = parseFloat(amountToPay) * 0.02;
      const universityAmount = parseFloat(amountToPay) - riyadaFee;

      // Credit University Admin Wallet
      const uniWallet = await tx.wallet.findUnique({ where: { userId: university.adminId } });
      if (uniWallet) {
        await tx.wallet.update({
          where: { userId: university.adminId },
          data: { balance: { increment: universityAmount } }
        });

        // Record University Transaction
        await tx.transaction.create({
          data: {
            walletId: uniWallet.id,
            amount: universityAmount,
            type: 'DEPOSIT',
            description: `تحصيل رسوم دراسية من طالب (ID: ${studentId}) - خصم عمولة ريادة 2%`,
          }
        });
      }

      // Update Application Status
      await tx.application.updateMany({
        where: { studentId: parseInt(studentId), universityId: parseInt(universityId), status: 'PENDING' },
        data: { status: 'PAID' }
      });

      return {
        balance: updatedStudentWallet.balance,
        receipt: studentTx.id,
        universityAmount,
        riyadaFee
      };
    });
    
    res.json({ message: 'Payment successful', ...result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Get Wallet Status
router.get('/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const wallet = await prisma.wallet.findUnique({
      where: { userId: parseInt(userId) },
      include: { transactions: { orderBy: { createdAt: 'desc' } } }
    });

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
