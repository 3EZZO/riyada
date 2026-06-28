import React, { useState, useEffect } from 'react';
import { Wallet, Bell, FileText, ShoppingBag, Award, CheckCircle, QrCode, Calendar, Clock, X, User, Settings, GraduationCap, Activity, Shield, Video, Bot, Globe, Send } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function StudentDashboard() {
  const [wallet, setWallet] = useState(null);
  const [transcripts, setTranscripts] = useState(null);
  const [schedules, setSchedules] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allUniversities, setAllUniversities] = useState([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [alerts, setAlerts] = useState({});
  const [user, setUser] = useState(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showJitsiModal, setShowJitsiModal] = useState(false);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isCampusFrozen, setIsCampusFrozen] = useState(true); // Simulated frozen status for MOOC demo
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, ADMISSIONS, FINANCE, ACADEMICS, PROFILE
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('riyada_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        let targetId = parsedUser.id;
        const searchParams = new URLSearchParams(window.location.search);
        if (parsedUser.role === 'ADMIN' && searchParams.get('impersonate')) {
          targetId = searchParams.get('impersonate');
        }

        const res = await axios.get(`${API_URL}/payment/wallet/${targetId}`);
        setWallet(res.data);

        const transRes = await axios.get(`${API_URL}/university/registrar/transcript/${targetId}`);
        setTranscripts(transRes.data);

        const schedRes = await axios.get(`${API_URL}/schedule/student/${targetId}`);
        setSchedules(schedRes.data);

        const appRes = await axios.get(`${API_URL}/application/student/${targetId}`);
        setApplications(appRes.data);

        const uniRes = await axios.get(`${API_URL}/university`);
        setAllUniversities(uniRes.data);

        const alertRes = await axios.get(`${API_URL}/schedule/alerts/${targetId}`);
        const alertMap = {};
        alertRes.data.forEach(a => {
          alertMap[a.scheduleId] = a.minutesBefore;
        });
        setAlerts(alertMap);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  const handleToggleAlert = async (scheduleId, minutes) => {
    try {
      if (!minutes) {
        setAlerts(prev => ({...prev, [scheduleId]: null}));
        return;
      }
      
      await axios.post(`${API_URL}/schedule/alert`, {
        studentId: user.id,
        scheduleId,
        minutesBefore: minutes
      });
      setAlerts(prev => ({...prev, [scheduleId]: minutes}));
      alert(`تم تفعيل التنبيه قبل ${minutes} دقيقة من المحاضرة!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getTargetId = () => {
    return user.role === 'ADMIN' && new URLSearchParams(window.location.search).get('impersonate') 
      ? new URLSearchParams(window.location.search).get('impersonate') : user.id;
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>
            بوابة الطالب الأكاديمية
          </div>
          <h1 className="header-title" style={{ margin: 0 }}>مرحباً، {user.name}</h1>
          <p style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>منصتك المؤسسية لإدارة الشؤون الأكاديمية والمالية</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'ADMIN' && (
            <button onClick={() => navigate('/admin-dashboard')} className="badge badge-gold" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
              العودة للوحة الإدارة
            </button>
          )}
          <button className="btn-ghost" onClick={() => setShowIdModal(true)}>البطاقة الجامعية</button>
          <button onClick={() => { localStorage.removeItem('riyada_user'); localStorage.removeItem('riyada_token'); navigate('/'); }} className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'var(--red-glow)' }}>
            خروج
          </button>
        </div>
      </div>

      <div className="dash-tabs stagger-2" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['OVERVIEW', 'ADMISSIONS', 'ACADEMICS', 'FINANCE', 'PROFILE'].map(tab => (
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
              {tab === 'ADMISSIONS' && <FileText size={18} />}
              {tab === 'ACADEMICS' && <GraduationCap size={18} />}
              {tab === 'FINANCE' && <Wallet size={18} />}
              {tab === 'PROFILE' && <User size={18} />}
              {tab === 'OVERVIEW' ? 'نظرة عامة' : tab === 'ADMISSIONS' ? 'القبول والتسجيل' : tab === 'ACADEMICS' ? 'الأكاديميات' : tab === 'FINANCE' ? 'الشؤون المالية' : 'الملف الشخصي'}
            </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card gold-glow" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--gold)' }}>
                <Wallet size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>رصيد المحفظة</h3>
            </div>
            <div style={{ background: 'var(--card2)', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--glass-border-gold)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1, textShadow: '0 0 20px var(--gold-glow)' }}>
                {wallet ? wallet.balance.toLocaleString() : <div className="skeleton" style={{ height: '2.5rem', width: '50%', margin: '0 auto' }}></div>} <span style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>SDG</span>
              </div>
            </div>
            {applications.filter(a => a.status === 'PENDING').slice(0,1).map(app => (
              <div key={app.id} style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--red-glow)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>تنبيه: رسوم مستحقة</div>
                <div style={{ color: 'var(--ivory)' }}>{app.major.name}</div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.85rem', marginBottom: '1rem' }}>{app.major.tuitionFee.toLocaleString()} SDG</div>
                <button className="btn-cyan" style={{ background: 'var(--red)', width: '100%' }} onClick={() => setActiveTab('FINANCE')}>الذهاب للسداد</button>
              </div>
            ))}
            <button className="btn-cyan" style={{ marginTop: 'auto', padding: '1rem', width: '100%' }} onClick={() => navigate('/store')}>
              المتجر الإلكتروني
            </button>
          </div>

          <div className="menu-card teal-glow">
            {isCampusFrozen && (
              <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--red-glow)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} /> عمليات الحرم الجامعي متوقفة (Campus Frozen)
                  </div>
                  <div style={{ color: 'var(--ivory)' }}>تم تحويل مسارك الأكاديمي تلقائياً إلى مساقات Open edX العالمية لضمان استمرار دراستك.</div>
                </div>
                <button className="btn-cyan" style={{ background: 'var(--night)', borderColor: 'var(--red)', color: 'var(--ivory)' }} onClick={() => alert('محاكاة: يتم تحويلك إلى منصة Open edX للجامعات الإفريقية')}>تصفح المقررات العالمية <Globe size={16} style={{ display: 'inline', marginLeft: '5px' }} /></button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--teal)' }}>
                  <Clock size={28} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>محاضرات اليوم</h3>
              </div>
              <div className="badge badge-teal pulse-teal">الآن</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!schedules ? (
                <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
              ) : schedules.length === 0 ? (
                <p style={{ color: 'var(--ivory3)', textAlign: 'center', margin: '2rem 0' }}>لا يوجد جدول زمني متاح اليوم</p>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', minWidth: '80px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal)' }}>{schedule.time}</div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{schedule.courseName}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> {schedule.teacherName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        className="btn-cyan" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--teal)' }}
                        onClick={() => setShowJitsiModal(true)}
                      >
                        <Video size={16} /> دخول (Jitsi)
                      </button>
                      <select 
                        className="auth-input" 
                        style={{ padding: '0.4rem', fontSize: '0.85rem', width: '130px', background: 'rgba(0,0,0,0.2)' }}
                        value={alerts[schedule.id] || ''}
                        onChange={(e) => handleToggleAlert(schedule.id, e.target.value)}
                      >
                        <option value="">تفعيل تنبيه الذكاء الاصطناعي</option>
                        <option value="5">قبل 5 دقائق</option>
                        <option value="15">قبل 15 دقيقة</option>
                        <option value="30">قبل 30 دقيقة</option>
                        <option value="60">قبل 1 ساعة</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0' }}>نظام إدارة التعلم (LMS)</h4>
                <p style={{ margin: 0, color: 'var(--ivory3)', fontSize: '0.9rem' }}>الوصول إلى المقررات والمساعد الذكي.</p>
              </div>
              <button onClick={() => navigate('/lms')} className="btn-cyan" style={{ padding: '0.6rem 1.5rem' }}>الدخول للمنصة</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ADMISSIONS' && (
        <div className="stagger-3">
          <div className="menu-card teal-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 229, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
                <FileText size={24} color="var(--teal)" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>التقديم لبرنامج جديد</h3>
                <p style={{ margin: 0, color: 'var(--ivory3)' }}>تصفح الجامعات والبرامج المتاحة وقدم طلبك الآن.</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end', background: 'var(--night)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>اختر الجامعة المؤسسية</label>
                <select className="auth-input" value={selectedUni} onChange={e => { setSelectedUni(e.target.value); setSelectedMajor(''); }}>
                  <option value="">-- القائمة --</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.location}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>البرنامج / التخصص</label>
                <select className="auth-input" value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)}>
                  <option value="">-- التخصصات المتاحة --</option>
                  {selectedUni && allUniversities.find(u => u.id === parseInt(selectedUni))?.majors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} - {m.tuitionFee.toLocaleString()} SDG</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الصورة الشخصية للقبول</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="auth-input"
                  style={{ padding: '0.6rem', width: '220px' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-cyan" 
                  style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                  onClick={async () => {
                    if (!selectedUni) return alert('الرجاء اختيار الجامعة أولاً');
                    if (!selectedMajor) return alert('الرجاء اختيار التخصص');
                    if (!user.profilePhoto && !profilePhoto) return alert('الصورة الشخصية مطلوبة للقبول');

                    try {
                      await axios.post(`${API_URL}/application/apply`, {
                        studentId: getTargetId(),
                        majorId: selectedMajor,
                        universityId: selectedUni,
                        profilePhoto: profilePhoto || user.profilePhoto
                      });
                      alert('تم إرسال طلب التقديم بنجاح! راجع قسم المالية لسداد الرسوم المستحقة.');
                      setSelectedUni('');
                      setSelectedMajor('');
                      setProfilePhoto('');
                      const aRes = await axios.get(`${API_URL}/application/student/${getTargetId()}`);
                      setApplications(aRes.data);
                      
                      if (profilePhoto && getTargetId() === user.id) {
                        const updatedUser = { ...user, profilePhoto };
                        setUser(updatedUser);
                        localStorage.setItem('riyada_user', JSON.stringify(updatedUser));
                      }
                    } catch (e) {
                      alert('حدث خطأ أثناء التقديم');
                    }
                  }}
                >
                  تأكيد التقديم
                </button>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--ivory)' }}>طلباتي الحالية</h3>
          <div className="menu-card" style={{ padding: '0' }}>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1rem' }}>الجامعة</th>
                  <th style={{ padding: '1rem' }}>التخصص</th>
                  <th style={{ padding: '1rem' }}>تاريخ التقديم</th>
                  <th style={{ padding: '1rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>لا توجد طلبات تقديم</td></tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{app.university.name}</td>
                      <td style={{ padding: '1rem' }}>{app.major.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--ivory3)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${app.status === 'PAID' ? 'badge-teal' : app.status === 'ACCEPTED' ? 'badge-gold' : 'badge-red'}`}>
                          {app.status === 'PAID' ? 'تم سداد الرسوم (قيد المراجعة)' : app.status === 'PENDING' ? 'بإنتظار السداد' : app.status === 'ACCEPTED' ? 'تم القبول' : 'مرفوض'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="menu-card gold-glow" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Wallet size={40} color="var(--gold)" />
              </div>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--ivory3)' }}>الرصيد المتاح</h3>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1, textShadow: '0 0 30px var(--gold-glow)' }}>
                {wallet ? wallet.balance.toLocaleString() : '0'} <span style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>SDG</span>
              </div>
              <button 
                className="btn-ghost" 
                style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }}
                onClick={async () => {
                  try {
                    await axios.post(`${API_URL}/payment/deposit`, { userId: getTargetId(), amount: 100000 });
                    const res = await axios.get(`${API_URL}/payment/wallet/${getTargetId()}`);
                    setWallet(res.data);
                    alert('تم إيداع 100,000 SDG بنجاح! (محاكاة)');
                  } catch (e) {
                    console.error(e);
                  }
                }}
              >
                إيداع بنكي (محاكاة)
              </button>
            </div>

            {applications.filter(a => a.status === 'PENDING').length > 0 && (
              <div className="menu-card" style={{ border: '1px solid var(--red-glow)', background: 'rgba(255, 59, 48, 0.05)' }}>
                <h3 style={{ color: 'var(--red)', marginTop: 0 }}>رسوم مستحقة الدفع</h3>
                {applications.filter(a => a.status === 'PENDING').map(app => (
                  <div key={app.id} style={{ background: 'var(--card2)', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{app.major.name}</div>
                    <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{app.university.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1.2rem', color: 'var(--ivory)' }}>{app.major.tuitionFee.toLocaleString()} SDG</div>
                      <button 
                        className="btn-cyan" 
                        style={{ background: 'var(--red)' }}
                        onClick={async () => {
                          try {
                            await axios.post(`${API_URL}/payment/pay-tuition`, {
                              studentId: getTargetId(),
                              universityId: app.universityId,
                              majorId: app.majorId,
                              amountToPay: app.major.tuitionFee,
                              universityNumber: app.universityNumber
                            });
                            alert('تم سداد الرسوم الدراسية وتحويلها لحساب الجامعة بنجاح!');
                            const wRes = await axios.get(`${API_URL}/payment/wallet/${getTargetId()}`);
                            setWallet(wRes.data);
                            const aRes = await axios.get(`${API_URL}/application/student/${getTargetId()}`);
                            setApplications(aRes.data);
                          } catch (e) {
                            alert(e.response?.data?.error || 'حدث خطأ أثناء الدفع');
                          }
                        }}
                      >
                        سداد الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="menu-card">
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>سجل الحركات المالية</h3>
            <div className="institution-list">
              {!wallet ? (
                <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
              ) : wallet.transactions && wallet.transactions.length === 0 ? (
                <p style={{ color: 'var(--ivory3)', textAlign: 'center', padding: '3rem' }}>لا توجد حركات سابقة</p>
              ) : (
                (wallet.transactions || []).map((tx) => (
                  <div key={tx.id} style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <h4 style={{ color: tx.amount > 0 ? 'var(--teal)' : 'var(--red)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                        {tx.type === 'DEPOSIT' ? 'إيداع نقدي' : 'مشتريات / رسوم'}
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

      {activeTab === 'ACADEMICS' && (
        <div className="stagger-3">
          <div className="menu-card teal-glow">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--ivory)' }}>السجل الأكاديمي الموثق</h3>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1rem' }}>الفصل الدراسي</th>
                  <th style={{ padding: '1rem' }}>الجامعة</th>
                  <th style={{ padding: '1rem' }}>المعدل الفصلي</th>
                  <th style={{ padding: '1rem' }}>النقاط</th>
                  <th style={{ padding: '1rem' }}>تاريخ الإصدار</th>
                  <th style={{ padding: '1rem' }}>التوثيق (Blockchain)</th>
                </tr>
              </thead>
              <tbody>
                {!transcripts ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</td></tr>
                ) : transcripts.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ivory3)' }}>لا توجد سجلات أكاديمية معتمدة بعد.</td></tr>
                ) : (
                  transcripts.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1.5rem 1rem' }}>{t.semester}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>{t.university.name}</td>
                      <td style={{ padding: '1.5rem 1rem', color: 'var(--teal)', fontWeight: 'bold', fontSize: '1.1rem' }}>{t.gpa}</td>
                      <td style={{ padding: '1.5rem 1rem' }}>{t.credits}</td>
                      <td style={{ padding: '1.5rem 1rem', color: 'var(--ivory3)' }}>{new Date(t.issuedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1.5rem 1rem' }}><div className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={14}/> موثق برمز معمد</div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--gold)', marginBottom: '1.5rem', background: 'var(--night)' }}>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={80} color="var(--ivory3)" style={{ marginTop: '30px' }} />
              )}
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{user.name}</h2>
            <div className="badge badge-teal" style={{ marginBottom: '1.5rem' }}>طالب جامعي</div>
            <button className="btn-ghost" onClick={() => setShowIdModal(true)} style={{ width: '100%' }}>عرض البطاقة الذكية</button>
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
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الجنس</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.gender === 'MALE' ? 'ذكر' : user.gender === 'FEMALE' ? 'أنثى' : '-'}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>تاريخ التسجيل بالمنصة</div>
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

      {/* Digital ID Modal */}
      {showIdModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={() => setShowIdModal(false)}>
          <div style={{
            background: 'linear-gradient(135deg, #0F2040, #162B55)',
            border: '1px solid var(--gold)',
            borderRadius: '20px', width: '90%', maxWidth: '350px',
            position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIdModal(false)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)',
              border: 'none', color: 'white', borderRadius: '50%', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <X size={16} />
            </button>
            
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                البطاقة الجامعية الذكية
              </div>
              
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '3px solid var(--teal)', margin: '0 auto 1.5rem auto', overflow: 'hidden', background: 'var(--night)' }}>
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={64} color="var(--ivory3)" style={{ marginTop: '25px' }} />
                )}
              </div>
              
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>{user.name}</h2>
              <p style={{ color: 'var(--teal)', fontFamily: 'monospace', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
                ID: {user.nationalId || 'STD-2024-8921'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ivory3)' }}>الحالة</div>
                  <div style={{ color: 'var(--teal)', fontWeight: 800 }}>نشط (ACTIVE)</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ivory3)' }}>تاريخ الصلاحية</div>
                  <div style={{ color: 'var(--ivory)', fontWeight: 800 }}>12/2026</div>
                </div>
              </div>
              
              <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                <QrCode size={100} color="black" />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ivory3)', marginTop: '1rem' }}>
                امسح الرمز للتحقق من هوية الطالب
              </div>
            </div>
            
            <div style={{ background: 'var(--gold)', color: 'black', padding: '0.8rem', textAlign: 'center', fontWeight: 800 }}>
              منصة ريادة الأكاديمية
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Meet Modal */}
      {showJitsiModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--night)', borderBottom: '1px solid var(--teal)' }}>
            <div style={{ color: 'var(--teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={20} /> فصل افتراضي (Jitsi Meet Open Source)
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

      {/* AI Tutor Floating Widget */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {showAiTutor && (
          <div style={{ background: 'var(--night)', border: '1px solid var(--gold)', borderRadius: '16px', width: '350px', height: '450px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', padding: '1rem', color: 'black', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={20} /> AI Study Assistant (LLaMA)</div>
              <button onClick={() => setShowAiTutor(false)} style={{ background: 'none', border: 'none', color: 'black', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--gold)' }}>
                مرحباً! أنا مساعدك الذكي المدعوم بنماذج مفتوحة المصدر (HuggingFace). يمكنني تلخيص محاضراتك أو إعداد اختبارات تجريبية لك.
              </div>
              {aiChat.map((msg, i) => (
                <div key={i} style={{ padding: '0.8rem', borderRadius: '12px', background: msg.role === 'user' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.05)', alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end', color: msg.role === 'user' ? 'var(--teal)' : 'var(--ivory)', maxWidth: '85%' }}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={aiInput} 
                onChange={e => setAiInput(e.target.value)} 
                placeholder="اسأل سؤالاً..." 
                className="auth-input" 
                style={{ flex: 1, padding: '0.6rem' }}
                onKeyPress={e => {
                  if (e.key === 'Enter' && aiInput) {
                    setAiChat([...aiChat, { role: 'user', text: aiInput }]);
                    setAiInput('');
                    setTimeout(() => setAiChat(prev => [...prev, { role: 'ai', text: 'محاكاة: استجابة سريعة من HuggingFace API...' }]), 1000);
                  }
                }}
              />
              <button 
                className="btn-cyan" 
                style={{ padding: '0.6rem' }}
                onClick={() => {
                  if (aiInput) {
                    setAiChat([...aiChat, { role: 'user', text: aiInput }]);
                    setAiInput('');
                    setTimeout(() => setAiChat(prev => [...prev, { role: 'ai', text: 'محاكاة: استجابة سريعة من HuggingFace API...' }]), 1000);
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
        <button 
          onClick={() => setShowAiTutor(!showAiTutor)}
          style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gold)', color: 'black', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(212, 175, 55, 0.4)' }}
        >
          <Bot size={32} />
        </button>
      </div>

    </div>
  );
}
