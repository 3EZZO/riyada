import React, { useState, useEffect } from 'react';
import { User, Wallet, FileText, Bell, Shield, TrendingUp, AlertTriangle, Activity, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function GuardianDashboard() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, ACADEMICS, FINANCE, PROFILE
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('riyada_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchStudentData = async () => {
      try {
        let targetId = parsedUser.id;
        const searchParams = new URLSearchParams(window.location.search);
        if (parsedUser.role === 'ADMIN' && searchParams.get('impersonate')) {
          targetId = searchParams.get('impersonate');
        }

        const studentRes = await axios.get(`${API_URL}/university/guardian/student-info/${targetId}`);
        const studentInfo = studentRes.data;
        
        const walletRes = await axios.get(`${API_URL}/payment/wallet/${studentInfo.studentId}`);
        setWallet(walletRes.data);

        setStudentData({
          id: studentInfo.studentId,
          name: studentInfo.name,
          universityName: studentInfo.universityName,
          major: studentInfo.majorName,
          year: 'السنة الأولى',
          attendance: 92,
          gpa: 3.7,
          profilePhoto: studentInfo.profilePhoto,
          recentGrades: [
            { course: 'الرياضيات الهندسية', grade: 'A' },
            { course: 'الفيزياء', grade: 'B+' }
          ],
          settings: studentInfo.universitySettings || {
            showGradesToParent: false,
            showBehaviorToParent: false,
            showFeesToParent: true
          }
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'حدث خطأ أثناء جلب بيانات الطالب.');
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [navigate]);

  if (!user) return null;
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>جاري تحميل بيانات الطالب...</div>;
  if (error) return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>
      <h2 style={{ color: 'var(--red)' }}>عذراً</h2>
      <p>{error}</p>
      <button className="btn-cyan" onClick={() => navigate('/auth')}>العودة</button>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>
            بوابة أولياء الأمور
          </div>
          <h1 className="header-title" style={{ margin: 0 }}>مرحباً، {user.name}</h1>
          <p style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>متابعة الشؤون الأكاديمية والمالية للطالب</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          {user.role === 'ADMIN' && (
            <button onClick={() => navigate('/admin-dashboard')} className="badge badge-gold" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
              العودة للوحة الإدارة
            </button>
          )}
          <button onClick={() => { localStorage.removeItem('riyada_user'); localStorage.removeItem('riyada_token'); navigate('/'); }} className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'var(--red-glow)' }}>
            خروج
          </button>
        </div>
      </div>

      <div className="dash-tabs stagger-2" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['OVERVIEW', 'ACADEMICS', 'FINANCE', 'PROFILE'].filter(tab => {
          if (tab === 'ACADEMICS' && studentData && !studentData.settings.showGradesToParent) return false;
          if (tab === 'FINANCE' && studentData && !studentData.settings.showFeesToParent) return false;
          return true;
        }).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{ 
                background: 'none', border: 'none', 
                color: activeTab === tab ? 'var(--gold)' : 'var(--ivory3)', 
                fontWeight: 800, cursor: 'pointer', 
                paddingBottom: '0.5rem', 
                borderBottom: activeTab === tab ? '2px solid var(--gold)' : 'none',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
              {tab === 'OVERVIEW' && <Activity size={18} />}
              {tab === 'ACADEMICS' && <GraduationCap size={18} />}
              {tab === 'FINANCE' && <Wallet size={18} />}
              {tab === 'PROFILE' && <User size={18} />}
              {tab === 'OVERVIEW' ? 'نظرة عامة' : tab === 'ACADEMICS' ? 'الأكاديميات' : tab === 'FINANCE' ? 'الشؤون المالية' : 'الملف الشخصي'}
            </button>
        ))}
      </div>

      {/* Student Highlight (Visible across Overview, Academics, Finance) */}
      {activeTab !== 'PROFILE' && (
        <div className="menu-card stagger-3" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--teal)' }}>
            <img src={studentData.profilePhoto || 'https://via.placeholder.com/70'} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem' }}>{studentData.name}</h2>
            <p style={{ margin: 0, color: 'var(--ivory3)', fontSize: '0.9rem' }}>
              {studentData.universityName} • {studentData.major} • {studentData.year}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(0, 212, 170, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--teal)', fontWeight: 'bold' }}>
            طالب نشط
          </div>
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div className="card-grid stagger-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="menu-card teal-glow">
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--ivory)' }}>ملخص الأداء</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--card2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border-teal)' }}>
                {studentData.settings.showGradesToParent ? (
                  <>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--teal)' }}>{studentData.gpa}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}>المعدل (GPA)</div>
                  </>
                ) : (
                  <div style={{ color: 'var(--ivory3)', padding: '1rem 0', fontSize: '0.85rem' }}>مخفي (سياسة الجامعة)</div>
                )}
              </div>
              <div style={{ background: 'var(--card2)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border-gold)' }}>
                {studentData.settings.showBehaviorToParent ? (
                  <>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gold)' }}>{studentData.attendance}%</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}>نسبة الحضور</div>
                  </>
                ) : (
                  <div style={{ color: 'var(--ivory3)', padding: '1rem 0', fontSize: '0.85rem' }}>مخفي (سياسة الجامعة)</div>
                )}
              </div>
            </div>
            <button className="btn-cyan" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setActiveTab('ACADEMICS')}>عرض التفاصيل الأكاديمية</button>
          </div>

          <div className="menu-card gold-glow" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--ivory)' }}>الرصيد المتاح</h3>
            {studentData.settings.showFeesToParent ? (
              <div style={{ background: 'var(--card2)', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--glass-border-gold)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1, textShadow: '0 0 20px var(--gold-glow)' }}>
                  {wallet ? wallet.balance.toLocaleString() : 0} <span style={{ fontSize: '1.1rem', color: 'var(--gold)' }}>SDG</span>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--card2)', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--glass-border)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--ivory3)' }}>مخفي حسب سياسة الجامعة</div>
              </div>
            )}
            <button className="btn-ghost" style={{ width: '100%', borderColor: 'var(--gold)', color: 'var(--gold)' }} onClick={() => setActiveTab('FINANCE')}>الذهاب للشؤون المالية</button>
          </div>
        </div>
      )}

      {activeTab === 'ACADEMICS' && (
        <div className="menu-card teal-glow stagger-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--teal)' }}>
              <TrendingUp size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>الأداء الأكاديمي التفصيلي</h3>
          </div>
          
          <h4 style={{ color: 'var(--ivory2)', marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>أحدث الدرجات</h4>
          {studentData.settings.showGradesToParent ? (
            studentData.recentGrades.map((grade, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'var(--night)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--ivory)', fontWeight: 'bold' }}>{grade.course}</span>
                <span className="badge badge-teal">{grade.grade}</span>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--ivory3)', textAlign: 'center', padding: '3rem 0', background: 'var(--night)', borderRadius: '12px' }}>
              لا تتوفر صلاحية لعرض الدرجات الأكاديمية (محجوبة من قبل الجامعة أو الطالب)
            </div>
          )}
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="card-grid stagger-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
          <div className="menu-card gold-glow" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>الحالة المالية</h3>
            
            {studentData.settings.showFeesToParent ? (
              <>
                <div style={{ background: 'var(--card2)', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--glass-border-gold)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1, textShadow: '0 0 20px var(--gold-glow)' }}>
                    {wallet ? wallet.balance.toLocaleString() : 0} <span style={{ fontSize: '1.1rem', color: 'var(--gold)' }}>SDG</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ivory3)', marginTop: '0.8rem' }}>رصيد المحفظة</div>
                </div>

                <div style={{ background: 'rgba(255, 59, 48, 0.05)', border: '1px solid var(--red-glow)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <AlertTriangle size={24} color="var(--red)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--red)', marginBottom: '0.25rem', textShadow: '0 0 10px var(--red-glow)' }}>SDG 0</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--red)', opacity: 0.8 }}>الرسوم المستحقة حالياً</div>
                </div>

                <button 
                  className="btn-cyan" 
                  style={{ marginTop: 'auto', width: '100%', padding: '1rem', fontSize: '1rem' }}
                  onClick={async () => {
                    try {
                      const targetId = studentData.id;
                      await axios.post(`${API_URL}/payment/deposit`, { userId: targetId, amount: 100000 });
                      const res = await axios.get(`${API_URL}/payment/wallet/${targetId}`);
                      setWallet(res.data);
                      alert('تم إيداع 100,000 SDG بنجاح! (محاكاة)');
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                >
                  إيداع محاكاة (شحن المحفظة)
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--ivory3)', textAlign: 'center', padding: '3rem 0', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                البيانات المالية مخفية حسب سياسة الجامعة
              </div>
            )}
          </div>
          
          <div className="menu-card">
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>سجل حركات محفظة الطالب</h3>
            <div className="institution-list">
              {!wallet ? (
                <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
              ) : wallet.transactions && wallet.transactions.length === 0 ? (
                <p style={{ color: 'var(--ivory3)', textAlign: 'center', padding: '3rem' }}>لا توجد حركات سابقة في محفظة الطالب</p>
              ) : (
                (wallet.transactions || []).map((tx) => (
                  <div key={tx.id} style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <h4 style={{ color: tx.amount > 0 ? 'var(--teal)' : 'var(--red)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                        {tx.type === 'DEPOSIT' ? 'إيداع (تم بواسطة ولي الأمر أو الطالب)' : 'رسوم / مشتريات'}
                      </h4>
                      <p style={{ color: 'var(--ivory3)', margin: 0, fontSize: '0.9rem' }}>{tx.description}</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.2rem', color: tx.amount > 0 ? 'var(--teal)' : 'var(--red)' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} SDG
                      </div>
                      <div style={{ color: 'var(--ivory3)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="stagger-4" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--gold)', marginBottom: '1.5rem', background: 'var(--night)' }}>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={64} color="var(--ivory3)" style={{ marginTop: '25px' }} />
              )}
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{user.name}</h2>
            <div className="badge badge-gold" style={{ marginBottom: '1.5rem' }}>حساب ولي أمر</div>
          </div>

          <div className="menu-card">
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--ivory)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>البيانات الشخصية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الاسم الكامل</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الرقم الوطني</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.nationalId || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>تاريخ التسجيل</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <h3 style={{ margin: '3rem 0 2rem 0', color: 'var(--ivory)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>معلومات التواصل</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>رقم الهاتف</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold', direction: 'ltr', textAlign: 'right' }}>{user.phone || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>البريد الإلكتروني</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
