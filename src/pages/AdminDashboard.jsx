import React, { useState, useEffect } from 'react';
import { Users, Building, Activity, DollarSign, LogOut } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({
    students: 0,
    universities: 0,
    enrollments: 0,
    totalVolume: 0,
    platformCommission: 0
  });
  const [demoUsers, setDemoUsers] = useState({ studentId: '', guardianId: '', universityId: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('riyada_user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${API_URL}/analytics/platform`);
        setMetrics(res.data);

        const demoRes = await axios.get(`${API_URL}/auth/demo-users`);
        setDemoUsers(demoRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchMetrics();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '1100px', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Riyadah Platform Control
          </div>
          <h1 className="header-title" style={{ margin: 0, fontSize: '2.2rem' }}>لوحة تحكم المنصة</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { localStorage.removeItem('riyada_user'); localStorage.removeItem('riyada_token'); navigate('/'); }} className="btn-cyan" style={{ background: 'transparent', color: 'var(--red)', border: '1px solid rgba(232,89,60,0.3)' }}>
            <LogOut size={18} /> خروج
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="menu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--ivory3)', fontSize: '0.9rem', fontWeight: 700 }}>إجمالي الطلاب</span>
            <Users size={20} color="var(--gold)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1 }}>
            {metrics.students.toLocaleString()}
          </div>
          <div style={{ color: 'var(--teal)', fontSize: '0.8rem', marginTop: '0.5rem' }}>+12% هذا الشهر</div>
        </div>

        <div className="menu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--ivory3)', fontSize: '0.9rem', fontWeight: 700 }}>المؤسسات التعليمية</span>
            <Building size={20} color="var(--teal)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1 }}>
            {metrics.universities.toLocaleString()}
          </div>
          <div style={{ color: 'var(--teal)', fontSize: '0.8rem', marginTop: '0.5rem' }}>مؤسسات نشطة</div>
        </div>

        <div className="menu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--ivory3)', fontSize: '0.9rem', fontWeight: 700 }}>إجمالي المدفوعات</span>
            <Activity size={20} color="var(--red)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--ivory)', lineHeight: 1 }}>
            {metrics.totalVolume.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--ivory3)' }}>SDG</span>
          </div>
          <div style={{ color: 'var(--ivory3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>مدفوعات الرسوم المكتملة</div>
        </div>

        <div className="menu-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--night)', fontSize: '0.9rem', fontWeight: 800 }}>إيرادات المنصة (2%)</span>
            <DollarSign size={20} color="var(--night)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--night)', lineHeight: 1 }}>
            {metrics.platformCommission.toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.8 }}>SDG</span>
          </div>
          <div style={{ color: 'var(--night)', fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>صافي عمولة ريادة</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="menu-card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem' }}>المؤسسات المضافة مؤخراً</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--card2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 212, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                    🏛️
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ivory)' }}>جامعة السودان للعلوم والتكنولوجيا</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ivory3)' }}>الخرطوم، السودان</div>
                  </div>
                </div>
                <div className="badge badge-teal">نشط</div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem' }}>روابط الوصول السريع (Demo)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              onClick={() => navigate(`/student?impersonate=${demoUsers.studentId}`)}
              className="btn-cyan" style={{ width: '100%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--teal)', border: '1px solid var(--glass-border)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <span>بوابة الطالب</span> <span>👨‍🎓</span>
            </button>
            <button 
              onClick={() => navigate(`/guardian?impersonate=${demoUsers.guardianId}`)}
              className="btn-cyan" style={{ width: '100%', background: 'rgba(201, 149, 42, 0.1)', color: 'var(--gold)', border: '1px solid var(--glass-border)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <span>بوابة أولياء الأمور</span> <span>👨‍👩‍👦</span>
            </button>
            <button 
              onClick={() => navigate(`/university?impersonate=${demoUsers.universityId}`)}
              className="btn-cyan" style={{ width: '100%', background: 'rgba(232, 89, 60, 0.1)', color: 'var(--red)', border: '1px solid var(--glass-border)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <span>بوابة الجامعة</span> <span>🏛️</span>
            </button>
            <button 
              onClick={() => navigate(`/teacher`)}
              className="btn-cyan" style={{ width: '100%', background: 'rgba(128, 0, 128, 0.1)', color: '#d946ef', border: '1px solid var(--glass-border)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <span>بوابة المعلمين</span> <span>👨‍🏫</span>
            </button>
            <button 
              onClick={() => navigate(`/visitor`)}
              className="btn-cyan" style={{ width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid var(--glass-border)', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <span>بوابة الزوار والقبول</span> <span>🌍</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
