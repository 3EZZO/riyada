import { Router } from 'express';

const router = Router();

// Mock AI Tutor Endpoint
router.post('/ai-tutor', async (req: any, res: any) => {
  try {
    const { question, courseId } = req.body;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let answer = "عذراً، لم أفهم سؤالك جيداً. هل يمكنك التوضيح أكثر؟";

    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('تفاضل') || lowerQ.includes('اشرح')) {
      answer = `أهلاً بك يا أحمد! دعنا نبسط التفاضل والتكامل في سياق الهندسة 📐

التفاضل (Differentiation):
هو دراسة "معدل التغير اللحظي". تخيل أنك تقود سيارة؛ سرعتك في لحظة معينة هي التفاضل للمسافة التي قطعتها بالنسبة للزمن. في الهندسة المدنية مثلاً، نستخدمه لحساب أقصى إجهاد يتحمله الجسر.

التكامل (Integration):
هو العملية العكسية. نستخدمه لـ "تجميع" الكميات. إذا عرفنا سرعة تدفق المياه في أنبوب (تفاضل)، يمكننا بالتكامل حساب الحجم الإجمالي للمياه المتجمعة في الخزان.

المعادلة الأساسية:
∫ f(x) dx = F(x) + C

هل تريدني أن أعطيك مسألة تدريبية سريعة لحلها معاً؟`;
    } else if (lowerQ.includes('واجب') || lowerQ.includes('الواجب')) {
      answer = `الواجب الأول يركز على إيجاد المشتقات للدوال المعقدة. 

تذكر استخدام **قاعدة السلسلة** (Chain Rule):
d/dx [f(g(x))] = f'(g(x)) · g'(x)

إذا واجهت صعوبة في سؤال محدد، اكتبه لي وسأساعدك خطوة بخطوة!`;
    } else if (lowerQ.includes('امتحان') || lowerQ.includes('اختبار')) {
      answer = `الامتحان النصفي سيكون في الأسبوع الثامن وسيشمل جميع المحاضرات من 1 إلى 7. 

ركز بشكل خاص على:
1. المعادلات التفاضلية من الدرجة الثانية.
2. تطبيقات التكامل في حساب المساحات.

حظاً موفقاً! 🌟`;
    }

    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
