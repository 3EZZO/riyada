import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get feedback for a specific university
router.get('/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const feedbacks = await prisma.feedback.findMany({
      where: { universityId: parseInt(universityId) },
      include: { sender: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { universityId, senderId, type, message } = req.body;
    const feedback = await prisma.feedback.create({
      data: {
        universityId: parseInt(universityId),
        senderId: parseInt(senderId),
        type,
        message,
        status: 'NEW'
      }
    });
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const feedback = await prisma.feedback.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
