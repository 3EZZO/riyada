import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get list of all universities
router.get('/', async (req, res) => {
  try {
    const unis = await prisma.university.findMany({
      select: { id: true, name: true, location: true, majors: true }
    });
    res.json(unis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visitors for a specific university admin
router.get('/visitors', async (req, res) => {
  try {
    // In a real app we would get adminId from JWT token. 
    // Here we use query params for demo simplicity.
    const { adminId } = req.query;
    if (!adminId) return res.status(400).json({ error: 'Admin ID required' });

    const uni = await prisma.university.findUnique({
      where: { adminId: parseInt(adminId as string) }
    });

    if (!uni) return res.status(404).json({ error: 'University not found' });

    const visitors = await prisma.user.findMany({
      where: { 
        role: 'VISITOR',
        targetUniversityId: uni.id
      },
      select: { id: true, name: true, email: true, phone: true, nationalId: true, profilePhoto: true, createdAt: true }
    });

    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activate a visitor into a student
router.post('/visitors/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: 'STUDENT' }
    });

    res.json({ message: 'Visitor activated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get university by adminId
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    const uni = await prisma.university.findUnique({
      where: { adminId: parseInt(adminId) },
      include: { majors: true }
    });
    if (!uni) return res.status(200).json(null); // the frontend expects null if not found
    res.json(uni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a university
router.post('/', async (req, res) => {
  try {
    const { name, location, adminId } = req.body;
    const uni = await prisma.university.create({
      data: { name, location, adminId: parseInt(adminId) }
    });
    res.json(uni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a major
router.post('/:id/majors', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tuitionFee } = req.body;
    const major = await prisma.major.create({
      data: { name, tuitionFee: parseFloat(tuitionFee), universityId: parseInt(id) }
    });
    res.json(major);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get registrar students
router.get('/registrar/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // We need to return students who are in this university
    // A simplified version: just return applications that are PAID
    const apps = await prisma.application.findMany({
      where: { universityId: parseInt(id), status: 'PAID' },
      include: { student: true, major: true }
    });
    
    // Map to the format the frontend expects for registrar
    const result = apps.map(app => ({
      student: app.student,
      enrollments: [{ course: { name: 'Course 1' }, grade: 'A' }, { course: { name: 'Course 2' }, grade: 'B' }], // mock enrollments
      gpa: 3.8
    }));
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Issue transcript
router.post('/registrar/transcript/issue', async (req, res) => {
  try {
    const { studentId, universityId, gpa } = req.body;
    const transcript = await prisma.transcript.create({
      data: {
        studentId: parseInt(studentId),
        universityId: parseInt(universityId),
        gpa: parseFloat(gpa),
        sealHash: 'SEAL-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      }
    });
    res.json(transcript);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transcripts for student
router.get('/registrar/transcript/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const transcripts = await prisma.transcript.findMany({
      where: { studentId: parseInt(studentId) },
      include: { university: true }
    });
    res.json(transcripts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update University Settings
router.post('/settings', async (req, res) => {
  try {
    const { universityId, showGradesToParent, showBehaviorToParent, showFeesToParent, publicationMode } = req.body;
    const uni = await prisma.university.update({
      where: { id: parseInt(universityId) },
      data: {
        showGradesToParent,
        showBehaviorToParent,
        showFeesToParent,
        publicationMode
      }
    });
    res.json(uni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student info for guardian
router.get('/guardian/student-info/:guardianId', async (req, res) => {
  try {
    const { guardianId } = req.params;
    const guardian = await prisma.user.findUnique({
      where: { id: parseInt(guardianId) }
    });
    
    if (!guardian || !guardian.linkedStudentId) {
      return res.status(404).json({ error: 'No linked student found' });
    }

    const student = await prisma.user.findUnique({
      where: { id: guardian.linkedStudentId }
    });

    const applications = await prisma.application.findMany({
      where: { studentId: guardian.linkedStudentId },
      include: { university: true, major: true }
    });

    const activeApp = applications.find(a => a.status === 'PAID') || applications[0];
    
    let universitySettings = null;
    if (activeApp) {
      universitySettings = {
        showGradesToParent: activeApp.university.showGradesToParent,
        showBehaviorToParent: activeApp.university.showBehaviorToParent,
        showFeesToParent: activeApp.university.showFeesToParent
      };
    }

    res.json({
      studentId: student?.id,
      name: student?.name || 'مجهول',
      universityName: activeApp ? activeApp.university.name : 'غير مسجل',
      majorName: activeApp ? activeApp.major.name : 'غير مسجل',
      universitySettings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
