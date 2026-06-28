import React, { useState, useEffect } from 'react';
import { Compass, FileText, User, Search, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function VisitorDashboard() {
  const [user, setUser] = useState(null);
  const [allUniversities, setAllUniversities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [activeTab, setActiveTab] = useState('DISCOVER'); // DISCOVER, APPLY, RESULTS, PROFILE
  const [appType, setAppType] = useState('BACHELOR'); // BACHELOR, DIPLOMA, GRADUATE
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
        const uniRes = await axios.get(`${API_URL}/university`);
        setAllUniversities(uniRes.data);

        const appRes = await axios.get(`${API_URL}/application/student/${parsedUser.id}`);
        setApplications(appRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

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

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '2rem' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.85rem', letterSpacing: '0.2em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>
            بوابة الزوار والقبول
          </div>
          <h1 className="header-title" style={{ margin: 0 }}>مرحباً، {user.name}</h1>
          <p style={{ color: 'var(--ivory3)', marginTop: '0.5rem' }}>اكتشف مستقبلك الأكاديمي وقدم طلباتك بسهولة</p>
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
        {['DISCOVER', 'APPLY', 'RESULTS', 'PROFILE'].map(tab => (
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
              {tab === 'DISCOVER' && <Compass size={18} />}
              {tab === 'APPLY' && <FileText size={18} />}
              {tab === 'RESULTS' && <User size={18} />}
              {tab === 'PROFILE' && <User size={18} />}
              {tab === 'DISCOVER' ? 'اكتشف الجامعات' : tab === 'APPLY' ? 'التقديم والمتابعة' : tab === 'RESULTS' ? 'نتائج القبول (منصة النشر)' : 'الملف الشخصي'}
            </button>
        ))}
      </div>

      {activeTab === 'DISCOVER' && (
        <div className="stagger-3">
          <h2 style={{ color: 'var(--ivory)', marginBottom: '1.5rem' }}>الجامعات الشريكة في المنصة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {allUniversities.map(uni => (
              <div key={uni.id} className="menu-card teal-glow" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Search size={40} color="var(--teal)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{uni.name}</h3>
                <div style={{ color: 'var(--ivory3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <MapPin size={16} /> {uni.location}
                </div>
                <button className="btn-cyan" style={{ width: '100%' }} onClick={() => { setSelectedUni(uni.id.toString()); setActiveTab('APPLY'); }}>
                  تقديم طلب للجامعة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'APPLY' && (
        <div className="stagger-3">
          <div className="menu-card gold-glow" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--ivory)' }}>تقديم طلب قبول جديد</h3>
              <div style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '12px' }}>
                <button 
                  onClick={() => setAppType('BACHELOR')}
                  style={{ background: appType === 'BACHELOR' ? 'var(--teal)' : 'transparent', color: appType === 'BACHELOR' ? 'black' : 'var(--ivory)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  بكالوريوس
                </button>
                <button 
                  onClick={() => setAppType('DIPLOMA')}
                  style={{ background: appType === 'DIPLOMA' ? 'var(--gold)' : 'transparent', color: appType === 'DIPLOMA' ? 'black' : 'var(--ivory)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  دبلوم
                </button>
                <button 
                  onClick={() => setAppType('GRADUATE')}
                  style={{ background: appType === 'GRADUATE' ? 'var(--night)' : 'transparent', color: appType === 'GRADUATE' ? 'var(--gold)' : 'var(--ivory)', border: '1px solid var(--gold)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  دراسات عليا
                </button>
              </div>
            </div>
            
            {appType === 'GRADUATE' && (
              <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid var(--gold)', color: 'var(--gold)' }}>
                <strong>تنبيه الدراسات العليا:</strong> سيتم تخصيص مشرف أكاديمي ولجنة مناقشة لطلبك بعد القبول المبدئي. يرجى توفر خطة البحث.
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end', background: 'var(--night)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الجامعة</label>
                <select className="auth-input" value={selectedUni} onChange={e => { setSelectedUni(e.target.value); setSelectedMajor(''); }}>
                  <option value="">-- اختر الجامعة --</option>
                  {allUniversities.map(u => (
                    <option key={u.id} value={u.id}>{u.name} - {u.location}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>التخصص</label>
                <select className="auth-input" value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)}>
                  <option value="">-- اختر التخصص --</option>
                  {selectedUni && allUniversities.find(u => u.id === parseInt(selectedUni))?.majors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} - {m.tuitionFee.toLocaleString()} SDG</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الصورة الشخصية</label>
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
                    if (!selectedUni) return alert('الرجاء اختيار الجامعة');
                    if (!selectedMajor) return alert('الرجاء اختيار التخصص');
                    if (!user.profilePhoto && !profilePhoto) return alert('الصورة الشخصية مطلوبة للقبول');

                    try {
                      await axios.post(`${API_URL}/application/apply`, {
                        studentId: user.id,
                        majorId: selectedMajor,
                        universityId: selectedUni,
                        profilePhoto: profilePhoto || user.profilePhoto,
                        degreeType: appType
                      });
                      alert('تم إرسال طلب التقديم بنجاح!');
                      setSelectedUni('');
                      setSelectedMajor('');
                      setProfilePhoto('');
                      const aRes = await axios.get(`${API_URL}/application/student/${user.id}`);
                      setApplications(aRes.data);
                      
                      if (profilePhoto) {
                        const updatedUser = { ...user, profilePhoto };
                        setUser(updatedUser);
                        localStorage.setItem('riyada_user', JSON.stringify(updatedUser));
                      }
                    } catch (e) {
                      alert('حدث خطأ أثناء التقديم');
                    }
                  }}
                >
                  تأكيد وإرسال الطلب
                </button>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--ivory)' }}>طلباتي السابقة</h3>
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
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>لا توجد طلبات تقديم حالياً</td></tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{app.university.name}</td>
                      <td style={{ padding: '1rem' }}>{app.major.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--ivory3)' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${app.status === 'PAID' ? 'badge-teal' : app.status === 'ACCEPTED' ? 'badge-gold' : 'badge-red'}`}>
                          {app.status === 'PAID' ? 'قيد المراجعة' : app.status === 'PENDING' ? 'في الانتظار' : app.status === 'ACCEPTED' ? 'تم القبول (سجل الدخول كطالب)' : 'مرفوض'}
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

      {activeTab === 'RESULTS' && (
        <div className="stagger-3">
          <div className="menu-card teal-glow">
            <h2 style={{ color: 'var(--ivory)', marginBottom: '0.5rem' }}>منصة النشر الموحدة للنتائج</h2>
            <p style={{ color: 'var(--ivory3)', marginBottom: '2rem' }}>يتم عرض النتائج هنا بناءً على سياسة النشر الخاصة بكل جامعة (عام، خاص، هجين).</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--gold)' }}>جامعة الخرطوم - كلية الطب</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ivory3)' }}>نشر هجين (Hybrid) - يتم عرض أرقام الجلوس للمقبولين فقط حفاظاً على الخصوصية.</div>
                </div>
                <button className="btn-ghost" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>عرض الكشوفات (120 مقبول)</button>
              </div>
              
              <div style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--teal)' }}>جامعة السودان للعلوم والتكنولوجيا</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ivory3)' }}>نشر خاص (Private) - لا تظهر النتائج هنا. يجب تسجيل الدخول لمعرفة النتيجة الفردية.</div>
                </div>
                <div className="badge badge-teal">محجوب للخصوصية</div>
              </div>
              
              <div style={{ background: 'var(--night)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>جامعة المستقبل</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ivory3)' }}>نشر عام (Public) - تظهر أسماء المقبولين بالكامل (حسب سياسة الجامعة).</div>
                </div>
                <button className="btn-cyan">استعراض قائمة المقبولين</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="menu-card" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--gold)', marginBottom: '1.5rem', background: 'var(--night)' }}>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={64} color="var(--ivory3)" style={{ marginTop: '25px' }} />
              )}
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)' }}>{user.name}</h2>
            <div className="badge badge-teal" style={{ marginBottom: '1.5rem' }}>حساب زائر</div>
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
