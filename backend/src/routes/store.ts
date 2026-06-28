import { Router } from 'express';

const router = Router();

// Mock store products
const products = [
  {
    id: 1,
    name: "لابتوب هندسي - إصدار خاص بالجامعة",
    description: "لابتوب بمواصفات عالية مخصص لطلاب كلية الهندسة.",
    price: 400000,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 2,
    name: "الزي الجامعي الموحد",
    description: "طقم كامل من الزي الرسمي المعتمد من المؤسسة التعليمية.",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    name: "حزمة المراجع الأساسية",
    description: "مجموعة الكتب والمراجع الأكاديمية للفصل الدراسي الأول.",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=60"
  }
];

// Get all products
router.get('/products', (req, res) => {
  res.json(products);
});

export default router;
