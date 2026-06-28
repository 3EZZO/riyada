import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT', studentNationalId: '' });
  const [error, setError] = useState('');
  const [universities, setUniversities] = useState([]);
  const navigate = useNavigate();



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('riyada_token', res.data.token);
        localStorage.setItem('riyada_user', JSON.stringify(res.data.user));
        
        if (res.data.user.role === 'UNIVERSITY') {
          navigate('/university');
        } else if (res.data.user.role === 'PARENT') {
          navigate('/guardian');
        } else if (res.data.user.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (res.data.user.role === 'VISITOR') {
          navigate('/visitor');
        } else if (res.data.user.role === 'LECTURER') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } else {
        await axios.post(`${API_URL}/auth/register`, formData);
        // Automatically login after successful registration
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('riyada_token', res.data.token);
        localStorage.setItem('riyada_user', JSON.stringify(res.data.user));
        
        if (formData.role === 'UNIVERSITY') {
          navigate('/university');
        } else if (formData.role === 'PARENT') {
          navigate('/guardian');
        } else if (formData.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (formData.role === 'VISITOR') {
          navigate('/visitor'); // Now goes to their dedicated dashboard
        } else if (formData.role === 'LECTURER') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="menu-card stagger-1 gold-glow" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Riyada Logo" style={{ height: '50px', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--gold)' }}>
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid var(--red-glow)', color: 'var(--red)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>الاسم الكامل</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="أدخل اسمك الكامل" 
                  className="auth-input"
                  style={{ paddingRight: '2.5rem' }}
                  required={!isLogin} 
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="example@email.com" 
                className="auth-input"
                style={{ paddingRight: '2.5rem' }}
                required 
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>رقم الهاتف</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>📱</span>
                  <input 
                    type="tel" name="phone" value={formData.phone || ''} onChange={handleChange}
                    placeholder="0912345678" 
                    className="auth-input"
                    style={{ paddingRight: '2.5rem' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>الرقم الوطني</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>🪪</span>
                  <input 
                    type="text" name="nationalId" value={formData.nationalId || ''} onChange={handleChange}
                    placeholder="1234567890" 
                    className="auth-input"
                    style={{ paddingRight: '2.5rem' }}
                    required 
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••" 
                className="auth-input"
                style={{ paddingRight: '2.5rem' }}
                required 
              />
            </div>
          </div>

          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>نوع الحساب</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <select name="role" value={formData.role} onChange={handleChange} className="auth-input" style={{ paddingRight: '2.5rem' }}>
                  <option value="STUDENT" style={{color: 'black'}}>طالب</option>
                  <option value="VISITOR" style={{color: 'black'}}>زائر (طالب محتمل)</option>
                  <option value="PARENT" style={{color: 'black'}}>ولي أمر</option>
                  <option value="LECTURER" style={{color: 'black'}}>المعلم / الأكاديمي</option>
                  <option value="UNIVERSITY" style={{color: 'black'}}>مؤسسة تعليمية</option>
                  <option value="ADMIN" style={{color: 'black'}}>إدارة المنصة (رؤساء ريادة)</option>
                </select>
              </div>
            </div>
          )}



          {!isLogin && formData.role === 'PARENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>الرقم الوطني للطالب (الابن/الابنة)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>🎓</span>
                <input 
                  type="text" name="studentNationalId" value={formData.studentNationalId || ''} onChange={handleChange}
                  placeholder="أدخل الرقم الوطني للطالب" 
                  className="auth-input"
                  style={{ paddingRight: '2.5rem' }}
                  required 
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-cyan" style={{ marginTop: '1rem', width: '100%' }}>
            {isLogin ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--ivory3)' }}>
          {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--teal)', cursor: 'pointer', fontWeight: 600, textShadow: '0 0 10px var(--teal-glow)' }}
          >
            {isLogin ? 'سجل الآن' : 'تسجيل الدخول'}
          </span>
        </div>
      </div>
    </div>
  );
}
