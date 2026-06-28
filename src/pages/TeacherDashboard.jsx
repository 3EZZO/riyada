import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, MessageCircle, FileText, CheckCircle, Clock, Video, X, Search, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('SCHEDULE'); // SCHEDULE, STUDENTS, GRADES, MESSAGES
  const [showJitsiModal, setShowJitsiModal] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(null); // 'scanning', 'complete'
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('riyada_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--teal)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>
            بوابة المعلمين والأكاديميين
          </div>
          <h1 className="header-title" style={{ margin: 0 }}>مرحباً أستاذ، {user.name}</h1>
          <p style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>إدارة المحاضرات، التقييم، وتواصل الطلاب</p>
        </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user.role === 'ADMIN' && (
              <button onClick={() => navigate('/admin-dashboard')} className="btn-cyan" style={{ background: 'transparent', color: 'var(--teal)', border: '1px solid var(--teal)' }}>
                العودة للوحة الإدارة
              </button>
            )}
            <button onClick={() => { localStorage.removeItem('riyada_user'); localStorage.removeItem('riyada_token'); navigate('/'); }} className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'var(--red-glow)' }}>
              خروج
            </button>
          </div>
        </div>

      <div className="dash-tabs stagger-2" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['SCHEDULE', 'STUDENTS', 'GRADES', 'MESSAGES'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{ 
                background: 'none', border: 'none', 
                color: activeTab === tab ? 'var(--teal)' : 'var(--ivory3)', 
                fontWeight: 800, cursor: 'pointer', 
                paddingBottom: '0.5rem', 
                borderBottom: activeTab === tab ? '2px solid var(--teal)' : 'none',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
              {tab === 'SCHEDULE' && <Calendar size={18} />}
              {tab === 'STUDENTS' && <Users size={18} />}
              {tab === 'GRADES' && <FileText size={18} />}
              {tab === 'MESSAGES' && <MessageCircle size={18} />}
              {tab === 'SCHEDULE' ? 'الجدول والمحاضرات' : tab === 'STUDENTS' ? 'إدارة الطلاب' : tab === 'GRADES' ? 'رصد الدرجات' : 'التواصل'}
            </button>
        ))}
      </div>

      {activeTab === 'SCHEDULE' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
             <Clock size={48} color="var(--teal)" style={{ margin: '0 auto 1rem auto' }} />
             <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>محاضرة قادمة</h3>
             <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)' }}>11:00 AM</div>
             <div style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>مقدمة في البرمجة - القاعة 4</div>
             <button className="btn-cyan" style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowJitsiModal(true)}>
               <Video size={18} /> بدء البث المباشر (Jitsi)
             </button>
             <button className="btn-ghost" style={{ marginTop: '1rem', width: '100%' }}>بدء تسجيل الحضور (QR)</button>
          </div>

          <div className="menu-card teal-glow">
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>جدول اليوم</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { time: '09:00 AM', course: 'الرياضيات الهندسية', room: 'القاعة الكبرى', status: 'COMPLETED' },
                { time: '11:00 AM', course: 'مقدمة في البرمجة', room: 'القاعة 4', status: 'NEXT' },
                { time: '02:00 PM', course: 'فيزياء عامة', room: 'المعمل 2', status: 'PENDING' },
              ].map((s, idx) => (
                <div key={idx} style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: s.status === 'NEXT' ? '1px solid var(--teal)' : '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', minWidth: '80px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.status === 'COMPLETED' ? 'var(--ivory3)' : 'var(--teal)' }}>{s.time}</div>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: s.status === 'COMPLETED' ? 'var(--ivory3)' : 'var(--ivory)' }}>{s.course}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}>{s.room}</div>
                    </div>
                  </div>
                  {s.status === 'COMPLETED' && <CheckCircle color="var(--teal)" />}
                  {s.status === 'NEXT' && <span className="badge badge-teal pulse-teal">التالية</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'STUDENTS' && (
        <div className="stagger-3">
          <div className="menu-card">
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>قائمة الطلاب - مقدمة في البرمجة</h3>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1rem' }}>الاسم</th>
                  <th style={{ padding: '1rem' }}>الرقم الجامعي</th>
                  <th style={{ padding: '1rem' }}>نسبة الحضور</th>
                  <th style={{ padding: '1rem' }}>إنذار أكاديمي</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>طالب تجريبي 1</td>
                  <td style={{ padding: '1rem' }}>STD-001</td>
                  <td style={{ padding: '1rem', color: 'var(--teal)' }}>95%</td>
                  <td style={{ padding: '1rem' }}>-</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>طالب تجريبي 2</td>
                  <td style={{ padding: '1rem' }}>STD-002</td>
                  <td style={{ padding: '1rem', color: 'var(--red)' }}>65%</td>
                  <td style={{ padding: '1rem' }}><button className="badge badge-red" style={{ border: 'none' }}>إرسال إنذار لولي الأمر</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'GRADES' && (
        <div className="stagger-3">
          <div className="menu-card gold-glow">
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>رصد الدرجات (مربوط بالبلوكتشين)</h3>
            <p style={{ color: 'var(--ivory3)', marginBottom: '2rem' }}>قم برفع الدرجات هنا. سيتم توثيقها تلقائياً ولا يمكن تعديلها بعد الاعتماد لضمان النزاهة الأكاديمية.</p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="file" className="auth-input" style={{ flex: 1 }} accept=".csv,.xlsx" />
              <button className="btn-cyan">رفع الكشف</button>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold)', borderRadius: '12px', color: 'var(--gold)' }}>
              <strong>ملاحظة:</strong> النظام سيقوم بترحيل الدرجات مباشرة لبوابة الطالب بناءً على سياسات الخصوصية.
            </div>
          </div>

          <div className="menu-card" style={{ marginTop: '2rem', border: '1px solid var(--red-glow)', background: 'rgba(255, 59, 48, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <ShieldAlert color="var(--red)" size={24} />
              <h3 style={{ margin: 0, color: 'var(--red)' }}>فحص النزاهة الأكاديمية (CopyLeaks / OCR)</h3>
            </div>
            <p style={{ color: 'var(--ivory3)', marginBottom: '1.5rem' }}>رفع بحوث أو مشاريع الطلاب لفحص نسبة الاقتباس واستخدام الذكاء الاصطناعي.</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input type="file" className="auth-input" style={{ flex: 1 }} accept=".pdf,.docx,.txt" />
              <button 
                className="btn-cyan" 
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => {
                  setOcrStatus('scanning');
                  setTimeout(() => setOcrStatus('complete'), 2500);
                }}
              >
                <Search size={16} style={{ display: 'inline', marginRight: '5px' }} /> بدء الفحص
              </button>
            </div>

            {ocrStatus === 'scanning' && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--teal)' }}>
                <div className="skeleton" style={{ height: '8px', width: '100%', marginBottom: '1rem' }}></div>
                جاري المسح الضوئي وتحليل النصوص...
              </div>
            )}

            {ocrStatus === 'complete' && (
              <div style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--ivory)' }}>نتيجة الفحص التلقائي</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--ivory3)' }}>نسبة الاقتباس (Plagiarism):</span>
                  <span style={{ color: 'var(--teal)', fontWeight: 'bold' }}>4% (مقبول)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ivory3)' }}>محتوى مولد بالذكاء الاصطناعي:</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>12% (يستدعي المراجعة)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'MESSAGES' && (
        <div className="stagger-3">
          <div className="menu-card">
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <MessageCircle size={64} color="var(--ivory3)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--ivory3)' }}>لا توجد رسائل جديدة</h3>
              <p style={{ color: 'var(--ivory3)' }}>هنا يمكنك التواصل بشكل خاص مع طلابك والإجابة على استفساراتهم الأكاديمية.</p>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Broadcast Modal */}
      {showJitsiModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--night)', borderBottom: '1px solid var(--teal)' }}>
            <div style={{ color: 'var(--teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={20} /> فصل افتراضي (Jitsi Meet Open Source) - المعلم
            </div>
            <button onClick={() => setShowJitsiModal(false)} className="btn-ghost" style={{ padding: '0.5rem', color: 'var(--red)', borderColor: 'transparent' }}><X size={24} /></button>
          </div>
          <div style={{ flex: 1 }}>
            <iframe 
              src="https://meet.jit.si/RiyadaClass_Demo_2024" 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              allow="camera; microphone; fullscreen; display-capture"
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}
