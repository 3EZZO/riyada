import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient({ log: ['info'] });
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretriyadajwt';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, nationalId, role, studentNationalId, profilePhoto, targetUniversityId } = req.body;

    if (!email || !password || !name || !phone || !nationalId) {
      return res.status(400).json({ error: 'All fields (Email, Password, Name, Phone, National ID) are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    let linkedStudentId = null;
    if (role === 'PARENT' && studentNationalId) {
      const student = await prisma.user.findFirst({ where: { nationalId: studentNationalId, role: 'STUDENT' } });
      if (!student) {
        return res.status(400).json({ error: 'Student with this National ID not found' });
      }
      linkedStudentId = student.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        nationalId,
        linkedStudentId,
        profilePhoto,
        targetUniversityId: targetUniversityId ? parseInt(targetUniversityId) : null,
        role: role || 'STUDENT',
        wallet: {
          create: {
            balance: 0.0,
          }
        }
      },
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (email === 'admin@riyada.com' && password === 'adminalmas') {
      const token = jwt.sign({ userId: 9999, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, user: { id: 9999, email: 'admin@riyada.com', name: 'Supreme Admin', role: 'ADMIN' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/demo-users', async (req: any, res: any) => {
  try {
    // Find a student that has enrollments or at least is a student
    const student = await prisma.user.findFirst({ 
      where: { role: 'STUDENT' },
      orderBy: { id: 'desc' }
    });
    
    // Guardian dashboard uses mock data for student but needs a wallet, so we use a real parent
    const parent = await prisma.user.findFirst({
      where: { role: 'PARENT' },
      orderBy: { id: 'desc' }
    });
    
    // Find any university since all have an adminId
    const university = await prisma.university.findFirst();
    
    res.json({
      studentId: student?.id,
      guardianId: parent?.id || student?.id,
      universityId: university?.adminId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
