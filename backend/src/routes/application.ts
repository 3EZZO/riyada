import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient({ log: ['info'] });

// Student applies to a major
router.post('/apply', async (req, res) => {
  try {
    const { studentId, majorId, universityId, profilePhoto } = req.body;
    
    // Update student's profile photo if provided
    if (profilePhoto) {
      await prisma.user.update({
        where: { id: parseInt(studentId) },
        data: { profilePhoto }
      });
    }

    const application = await prisma.application.create({
      data: {
        studentId: parseInt(studentId),
        majorId: parseInt(majorId),
        universityId: parseInt(universityId),
        status: 'PENDING'
      }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// University accepts/rejects application
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, universityNumber } = req.body; // status: ACCEPTED or REJECTED
    
    const application = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status, universityNumber }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const applications = await prisma.application.findMany({
      where: { studentId: parseInt(studentId) },
      include: { major: { include: { university: true } } }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications for a university
router.get('/university/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const applications = await prisma.application.findMany({
      where: { major: { universityId: parseInt(universityId) } },
      include: { student: true, major: true }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
