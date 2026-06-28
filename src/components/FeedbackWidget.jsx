import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('suggestion'); // suggestion, complaint, comment
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      const userStr = localStorage.getItem('riyada_user');
      const user = userStr ? JSON.parse(userStr) : null;
      // We assume user is logged in, use their ID and target university
      // If visitor, they might not have it. Let's fallback to uni id 1 for demo if none
      const universityId = user?.targetUniversityId || user?.managedUniv?.id || 1;
      const senderId = user?.id || 1;

      const API_URL = import.meta.env.VITE_API_URL || '/api';
      await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityId,
          senderId,
          type: type.toUpperCase(),
          message
        })
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--gold)',
          color: 'var(--night)',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(201, 149, 42, 0.4)',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'scale(0)' : 'scale(1)'
        }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Widget Panel */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          background: 'var(--card2)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          overflow: 'hidden'
        }}
      >
        <div style={{ background: 'var(--night)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ivory)' }}>مركز المقترحات والشكاوى</h3>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--ivory3)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Send size={30} color="var(--teal)" />
              </div>
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.5rem' }}>تم الإرسال بنجاح!</h3>
              <p style={{ color: 'var(--ivory3)', fontSize: '0.9rem' }}>تم تحويل طلبك للقسم المختص (الحالة: جديد)</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--ivory2)' }}>نوع الرسالة</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setType('suggestion')} className={`badge ${type === 'suggestion' ? 'badge-gold' : ''}`} style={{ flex: 1, border: '1px solid var(--glass-border)', background: type === 'suggestion' ? 'var(--gold)' : 'transparent', color: type === 'suggestion' ? 'black' : 'var(--ivory3)' }}>مقترح</button>
                  <button type="button" onClick={() => setType('complaint')} className={`badge ${type === 'complaint' ? 'badge-red' : ''}`} style={{ flex: 1, border: '1px solid var(--glass-border)', background: type === 'complaint' ? 'rgba(232,89,60,0.2)' : 'transparent', color: type === 'complaint' ? 'var(--red)' : 'var(--ivory3)' }}>شكوى</button>
                  <button type="button" onClick={() => setType('comment')} className={`badge ${type === 'comment' ? 'badge-teal' : ''}`} style={{ flex: 1, border: '1px solid var(--glass-border)', background: type === 'comment' ? 'rgba(0,212,170,0.2)' : 'transparent', color: type === 'comment' ? 'var(--teal)' : 'var(--ivory3)' }}>استفسار</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--ivory2)' }}>التفاصيل</label>
                <textarea 
                  className="auth-input" 
                  rows="4" 
                  placeholder="اكتب رسالتك هنا..." 
                  style={{ width: '100%', resize: 'none', padding: '0.8rem' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-cyan" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <Send size={16} /> إرسال للجهة المعنية
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
