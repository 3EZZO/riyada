import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get schedules for a specific university
router.get('/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const schedules = await prisma.schedule.findMany({
      where: { universityId: parseInt(universityId) },
      orderBy: { createdAt: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get schedules for a student based on their applications
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const applications = await prisma.application.findMany({
      where: { studentId: parseInt(studentId) },
      select: { universityId: true }
    });
    
    if (applications.length === 0) {
      return res.json([]);
    }
    
    const uniIds = applications.map(a => a.universityId);
    const schedules = await prisma.schedule.findMany({
      where: { universityId: { in: uniIds } },
      orderBy: { createdAt: 'asc' }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle alert for a specific schedule
router.post('/alert', async (req, res) => {
  try {
    const { studentId, scheduleId, minutesBefore } = req.body;
    
    // Upsert the alert
    let alert = await prisma.alert.findFirst({
      where: { studentId: parseInt(studentId), scheduleId: parseInt(scheduleId) }
    });

    if (alert) {
      alert = await prisma.alert.update({
        where: { id: alert.id },
        data: { minutesBefore: parseInt(minutesBefore), isActive: true }
      });
    } else {
      alert = await prisma.alert.create({
        data: {
          studentId: parseInt(studentId),
          scheduleId: parseInt(scheduleId),
          minutesBefore: parseInt(minutesBefore),
          isActive: true
        }
      });
    }

    res.json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active alerts for a student
router.get('/alerts/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const alerts = await prisma.alert.findMany({
      where: { studentId: parseInt(studentId), isActive: true }
    });
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
