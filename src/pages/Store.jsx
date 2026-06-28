import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, ShoppingCart, X, Plus, Minus, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getDashboardRoute } from '../utils/navigation';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

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
        const prodRes = await axios.get(`${API_URL}/store/products`);
        setProducts(prodRes.data);

        const walletRes = await axios.get(`${API_URL}/payment/wallet/${parsedUser.id}`);
        setWallet(walletRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setPurchaseSuccess(false);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!wallet || wallet.balance < cartTotal) {
      alert('عذراً، رصيدك غير كافٍ. يرجى شحن محفظتك أولاً.');
      return;
    }
    
    setLoading(true);
    try {
      // Create a single concatenated item string for the transaction log
      const itemNames = cart.map(c => `${c.quantity}x ${c.name}`).join(', ');
      
      const res = await axios.post(`${API_URL}/payment/purchase`, {
        userId: user.id,
        amount: cartTotal,
        item: `شراء من المتجر: ${itemNames}`
      });
      setWallet(res.data);
      setCart([]);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (err) {
      alert('حدث خطأ أثناء إتمام عملية الشراء.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: '1200px', paddingTop: '2rem', position: 'relative' }}>
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="header-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShoppingBag size={32} color="var(--gold)" style={{ filter: 'drop-shadow(0 0 10px var(--gold-glow))' }} /> المتجر الإلكتروني
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {wallet ? (
            <div className="menu-card gold-glow" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--ivory3)' }}>رصيد المحفظة</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)', textShadow: '0 0 15px var(--gold-glow)' }}>
                {wallet.balance.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>SDG</span>
              </div>
            </div>
          ) : (
            <div className="skeleton" style={{ width: '200px', height: '60px' }}></div>
          )}
          
          <button onClick={() => setIsCartOpen(true)} className="btn-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
            <ShoppingCart size={20} />
            سلة المشتريات
            {cartItemsCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--red)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartItemsCount}
              </span>
            )}
          </button>

          <button onClick={() => navigate(getDashboardRoute(user))} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> العودة
          </button>
        </div>
      </div>

      <div className="card-grid stagger-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {products.map(product => (
          <div key={product.id} className="menu-card teal-glow" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--card)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--ivory)' }}>{product.name}</h3>
              <p style={{ color: 'var(--ivory3)', margin: '0 0 1.5rem 0', flex: 1, fontSize: '0.95rem', lineHeight: '1.5' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--teal)', textShadow: '0 0 10px var(--teal-glow)' }}>
                  {product.price.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--ivory3)', textShadow: 'none' }}>SDG</span>
                </span>
                <button 
                  onClick={() => addToCart(product)}
                  className="btn-ghost" 
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--teal)', color: 'var(--teal)' }}
                >
                  <Plus size={16} /> أضف للسلة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping Cart Sidebar Overlay */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, backdropFilter: 'blur(3px)' }} onClick={() => setIsCartOpen(false)}>
          <div 
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '100%', maxWidth: '400px', background: 'var(--night)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', boxShadow: '5px 0 30px rgba(0,0,0,0.5)', animation: 'slideInLeft 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--ivory)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <ShoppingCart color="var(--gold)" />
                سلة المشتريات
              </h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ivory3)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              {purchaseSuccess ? (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <CheckCircle size={64} color="var(--teal)" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: 'var(--ivory)' }}>تم الشراء بنجاح!</h3>
                  <p style={{ color: 'var(--ivory3)' }}>تم خصم المبلغ من محفظتك بنجاح.</p>
                </div>
              ) : cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--ivory3)', marginTop: '3rem' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                  <p>السلة فارغة حالياً</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--ivory)', fontSize: '1rem' }}>{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
                        </div>
                        <div style={{ color: 'var(--teal)', fontWeight: 'bold', marginBottom: '0.8rem' }}>{item.price.toLocaleString()} SDG</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ background: 'var(--card2)', border: '1px solid var(--glass-border)', color: 'var(--ivory)', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                          <span style={{ color: 'var(--ivory)', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ background: 'var(--card2)', border: '1px solid var(--glass-border)', color: 'var(--ivory)', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!purchaseSuccess && cart.length > 0 && (
              <div style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', background: 'var(--card2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--ivory3)' }}>
                  <span>المجموع الفرعي</span>
                  <span>{cartTotal.toLocaleString()} SDG</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--ivory)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>الإجمالي</span>
                  <span style={{ color: 'var(--gold)' }}>{cartTotal.toLocaleString()} SDG</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-cyan" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'جاري التنفيذ...' : 'تأكيد الشراء (دفع من المحفظة)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
