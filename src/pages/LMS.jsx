import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, FileText, MessageCircle, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/navigation';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TypingText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setIsTyping(true);
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15); // Very fast, fluid typing
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayedText}
      {isTyping && <span className="ai-cursor"></span>}
    </span>
  );
};

export default function LMS() {
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, assignments, ai
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  // Mock course data if DB is empty for demo purposes
  const mockCourse = {
    id: 1,
    name: 'الرياضيات الهندسية المتقدمة',
    code: 'MATH301',
    lecturer: { name: 'د. عثمان أحمد' },
    lessons: [
      { id: 1, title: 'المحاضرة 1: مراجعة التفاضل والتكامل', contentUrl: '#', videoUrl: '#' },
      { id: 2, title: 'المحاضرة 2: المعادلات التفاضلية', contentUrl: '#', videoUrl: '#' },
    ],
    assignments: [
      { id: 1, title: 'الواجب الأول: التفاضل', dueDate: new Date(Date.now() + 86400000*3).toISOString(), maxScore: 100 }
    ]
  };

  useEffect(() => {
    const userData = localStorage.getItem('riyada_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));
    setCourse(mockCourse);
  }, [navigate]);

  const handleAskAI = async (e) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const questionText = aiInput;
    const newChat = [...aiChat, { role: 'user', text: questionText }];
    setAiChat(newChat);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await axios.post(`${API_URL}/lms/ai-tutor`, {
        question: questionText,
        courseId: course.id
      });
      setAiChat([...newChat, { role: 'ai', text: res.data.answer }]);
    } catch (error) {
      setAiChat([...newChat, { role: 'ai', text: 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!course) return <div style={{color:'white', textAlign:'center', marginTop:'5rem'}}>جاري التحميل...</div>;

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title" style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={28} color="var(--teal)" /> {course.name}
          </h1>
          <p style={{ color: 'var(--ivory3)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            رمز المقرر: {course.code} | أستاذ المادة: {course.lecturer?.name || 'غير محدد'}
          </p>
        </div>
        <button onClick={() => navigate(getDashboardRoute(user))} className="btn-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
          <ArrowLeft size={18} /> الرجوع للوحة التحكم
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('lessons')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'lessons' ? 'rgba(0, 212, 170, 0.1)' : 'transparent', color: activeTab === 'lessons' ? 'var(--teal)' : 'var(--ivory3)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlayCircle size={18} /> المحاضرات والمقرر
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'assignments' ? 'rgba(232, 89, 60, 0.1)' : 'transparent', color: activeTab === 'assignments' ? 'var(--red)' : 'var(--ivory3)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FileText size={18} /> الواجبات والتقييم
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'ai' ? 'rgba(201, 149, 42, 0.1)' : 'transparent', color: activeTab === 'ai' ? 'var(--gold)' : 'var(--ivory3)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <MessageCircle size={18} /> المساعد الذكي (AI)
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          {course.lessons.map(lesson => (
            <div key={lesson.id} className="menu-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{lesson.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ivory3)' }}>متوفر للعرض والتحميل (يعمل بدون انترنت)</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn-cyan" 
                  style={{ background: 'rgba(201, 149, 42, 0.2)', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                  onClick={() => {
                    setActiveTab('ai');
                    const msg = `لخص لي ${lesson.title} من فضلك`;
                    setAiInput(msg);
                  }}
                >
                  <MessageCircle size={16} style={{ display: 'inline', marginLeft: '5px' }} /> تلخيص (AI)
                </button>
                <button className="btn-cyan" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>تحميل PDF</button>
                <button className="btn-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PlayCircle size={16}/> مشاهدة الفيديو</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          {course.assignments.map(ass => (
            <div key={ass.id} className="menu-card" style={{ borderLeft: '3px solid var(--red)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{ass.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ivory3)' }}>آخر موعد للتسليم: <span style={{ color: 'var(--red)' }}>{new Date(ass.dueDate).toLocaleDateString()}</span></p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{ass.maxScore}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ivory3)' }}>الدرجة القصوى</div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-cyan">تسليم الواجب</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="menu-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '550px', border: '1px solid rgba(0, 212, 170, 0.3)', boxShadow: '0 0 30px rgba(0, 212, 170, 0.05)' }}>
          <div style={{ background: 'linear-gradient(90deg, rgba(201, 149, 42, 0.1), rgba(0, 212, 170, 0.1))', padding: '1rem', borderBottom: '1px solid rgba(0, 212, 170, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--night)', fontWeight: 'bold', boxShadow: '0 0 15px rgba(0, 212, 170, 0.4)' }}>✨</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>المعلم الذكي <span style={{fontSize:'0.7rem', background:'var(--teal)', color:'var(--night)', padding:'2px 6px', borderRadius:'10px', fontWeight:800}}>BETA</span></h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ivory3)' }}>مدرب على مقرر {course.name} وجاهز للإجابة 24/7</p>
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiChat.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--ivory3)' }}>
                <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>اسألني أي سؤال عن {course.name}</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--card2)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setAiInput('اشرح لي التفاضل والتكامل')} onMouseEnter={(e) => e.target.style.borderColor = 'var(--gold)'} onMouseLeave={(e) => e.target.style.borderColor = 'var(--glass-border)'}>اشرح لي التفاضل والتكامل</span>
                  <span style={{ background: 'var(--card2)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setAiInput('كيف أحل الواجب الأول؟')} onMouseEnter={(e) => e.target.style.borderColor = 'var(--gold)'} onMouseLeave={(e) => e.target.style.borderColor = 'var(--glass-border)'}>كيف أحل الواجب الأول؟</span>
                </div>
              </div>
            ) : (
              aiChat.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                  <div style={{ 
                    background: msg.role === 'user' ? 'rgba(0, 212, 170, 0.1)' : 'linear-gradient(145deg, var(--card2), rgba(0,0,0,0.2))', 
                    padding: '1rem 1.2rem', 
                    borderRadius: '12px', 
                    color: msg.role === 'user' ? 'var(--teal)' : 'var(--ivory)', 
                    border: msg.role === 'user' ? '1px solid rgba(0, 212, 170, 0.3)' : '1px solid rgba(201, 149, 42, 0.2)', 
                    borderBottomRightRadius: msg.role === 'user' ? 0 : '12px', 
                    borderBottomLeftRadius: msg.role === 'ai' ? 0 : '12px',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    boxShadow: msg.role === 'ai' ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                  }}>
                    {msg.role === 'ai' ? <TypingText text={msg.text} /> : msg.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ivory3)', marginTop: '0.3rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.role === 'user' ? 'أنت' : 'Riyadah AI'}
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{ background: 'var(--card2)', padding: '1rem', borderRadius: '12px', color: 'var(--gold)', border: '1px solid var(--glass-border)', borderBottomLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="dot-flashing"></span> يكتب
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAskAI} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', background: 'var(--card)' }}>
            <input 
              type="text" 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..." 
              style={{ flex: 1, padding: '0.8rem 1rem', background: 'var(--card2)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--ivory)', outline: 'none' }}
              disabled={aiLoading}
            />
            <button type="submit" disabled={!aiInput.trim() || aiLoading} className="btn-cyan" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      
      {/* Add flashing dots animation for AI typing indicator */}
      <style>{`
        .dot-flashing {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--gold);
          color: var(--gold);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
          margin-right: 15px;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -10px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--gold);
          color: var(--gold);
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 10px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--gold);
          color: var(--gold);
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% { background-color: var(--teal); }
          50%, 100% { background-color: rgba(0, 212, 170, 0.2); }
        }
        .ai-cursor {
          display: inline-block;
          width: 8px;
          height: 15px;
          background-color: var(--teal);
          margin-right: 4px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
