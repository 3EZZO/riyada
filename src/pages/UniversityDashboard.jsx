import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, CheckCircle, Search, FileSignature, Settings, Shield, Filter, LayoutDashboard, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function UniversityDashboard() {
  const [user, setUser] = useState(null);
  const [university, setUniversity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [registrarStudents, setRegistrarStudents] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, ADMISSIONS, REGISTRAR, VISITORS, PRIVACY, FEEDBACK, PROFILE
  const [privacySettings, setPrivacySettings] = useState({
    showGradesToParent: false,
    showBehaviorToParent: false,
    showFeesToParent: true,
    publicationMode: 'HYBRID'
  });
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterDegree, setFilterDegree] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
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

        const walletRes = await axios.get(`${API_URL}/payment/wallet/${targetId}`);
        setWallet(walletRes.data);

        const uniRes = await axios.get(`${API_URL}/university/admin/${targetId}`);
        
        let targetUni = uniRes.data;
        
        if (!targetUni) {
          const newUniRes = await axios.post(`${API_URL}/university`, {
            name: `جامعة ${parsedUser.name}`,
            location: 'الخرطوم',
            adminId: targetId
          });
          targetUni = newUniRes.data;
          
          const majorRes = await axios.post(`${API_URL}/university/${targetUni.id}/majors`, {
            name: "هندسة البرمجيات",
            tuitionFee: 450000
          });
          
          await axios.post(`${API_URL}/application/apply`, {
            studentId: targetId, 
            majorId: majorRes.data.id,
            universityId: targetUni.id
          });
        }
        
        setUniversity(targetUni);
        setPrivacySettings({
          showGradesToParent: targetUni.showGradesToParent,
          showBehaviorToParent: targetUni.showBehaviorToParent,
          showFeesToParent: targetUni.showFeesToParent,
          publicationMode: targetUni.publicationMode
        });
        
        const appsRes = await axios.get(`${API_URL}/application/university/${targetUni.id}`);
        setApplications(appsRes.data);

        const regRes = await axios.get(`${API_URL}/university/registrar/students/${targetUni.id}`);
        setRegistrarStudents(regRes.data);

        const visRes = await axios.get(`${API_URL}/university/visitors?adminId=${targetId}`);
        setVisitors(visRes.data);

        const fbRes = await axios.get(`${API_URL}/feedback/${targetUni.id}`);
        setFeedbacks(fbRes.data);
        
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleIssueTranscript = async (studentId, gpa) => {
    try {
      await axios.post(`${API_URL}/university/registrar/transcript/issue`, {
        studentId,
        universityId: university.id,
        gpa
      });
      alert('تم إصدار الشهادة بنجاح وتم ختمها رقمياً!');
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء إصدار الشهادة');
    }
  };

  const handleActivateVisitor = async (visitorId) => {
    try {
      await axios.post(`${API_URL}/university/visitors/${visitorId}/activate`);
      alert('تم تفعيل الزائر وتحويله إلى طالب بنجاح!');
      setVisitors(visitors.filter(v => v.id !== visitorId));
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء التفعيل');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.post(`${API_URL}/university/settings`, {
        universityId: university.id,
        ...privacySettings
      });
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handleUpdateFeedbackStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/feedback/${id}/status`, { status });
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f));
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  const handleUpdateAdmissionStatus = async (id, status) => {
    try {
      const universityNumber = status === 'ACCEPTED' ? `UNI-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}` : null;
      await axios.put(`${API_URL}/application/${id}/status`, { status, universityNumber });
      setApplications(applications.map(a => a.id === id ? { ...a, status, universityNumber } : a));
      alert(`تم ${status === 'ACCEPTED' ? 'قبول' : 'رفض'} الطالب بنجاح!`);
    } catch (err) {
      alert('حدث خطأ أثناء تحديث حالة القبول');
    }
  };

  if (!user || !university) return <div style={{color:'white', textAlign:'center', marginTop:'5rem'}}>جاري التحميل...</div>;

  const filteredApps = applications.filter(a => {
    if (filterGender !== 'ALL' && a.student.gender !== filterGender) return false;
    if (filterDegree !== 'ALL' && a.degreeType !== filterDegree) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (filterMajor !== 'ALL' && a.major.name !== filterMajor) return false;
    return true;
  });

  return (
    <div className="container" style={{ maxWidth: '1200px', paddingTop: '2rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>
            بوابة الجامعة
          </div>
          <h1 className="header-title" style={{ margin: 0 }}>مرحباً، {user.name}</h1>
          <p style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>إدارة الشؤون الأكاديمية والمالية والقبول</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'ADMIN' && (
            <button onClick={() => navigate('/admin-dashboard')} className="badge badge-gold" style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
              العودة للوحة الإدارة
            </button>
          )}
          <button onClick={() => { localStorage.removeItem('riyada_user'); localStorage.removeItem('riyada_token'); navigate('/'); }} className="btn-ghost" style={{ color: 'var(--red)', borderColor: 'var(--red-glow)' }}>
            تسجيل خروج
          </button>
        </div>
      </div>

      <div className="dash-tabs stagger-2" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['OVERVIEW', 'ADMISSIONS', 'REGISTRAR', 'VISITORS', 'PRIVACY', 'FEEDBACK', 'PROFILE'].map(tab => (
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
              {tab === 'OVERVIEW' && <LayoutDashboard size={18} />}
              {tab === 'ADMISSIONS' && <FileSignature size={18} />}
              {tab === 'REGISTRAR' && <CheckCircle size={18} />}
              {tab === 'VISITORS' && <Users size={18} />}
              {tab === 'PRIVACY' && <Shield size={18} />}
              {tab === 'FEEDBACK' && <Activity size={18} />}
              {tab === 'PROFILE' && <User size={18} />}
              {tab === 'OVERVIEW' ? 'نظرة عامة' : tab === 'ADMISSIONS' ? 'القبول والتسجيل' : tab === 'REGISTRAR' ? 'المسجل' : tab === 'VISITORS' ? 'الزوار' : tab === 'PRIVACY' ? 'الخصوصية' : tab === 'FEEDBACK' ? 'المقترحات' : 'الملف الشخصي'}
            </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="stagger-3 card-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="menu-card gold-glow" style={{ textAlign: 'center' }}>
            <DollarSign size={32} color="var(--gold)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory3)' }}>رصيد الجامعة (SDG)</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', textShadow: '0 0 20px var(--gold-glow)' }}>
              {wallet.balance.toLocaleString()}
            </div>
          </div>
          <div className="menu-card teal-glow" style={{ textAlign: 'center' }}>
            <Users size={32} color="var(--teal)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory3)' }}>الطلاب المسجلين</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--teal)', textShadow: '0 0 20px var(--teal-glow)' }}>
              {registrarStudents.length}
            </div>
          </div>
          <div className="menu-card" style={{ textAlign: 'center', border: '1px solid var(--red-glow)' }}>
            <FileSignature size={32} color="var(--red)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory3)' }}>طلبات قيد المراجعة</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--red)', textShadow: '0 0 20px var(--red-glow)' }}>
              {applications.filter(a => a.status === 'PAID').length}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ADMISSIONS' && (
        <div className="stagger-3">
          <div className="menu-card teal-glow" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select className="auth-input" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
              <option value="ALL">كل الحالات</option>
              <option value="PENDING">قيد المراجعة الأولية</option>
              <option value="PAID">مدفوع (جاهز للقبول)</option>
              <option value="ACCEPTED">تم القبول</option>
              <option value="REJECTED">مرفوض</option>
            </select>
            <select className="auth-input" value={filterGender} onChange={e=>setFilterGender(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
              <option value="ALL">الكل (الجنس)</option>
              <option value="MALE">ذكور</option>
              <option value="FEMALE">إناث</option>
            </select>
            <select className="auth-input" value={filterMajor} onChange={e=>setFilterMajor(e.target.value)} style={{ flex: 2, minWidth: '200px' }}>
              <option value="ALL">كل التخصصات</option>
              {[...new Set(applications.map(a => a.major.name))].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="menu-card" style={{ padding: '0' }}>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1.5rem 1rem' }}>الطالب</th>
                  <th style={{ padding: '1.5rem 1rem' }}>معلومات التواصل</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الجنس</th>
                  <th style={{ padding: '1.5rem 1rem' }}>التخصص</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الحالة</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => (
                  <tr key={app.id} onClick={() => setSelectedStudent(app)} style={{ cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid var(--glass-border)' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src={app.student.profilePhoto || 'https://via.placeholder.com/40'} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{app.student.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--ivory3)' }}>{app.student.nationalId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem' }}>{app.student.email}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}>{app.student.phone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{app.student.gender === 'MALE' ? 'ذكر' : 'أنثى'}</td>
                    <td style={{ padding: '1rem' }}>{app.major.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${app.status === 'PAID' ? 'badge-teal' : app.status === 'ACCEPTED' ? 'badge-gold' : app.status === 'REJECTED' ? 'badge-red' : 'badge-gold'}`}>
                        {app.status === 'PAID' ? 'رسوم مدفوعة' : app.status === 'PENDING' ? 'في الانتظار' : app.status === 'ACCEPTED' ? 'تم القبول' : 'مرفوض'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.status === 'PAID' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-cyan" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); handleUpdateAdmissionStatus(app.id, 'ACCEPTED'); }}>قبول</button>
                          <button className="btn-ghost" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--red)', borderColor: 'var(--red-glow)' }} onClick={(e) => { e.stopPropagation(); handleUpdateAdmissionStatus(app.id, 'REJECTED'); }}>رفض</button>
                        </div>
                      ) : app.status === 'ACCEPTED' ? (
                        <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>ID: {app.universityNumber}</span>
                      ) : (
                        <span style={{ color: 'var(--ivory3)', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ivory3)' }}>لا توجد طلبات تقديم متاحة.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REGISTRAR' && (
        <div className="menu-card stagger-3" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--ivory)' }}>المسجل العام (إصدار الشهادات)</h3>
          <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                <th style={{ padding: '1rem' }}>الطالب</th>
                <th style={{ padding: '1rem' }}>المعدل (GPA)</th>
                <th style={{ padding: '1rem' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {registrarStudents.map((s) => (
                <tr key={s.student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{s.student.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--teal)', fontWeight: 'bold' }}>{s.gpa.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}><button className="btn-cyan" onClick={() => handleIssueTranscript(s.student.id, s.gpa)}>إصدار وختم الشهادة</button></td>
                </tr>
              ))}
              {registrarStudents.length === 0 && (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ivory3)' }}>لا يوجد طلاب مسجلين.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'VISITORS' && (
        <div className="menu-card stagger-3" style={{ padding: '0' }}>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1.5rem 1rem' }}>الاسم</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الرقم الوطني</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الهاتف</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>{v.name}</td>
                    <td style={{ padding: '1rem' }}>{v.nationalId}</td>
                    <td style={{ padding: '1rem' }}>{v.phone}</td>
                    <td style={{ padding: '1rem' }}><button className="btn-cyan" onClick={() => handleActivateVisitor(v.id)}>تفعيل وتصعيد إلى طالب</button></td>
                  </tr>
                ))}
                {visitors.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ivory3)' }}>لا يوجد زوار حالياً.</td></tr>
                )}
              </tbody>
            </table>
        </div>
      )}

      {activeTab === 'PRIVACY' && (
        <div className="menu-card stagger-3" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>إعدادات الخصوصية والشفافية</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ivory2)' }}>رؤية الرسوم لولي الأمر:</label>
              <select className="auth-input" value={privacySettings.showFeesToParent} onChange={e => setPrivacySettings({...privacySettings, showFeesToParent: e.target.value === 'true'})}>
                <option value="true">متاحة (تظهر للطرفين)</option>
                <option value="false">خاصة (تظهر للطالب فقط)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ivory2)' }}>طريقة النشر الجامعي:</label>
              <select className="auth-input" value={privacySettings.publicationMode} onChange={(e) => setPrivacySettings({...privacySettings, publicationMode: e.target.value})}>
                <option value="HYBRID">هجين</option>
                <option value="PUBLIC">عام</option>
                <option value="PRIVATE">خاص</option>
              </select>
            </div>
            <button className="btn-cyan" style={{ marginTop: '1rem' }} onClick={handleSaveSettings}>حفظ التعديلات</button>
          </div>
        </div>
      )}

      {activeTab === 'FEEDBACK' && (
        <div className="stagger-3">
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '2rem' }}>
            <div className="menu-card gold-glow" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--ivory3)' }}>تذاكر جديدة</h3>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--gold)', textShadow: '0 0 20px var(--gold-glow)' }}>
                {feedbacks.filter(f => f.status === 'NEW').length}
              </div>
            </div>
            <div className="menu-card teal-glow" style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--ivory3)' }}>قيد المراجعة</h3>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--teal)', textShadow: '0 0 20px var(--teal-glow)' }}>
                {feedbacks.filter(f => f.status === 'REVIEW').length}
              </div>
            </div>
          </div>

          <div className="menu-card" style={{ padding: '0' }}>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--ivory3)' }}>
                  <th style={{ padding: '1.5rem 1rem' }}>المرسل</th>
                  <th style={{ padding: '1.5rem 1rem' }}>النوع</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الموضوع</th>
                  <th style={{ padding: '1.5rem 1rem' }}>تاريخ الإرسال</th>
                  <th style={{ padding: '1.5rem 1rem' }}>الحالة</th>
                  <th style={{ padding: '1.5rem 1rem' }}>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{f.sender?.name || 'مستخدم'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ivory3)' }}>{f.sender?.role === 'STUDENT' ? 'طالب' : f.sender?.role === 'GUARDIAN' ? 'ولي أمر' : 'عضو'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{f.type === 'COMPLAINT' ? 'شكوى' : f.type === 'SUGGESTION' ? 'اقتراح' : 'استفسار'}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{f.subject || (f.type === 'COMPLAINT' ? 'شكوى بخصوص الخدمات' : f.type === 'SUGGESTION' ? 'اقتراح تطوير' : 'استفسار عام')}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--ivory2)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.message}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--ivory3)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${f.status === 'NEW' ? 'badge-red' : f.status === 'REVIEW' ? 'badge-gold' : 'badge-teal'}`}>
                        {f.status === 'NEW' ? 'جديد' : f.status === 'REVIEW' ? 'قيد المراجعة' : 'تم الحل'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        className="auth-input" 
                        style={{ padding: '0.5rem', width: '130px' }}
                        value={f.status}
                        onChange={(e) => handleUpdateFeedbackStatus(f.id, e.target.value)}
                      >
                        <option value="NEW">جديد</option>
                        <option value="REVIEW">مراجعة</option>
                        <option value="RESOLVED">حل</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ivory3)' }}>
                      لا توجد تذاكر حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--teal)', marginBottom: '1.5rem', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={64} color="var(--teal)" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{university.name}</h2>
            <div className="badge badge-teal" style={{ marginBottom: '1.5rem' }}>حساب مؤسسي</div>
          </div>

          <div className="menu-card">
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--ivory)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>البيانات المؤسسية</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>اسم المؤسسة التعليمية</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{university.name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الموقع الجغرافي</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{university.location}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>الاعتماد</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 'bold' }}>معتمدة من وزارة التعليم العالي</div>
              </div>
            </div>

            <h3 style={{ margin: '3rem 0 2rem 0', color: 'var(--ivory)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>بيانات مدير النظام (الآدمن)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>اسم مدير النظام</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--ivory3)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>البريد الإلكتروني للإدارة</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--ivory)', fontWeight: 'bold' }}>{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedStudent(null)}>
          <div className="menu-card stagger-1" style={{ width: '100%', maxWidth: '600px', background: 'var(--card)', position: 'relative', overflowY: 'auto', maxHeight: '90vh', border: '1px solid var(--glass-border-teal)' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', color: 'var(--ivory3)', cursor: 'pointer', fontSize: '2rem', lineHeight: 0 }} onClick={() => setSelectedStudent(null)}>&times;</button>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem' }}>
              <img src={selectedStudent.student.profilePhoto || 'https://via.placeholder.com/100'} alt="profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--teal)' }} />
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)', fontSize: '1.8rem' }}>{selectedStudent.student.name}</h2>
                <div style={{ color: 'var(--teal)', fontWeight: 'bold', marginBottom: '0.8rem', fontSize: '1.1rem' }}>{selectedStudent.major.name}</div>
                <div className={`badge ${selectedStudent.status === 'PAID' ? 'badge-teal' : selectedStudent.status === 'ACCEPTED' ? 'badge-gold' : 'badge-red'}`}>
                  {selectedStudent.status === 'PAID' ? 'رسوم مدفوعة' : selectedStudent.status === 'PENDING' ? 'في الانتظار' : selectedStudent.status === 'ACCEPTED' ? 'تم القبول' : 'مرفوض'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--ivory2)', fontSize: '1.2rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--glass-border-gold)', paddingBottom: '0.5rem' }}>البيانات الشخصية</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--ivory3)', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الرقم الوطني:</span> <strong style={{ color: 'var(--ivory)' }}>{selectedStudent.student.nationalId}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الجنس:</span> <strong style={{ color: 'var(--ivory)' }}>{selectedStudent.student.gender === 'MALE' ? 'ذكر' : 'أنثى'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>تاريخ التسجيل:</span> <strong style={{ color: 'var(--ivory)' }}>{new Date(selectedStudent.student.createdAt).toLocaleDateString()}</strong></div>
                </div>
              </div>
              
              <div>
                <h3 style={{ color: 'var(--ivory2)', fontSize: '1.2rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--glass-border-teal)', paddingBottom: '0.5rem' }}>معلومات التواصل</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--ivory3)', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>الهاتف:</span> <strong style={{ color: 'var(--ivory)' }}>{selectedStudent.student.phone}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>البريد:</span> <strong style={{ color: 'var(--ivory)', wordBreak: 'break-all', textAlign: 'left' }}>{selectedStudent.student.email}</strong></div>
                </div>
              </div>
            </div>

            {selectedStudent.status === 'PAID' && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-cyan" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} onClick={() => { handleUpdateAdmissionStatus(selectedStudent.id, 'ACCEPTED'); setSelectedStudent(null); }}>قبول الطالب</button>
                <button className="btn-ghost" style={{ padding: '0.8rem 2rem', fontSize: '1rem', color: 'var(--red)', borderColor: 'var(--red-glow)' }} onClick={() => { handleUpdateAdmissionStatus(selectedStudent.id, 'REJECTED'); setSelectedStudent(null); }}>رفض الطالب</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
