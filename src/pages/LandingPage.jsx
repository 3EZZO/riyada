import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const [currentScreen, setCurrentScreen] = useState(0);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', org: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR

  useEffect(() => {
    // ── PARTICLE HERO ──
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    let reqId;

    function resize(){
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor(){this.reset()}
      reset(){
        this.x = Math.random()*W;
        this.y = Math.random()*H;
        this.vx = (Math.random()-0.5)*0.4;
        this.vy = (Math.random()-0.5)*0.4;
        this.r = Math.random()*1.5+0.3;
        this.gold = Math.random() > 0.85;
        this.teal = !this.gold && Math.random() > 0.85;
        this.life = Math.random();
        this.maxLife = 0.4+Math.random()*0.6;
      }
      update(){
        this.x += this.vx; this.y += this.vy;
        this.life += 0.003;
        if(this.life > this.maxLife || this.x<0||this.x>W||this.y<0||this.y>H) this.reset();
      }
      draw(){
        const alpha = Math.sin((this.life/this.maxLife)*Math.PI)*0.7;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle = this.gold ? `rgba(201,149,42,${alpha})` : this.teal ? `rgba(0,212,170,${alpha})` : `rgba(245,240,232,${alpha*0.3})`;
        ctx.fill();
      }
    }

    for(let i=0;i<180;i++) particles.push(new Particle());

    function animParticles(){
      ctx.clearRect(0,0,W,H);
      particles.forEach(p=>{p.update();p.draw()});
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if(d<80){
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=`rgba(201,149,42,${0.08*(1-d/80)})`;
            ctx.lineWidth=0.5;
            ctx.stroke();
          }
        }
      }
      reqId = requestAnimationFrame(animParticles);
    }
    animParticles();

    // ── HERO COUNTERS ──
    function countUp(el, target, suffix, duration=2000){
      let start = null;
      function step(ts){
        if(!start) start=ts;
        const prog = Math.min((ts-start)/duration, 1);
        const ease = 1-Math.pow(1-prog, 3);
        const val = Math.floor(ease*target);
        if (el) {
          el.textContent = suffix==='M' ? `$${(ease*target).toFixed(1)}M` : val+(suffix||'');
        }
        if(prog<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    setTimeout(()=>{
      countUp(document.getElementById('h-stat1'), 70, '+');
      countUp(document.getElementById('h-stat2'), 500, 'K');
      countUp(document.getElementById('h-stat3'), 6, '');
      countUp(document.getElementById('h-stat4'), 2.5, 'M', 2400);
    }, 1400);

    // ── SCROLL REVEAL + COUNTER ──
    const revealEls = document.querySelectorAll('.reveal');
    const metricEls = document.querySelectorAll('[data-target]');
    let metricsTriggered = false;

    function countUp2(el, target, pre='', post='', dur=1800){
      let start=null;
      function step(ts){
        if(!start) start=ts;
        const prog = Math.min((ts-start)/dur,1);
        const ease = 1-Math.pow(1-prog,3);
        el.textContent = pre+Math.floor(ease*target)+post;
        if(prog<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          if(e.target.closest('.metrics-band') && !metricsTriggered){
            metricsTriggered=true;
            metricEls.forEach(el=>{
              const t = parseInt(el.dataset.target);
              const suffix = el.classList.contains('ivory') ? '%' : '';
              const prefix = el.classList.contains('red') ? '$' : '';
              const postfix = el.classList.contains('red') ? 'M' : (el.classList.contains('teal')?'K':'');
              if(t===0){el.textContent='~0%'; return;}
              countUp2(el, t, prefix, postfix);
            });
          }
        }
      });
    },{threshold:0.15});
    revealEls.forEach(el=>obs.observe(el));

    // ── SUDAN MAP ──
    const mc = mapCanvasRef.current;
    if (!mc) return;
    const mx = mc.getContext('2d');
    mc.width=440; mc.height=500;
    
    const sudanPoly = [
      [0.160, 1.000],[0.113, 0.968],[0.092, 0.947],[0.089, 0.925],[0.098, 0.895],[0.098, 0.865],[0.063, 0.820],[0.056, 0.789],[0.057, 0.771],[0.035, 0.750],[0.034, 0.708],[0.021, 0.680],[0.000, 0.684],[0.006, 0.657],[0.022, 0.627],[0.015, 0.597],[0.035, 0.575],[0.022, 0.558],[0.038, 0.513],[0.066, 0.459],[0.118, 0.464],[0.115, 0.176],[0.116, 0.146],[0.186, 0.146],[0.186, 0.001],[0.430, 0.001],[0.665, 0.001],[0.906, 0.001],[0.926, 0.072],[0.913, 0.085],[0.921, 0.160],[0.944, 0.247],[0.967, 0.264],[1.000, 0.291],[0.969, 0.333],[0.925, 0.345],[0.905, 0.367],[0.899, 0.415],[0.873, 0.522],[0.880, 0.551],[0.870, 0.613],[0.845, 0.685],[0.809, 0.721],[0.783, 0.776],[0.777, 0.805],[0.748, 0.826],[0.730, 0.902],[0.731, 0.967],[0.730, 0.910],[0.722, 0.909],[0.723, 0.873],[0.715, 0.848],[0.684, 0.819],[0.677, 0.767],[0.684, 0.714],[0.656, 0.708],[0.652, 0.725],[0.615, 0.728],[0.630, 0.750],[0.635, 0.793],[0.602, 0.833],[0.572, 0.885],[0.540, 0.893],[0.489, 0.850],[0.466, 0.865],[0.460, 0.887],[0.429, 0.900],[0.427, 0.915],[0.366, 0.915],[0.358, 0.900],[0.314, 0.898],[0.292, 0.910],[0.276, 0.904],[0.244, 0.862],[0.234, 0.842],[0.190, 0.852],[0.174, 0.885],[0.158, 0.950],[0.137, 0.964],[0.118, 0.972],[0.160, 1.000]
    ];
    const unis = [
      {x:0.56,y:0.36,name:"Khartoum",size:8,type:'major'},
      {x:0.52,y:0.38,name:"Omdurman Islamic",size:7,type:'major'},
      {x:0.58,y:0.34,name:"U of K",size:6,type:'major'},
      {x:0.30,y:0.32,name:"Darfur",size:6,type:'regional'},
      {x:0.22,y:0.50,name:"S. Darfur",size:5,type:'regional'},
      {x:0.44,y:0.54,name:"Kordofan",size:5,type:'regional'},
      {x:0.60,y:0.60,name:"Blue Nile",size:5,type:'regional'},
      {x:0.50,y:0.70,name:"Sennar",size:4,type:'regional'},
      {x:0.38,y:0.72,name:"S. Kordofan",size:4,type:'regional'},
      {x:0.48,y:0.15,name:"Dongola",size:5,type:'priority'},
      {x:0.55,y:0.20,name:"Atbara",size:5,type:'priority'},
      {x:0.82,y:0.25,name:"Port Sudan",size:6,type:'priority'},
      {x:0.75,y:0.45,name:"Gedaref",size:5,type:'priority'},
      {x:0.70,y:0.28,name:"Kassala",size:5,type:'priority'}
    ];
    
    let mapParticles = [];
    let mapFrame=0;
    let mapReqId;

    function drawMap(t=0){
      mx.clearRect(0,0,440,500);
      mx.beginPath();
      sudanPoly.forEach(([nx,ny],i)=>{
        const px=nx*400+20, py=ny*460+20;
        i===0?mx.moveTo(px,py):mx.lineTo(px,py);
      });
      mx.closePath();
      mx.fillStyle='rgba(15,32,64,0.9)';
      mx.fill();
      mx.strokeStyle='rgba(201,149,42,0.4)';
      mx.lineWidth=1;
      mx.stroke();

      mx.beginPath();
      mx.moveTo(0.54*400+20, 0.98*460+20);
      mx.bezierCurveTo(0.54*400+20,0.70*460+20, 0.60*400+20,0.55*460+20, 0.56*400+20,0.36*460+20);
      mx.bezierCurveTo(0.54*400+20,0.20*460+20, 0.50*400+20,0.12*460+20, 0.48*400+20,0.02*460+20);
      mx.strokeStyle='rgba(0,212,170,0.25)';
      mx.lineWidth=2;
      mx.setLineDash([4,3]);
      mx.stroke();
      mx.setLineDash([]);

      unis.forEach(u=>{
        const px=u.x*400+20, py=u.y*460+20;
        const color = u.type==='major'?'#C9952A':u.type==='priority'?'rgba(232,89,60,0.8)':'#00D4AA';
        const pulse = 0.5+0.5*Math.sin(t*0.05+u.x*10);
        mx.beginPath();
        mx.arc(px,py,u.size+4+pulse*4,0,Math.PI*2);
        
        if(color.startsWith('#')){
          const r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16);
          mx.fillStyle=`rgba(${r},${g},${b},${0.15*pulse})`;
        } else {
          mx.fillStyle = color.replace(')',`, ${0.12*pulse})`).replace('rgb','rgba').replace('rgba(rgba','rgba');
        }
        mx.fill();
        mx.beginPath();
        mx.arc(px,py,u.size*0.6,0,Math.PI*2);
        mx.fillStyle=color;
        mx.fill();
      });

      mapParticles.forEach((p,i)=>{
        p.progress += 0.008;
        if(p.progress >= 1){ mapParticles.splice(i,1); return; }
        const alpha = Math.sin(p.progress*Math.PI)*0.8;
        const x = p.sx + (p.ex-p.sx)*p.progress;
        const y = p.sy + (p.ey-p.sy)*p.progress - Math.sin(p.progress*Math.PI)*30;
        mx.beginPath();
        mx.arc(x*400+20,y*460+20,2,0,Math.PI*2);
        mx.fillStyle=`rgba(201,149,42,${alpha})`;
        mx.fill();
      });
    }

    function mapLoop(){
      drawMap(mapFrame++);
      if(mapFrame % 40 === 0 && mapParticles.length < 20){
        const a = unis[Math.floor(Math.random()*unis.length)];
        const b = unis[Math.floor(Math.random()*unis.length)];
        if(a!==b) mapParticles.push({sx:a.x,sy:a.y,ex:b.x,ey:b.y,progress:0});
      }
      mapReqId = requestAnimationFrame(mapLoop);
    }
    mapLoop();

    const handleMapClick = () => {
      for(let i=0;i<12;i++){
        const target = unis[Math.floor(Math.random()*unis.length)];
        setTimeout(()=>{
          mapParticles.push({sx:0.56,sy:0.36,ex:target.x,ey:target.y,progress:0});
        },i*80);
      }
    };
    mc.addEventListener('click', handleMapClick);

    // Auto-cycle screens
    const screenInterval = setInterval(()=>{ 
      setCurrentScreen(prev => (prev+1)%3); 
    }, 3500);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(reqId);
      cancelAnimationFrame(mapReqId);
      mc.removeEventListener('click', handleMapClick);
      clearInterval(screenInterval);
      obs.disconnect();
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('LOADING');
    try {
      // Simulate network request or post to actual feedback API if backend supports unauthenticated requests
      // Here we simulate success for demo purposes, but in a real scenario we'd use axios.post
      await new Promise(resolve => setTimeout(resolve, 1500));
      setContactStatus('SUCCESS');
      setContactForm({ name: '', email: '', phone: '', org: '', subject: '', message: '' });
      setTimeout(() => setContactStatus('IDLE'), 5000);
    } catch (err) {
      setContactStatus('ERROR');
    }
  };

  // Update the HTML string to use the currentScreen state for classes
  return (
    <div className="landing-wrapper">
      

<div id="topnav">
  <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><img src="/riyadah-logo.png" alt="Riyadah Logo" style={{ height: '32px' }} /></div>
  <nav className="nav-links">
    <a href="#pillars-section">المنصة</a>
    <a href="#map-section">التغطية</a>
    <a href="#product-section">المنتج</a>
    <a href="#revenue-section">الأعمال</a>
    <a href="#vision">الرؤية</a>
  </nav>
  <button className="nav-cta" onClick={() => navigate('/auth')}>ابدأ الآن ↗</button>
</div>

<div id="hero">
  <canvas id="particle-canvas" ref={canvasRef}></canvas>
  <div className="hero-content">
    <div className="hero-eyebrow">المنصة الوطنية للتعليم في السودان</div>
    <div className="hero-ar">ري<span>ا</span>دة</div>
    <div className="hero-en">Riyada &nbsp;·&nbsp; Pioneer</div>
    <div className="hero-line"></div>
    <p className="hero-sub">منصة واحدة. كل الجامعات. كل الطلاب. كل المدفوعات. كل محاضرة — مصممة لخدمة 500,000 طالب.</p>
    <div className="hero-stats">
      <div className="hero-stat">
        <div className="num" id="h-stat1">0</div>
        <div className="lbl">الجامعات</div>
      </div>
      <div className="hero-stat">
        <div className="num" id="h-stat2">0</div>
        <div className="lbl">الطلاب</div>
      </div>
      <div className="hero-stat">
        <div className="num" id="h-stat3">0</div>
        <div className="lbl">الركائز</div>
      </div>
      <div className="hero-stat">
        <div className="num" id="h-stat4">$0M</div>
        <div className="lbl">العائد المستهدف (س1)</div>
      </div>
    </div>
  </div>
  <div className="scroll-hint">
    <span>مرر للاستكشاف</span>
    <div className="scroll-arrow"></div>
  </div>
</div>

<div className="metrics-band reveal">
  <div className="metrics-inner">
    <div className="metric-item">
      <div className="metric-num gold" data-target="70">0</div>
      <div className="metric-label">جامعة في السودان</div>
    </div>
    <div className="metric-item">
      <div className="metric-num teal" data-target="500">0</div>
      <div className="metric-label">ألف طالب</div>
    </div>
    <div className="metric-item">
      <div className="metric-num ivory" data-target="0">0%</div>
      <div className="metric-label">نسبة التحول الرقمي اليوم</div>
    </div>
    <div className="metric-item">
      <div className="metric-num red" data-target="2">$0M</div>
      <div className="metric-label">الحد الأدنى للإيرادات (س1)</div>
    </div>
  </div>
</div>

<div id="pillars-section" style={{"padding":"5rem 2rem","background":"var(--night)","direction":"rtl"}}>
<div className="section" style={{"padding":"0","maxWidth":"1100px","margin":"0 auto"}}>
  <div className="reveal">
    <div className="eyebrow">المنصة</div>
    <h2 className="section-title">ست ركائز.<br /><em>نظام تشغيل واحد.</em></h2>
    <p className="section-body">تستبدل ريادة الأدوات المشتتة، والسجلات الورقية، ومجموعات الواتساب، وطرق الدفع المعقدة بمنصة واحدة متكاملة — مبنية خصيصاً للسودان.</p>
  </div>
  <div className="pillars-grid reveal" style={{ direction: 'ltr' }}>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">01</div>
      <div className="pillar-icon">🎓</div>
      <div className="pillar-name">محرك القبول والتسجيل</div>
      <div className="pillar-desc">نظام تقديم رقمي بالكامل من أول استفسار وحتى التسجيل. بدون ورق. بدون ملفات مفقودة.</div>
      <div className="pillar-detail">← استكشف نظام القبول</div>
    </div>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">02</div>
      <div className="pillar-icon">📋</div>
      <div className="pillar-name">نظام معلومات الطالب</div>
      <div className="pillar-desc">سجل أكاديمي دائم وشامل لكل طالب. المعدل التراكمي، التسجيل، الشهادات — كل شيء في مكان واحد.</div>
      <div className="pillar-detail">← استكشف سجلات الطلاب</div>
    </div>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">03</div>
      <div className="pillar-icon">📚</div>
      <div className="pillar-name">نظام إدارة التعلم</div>
      <div className="pillar-desc">نظام إدارة تعلم متكامل: محاضرات فيديو، واجبات، اختبارات، ومعلم ذكاء اصطناعي — يعمل بدون إنترنت.</div>
      <div className="pillar-detail">← استكشف ميزات النظام</div>
    </div>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">04</div>
      <div className="pillar-icon">💳</div>
      <div className="pillar-name">إدارة الرسوم والمحفظة</div>
      <div className="pillar-desc">كل دفعة مرتبطة بالرقم الجامعي. لوحات تحكم لحظية. بدون كاش. وضوح مالي تام للجامعات.</div>
      <div className="pillar-detail">← استكشف نظام الدفع</div>
    </div>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">05</div>
      <div className="pillar-icon">📡</div>
      <div className="pillar-name">مركز التواصل</div>
      <div className="pillar-desc">إشعارات فورية، إعلانات، رسائل مباشرة، ورسائل نصية قصيرة وواتساب عند الحاجة. تواصل مع كل طالب.</div>
      <div className="pillar-detail">← استكشف قنوات التواصل</div>
    </div>
    <div className="pillar-card" style={{ direction: 'rtl', textAlign: 'right' }} onClick={() => navigate('/auth')}>
      <div className="pillar-num">06</div>
      <div className="pillar-icon">📊</div>
      <div className="pillar-name">التحليلات والذكاء الاصطناعي</div>
      <div className="pillar-desc">تنبيهات للطلاب المتعثرين. بيانات تسجيل وطنية. البيانات التي احتاجها نظام التعليم في السودان دائماً.</div>
      <div className="pillar-detail">← استكشف التحليلات</div>
    </div>
  </div>
</div>
</div>

<div style={{"padding":"5rem 2rem","background":"var(--lapis)","direction":"rtl"}}>
<div style={{"maxWidth":"1100px","margin":"0 auto","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"5rem","alignItems":"start"}} className="reveal">
  <div>
    <div className="eyebrow">تجربة الطالب</div>
    <h2 className="section-title">من متقدم<br />إلى <em>خريج.</em></h2>
    <p className="section-body">ترافق ريادة الطالب في رحلته كاملة — من أول نقرة على التطبيق حتى يوم تنزيل شهادته الرقمية الموثقة.</p>
  </div>
  <div className="journey-wrap" style={{"direction":"ltr"}}>
    <div className="journey-line" style={{"right":"36px","left":"auto"}}></div>
    <div className="journey-steps">
      <div className="j-step" style={{"flexDirection":"row-reverse","textAlign":"right"}}>
        <div className="j-dot" style={{"marginRight":"0","marginLeft":"1.5rem"}}>🔍</div>
        <div className="j-body">
          <div className="j-title">الاستكشاف والتسجيل</div>
          <div className="j-desc">يكتشف الطالب ريادة، يسجل ببريده ورقم هاتفه. حملات التسويق تبدأ تلقائياً.</div>
          <span className="j-tag">متابعة تلقائية</span>
        </div>
      </div>
      <div className="j-step" style={{"flexDirection":"row-reverse","textAlign":"right"}}>
        <div className="j-dot" style={{"marginRight":"0","marginLeft":"1.5rem"}}>📄</div>
        <div className="j-body">
          <div className="j-title">التقديم الرقمي</div>
          <div className="j-desc">يرفع الشهادات والهوية. يختار الجامعة والتخصص. يُرسل الطلب فوراً لمسؤول القبول.</div>
          <span className="j-tag">بدون معاملات ورقية</span>
        </div>
      </div>
      <div className="j-step" style={{"flexDirection":"row-reverse","textAlign":"right"}}>
        <div className="j-dot" style={{"marginRight":"0","marginLeft":"1.5rem"}}>✅</div>
        <div className="j-body">
          <div className="j-title">القبول والتهيئة</div>
          <div className="j-desc">تقبل الجامعة الطالب. يستلم رقمه الجامعي، تُفعل محفظته، وتُفتح مناهج السنة الأولى.</div>
          <span className="j-tag">تفعيل فوري</span>
        </div>
      </div>
      <div className="j-step" style={{"flexDirection":"row-reverse","textAlign":"right"}}>
        <div className="j-dot" style={{"marginRight":"0","marginLeft":"1.5rem"}}>📲</div>
        <div className="j-body">
          <div className="j-title">حياة طلابية نشطة</div>
          <div className="j-desc">يحضر المحاضرات، يسلم الواجبات، يتحدث مع المعلم الذكي، ويدفع الرسوم — كل هذا في تطبيق واحد.</div>
          <span className="j-tag">يعمل بدون إنترنت</span>
        </div>
      </div>
      <div className="j-step" style={{"flexDirection":"row-reverse","textAlign":"right"}}>
        <div className="j-dot" style={{"marginRight":"0","marginLeft":"1.5rem"}}>🏆</div>
        <div className="j-body">
          <div className="j-title">شهادة رقمية موثقة</div>
          <div className="j-desc">يتخرج ويحمل كشف درجات موثق رقمياً. يمكن لأصحاب العمل التحقق منه في ثوانٍ.</div>
          <span className="j-tag">وثيقة غير قابلة للتزوير</span>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

<div id="map-section" style={{direction:"rtl"}}>
  <div className="map-inner reveal">
    <div>
      <div className="eyebrow">الوصول الوطني</div>
      <h2 className="section-title">كل ولاية.<br /><em>كل طالب.</em></h2>
      <p className="section-body" style={{"marginBottom":"1.5rem"}}>18 ولاية في السودان — ستشترك في منصة واحدة. طالب البركل سيحصل على نفس تجربة طالب أم درمان.</p>
      <p className="section-body" style={{"marginBottom":"2rem","fontSize":"14px","color":"var(--ivory3)"}}>اضغط على الخريطة لتشاهد تفاعل الطلاب في أنحاء البلاد.</p>
      <div className="map-legend">
        <div className="map-legend-item"><div className="map-dot" style={{"background":"var(--gold)"}}></div>جامعات كبرى (تجمع الخرطوم)</div>
        <div className="map-legend-item"><div className="map-dot" style={{"background":"var(--teal)"}}></div>جامعات إقليمية (نشطة)</div>
        <div className="map-legend-item"><div className="map-dot" style={{"background":"var(--red)","opacity":"0.7"}}></div>مناطق مستهدفة (توسع ذو أولوية)</div>
      </div>
    </div>
    <canvas id="sudan-map-canvas" ref={mapCanvasRef}></canvas>
  </div>
</div>

<div id="product-section" style={{direction:"rtl"}}>
<div className="product-inner reveal">
  <div>
    <div className="eyebrow">تطبيق الهاتف</div>
    <h2 className="section-title">صُمم للهاتف<br /><em>في يدك.</em></h2>
    <p className="section-body" style={{"marginBottom":"2rem"}}>معظم الطلاب في السودان يستخدمون الإنترنت عبر الهاتف. ريادة مصممة للهواتف، وتدعم اللغة العربية، وتعمل بدون إنترنت.</p>
    <ul className="feat-list">
      <li className="feat-item"><div className="feat-dot"></div><div className="feat-text"><strong>واجهة عربية كاملة</strong> — من اليمين لليسار، في كل شاشة</div></li>
      <li className="feat-item"><div className="feat-dot"></div><div className="feat-text"><strong>وضع عدم الاتصال</strong> — حمل المحاضرات وادرس في أي مكان</div></li>
      <li className="feat-item"><div className="feat-dot"></div><div className="feat-text"><strong>معلم ذكاء اصطناعي بالعربية</strong> — اسأل عن مقرراتك واحصل على مساعدة فورية</div></li>
      <li className="feat-item"><div className="feat-dot"></div><div className="feat-text"><strong>المحفظة والمدفوعات</strong> — اشحن رصيدك، ادفع الرسوم، وشاهد رصيدك لحظياً</div></li>
      <li className="feat-item"><div className="feat-dot"></div><div className="feat-text"><strong>محاضرات حية ومسجلة</strong> — مضغوطة لتناسب الإنترنت الضعيف</div></li>
    </ul>
  </div>
  <div style={{direction:"ltr"}}>
    <div className="phone-frame float-anim">
      <div className="phone-notch"></div>
      <div className="phone-screen">
        
        <div className={`screen-slide ${currentScreen !== 0 ? 'hidden' : ''}`} id="screen-0">
          <div className="screen-topbar">
            <div className="screen-logo">ريادة</div>
            <div className="screen-avatar">AM</div>
          </div>
          <div className="screen-greeting" style={{textAlign:"right"}}>مرحباً،</div>
          <div className="screen-name" style={{textAlign:"right"}}>أحمد محمد 👋</div>
          <div className="screen-card" style={{direction:"rtl"}}>
            <div className="screen-card-label">رصيد المحفظة</div>
            <div className="screen-card-value">SDG 4,200</div>
            <div className="screen-card-sub">الفصل الدراسي الأول · مدفوع ✓</div>
          </div>
          <div className="screen-mini-grid" style={{direction:"rtl"}}>
            <div className="screen-mini">
              <div className="screen-mini-val">3.7</div>
              <div className="screen-mini-lbl">المعدل</div>
            </div>
            <div className="screen-mini">
              <div className="screen-mini-val">92%</div>
              <div className="screen-mini-lbl">الحضور</div>
            </div>
          </div>
          <div className="screen-list-title" style={{textAlign:"right"}}>جدول اليوم</div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">الرياضيات الهندسية</div>
            <div className="screen-item-badge badge-green">9:00 ص</div>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">مختبر الفيزياء</div>
            <div className="screen-item-badge badge-gold">11:30 ص</div>
          </div>
        </div>
        
        <div className={`screen-slide ${currentScreen !== 1 ? 'hidden' : ''}`} id="screen-1">
          <div className="screen-topbar">
            <div className="screen-logo">ريادة</div>
            <div className="screen-avatar">AM</div>
          </div>
          <div className="screen-name" style={{textAlign:"right"}}>مقرراتي</div>
          <div className="screen-tabs" style={{direction:"rtl"}}>
            <button className="screen-tab active">النشطة</button>
            <button className="screen-tab">الدرجات</button>
            <button className="screen-tab">الأرشيف</button>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">الرياضيات الهندسية 1</div>
            <div className="screen-item-badge badge-green">A</div>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">الفيزياء</div>
            <div className="screen-item-badge badge-gold">B+</div>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">اللغة العربية</div>
            <div className="screen-item-badge badge-green">A+</div>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">البرمجة 101</div>
            <div className="screen-item-badge badge-gold">B</div>
          </div>
          <div style={{"marginTop":"10px","background":"var(--card2)","borderRadius":"10px","padding":"10px","display":"flex","alignItems":"center","gap":"8px","direction":"rtl"}}>
            <div style={{"fontSize":"18px"}}>🤖</div>
            <div style={{"fontSize":"11px","color":"var(--teal)"}}>المعلم الذكي متاح<br /><span style={{"color":"var(--ivory3)"}}>اسأل عن أي شيء يخص مقرراتك</span></div>
          </div>
        </div>
        
        <div className={`screen-slide ${currentScreen !== 2 ? 'hidden' : ''}`} id="screen-2">
          <div className="screen-topbar">
            <div className="screen-logo">ريادة</div>
            <div className="screen-avatar">AM</div>
          </div>
          <div className="screen-name" style={{textAlign:"right"}}>المحفظة</div>
          <div className="screen-card" style={{"background":"linear-gradient(135deg,#0F2040,#162B55)","border":"0.5px solid rgba(201,149,42,0.3)","direction":"rtl"}}>
            <div className="screen-card-label" style={{"color":"rgba(255,255,255,0.4)"}}>الرقم الجامعي</div>
            <div className="screen-card-value" style={{"color":"var(--gold)","fontSize":"16px"}}>UKH-2024-04892</div>
            <div className="screen-card-sub" style={{"color":"rgba(255,255,255,0.3)"}}>أحمد محمد · السنة 1</div>
          </div>
          <div style={{"display":"flex","justifyContent":"space-between","marginBottom":"12px","direction":"rtl"}}>
            <div style={{"background":"var(--card2)","borderRadius":"10px","padding":"10px","flex":"1","marginLeft":"6px","textAlign":"center"}}>
              <div style={{"fontSize":"16px","fontWeight":"800","color":"var(--teal)"}}>SDG 4,200</div>
              <div style={{"fontSize":"9px","color":"var(--ivory3)","textTransform":"uppercase","letterSpacing":"0.08em"}}>الرصيد الحالي</div>
            </div>
            <div style={{"background":"var(--card2)","borderRadius":"10px","padding":"10px","flex":"1","textAlign":"center"}}>
              <div style={{"fontSize":"16px","fontWeight":"800","color":"var(--gold)"}}>SDG 0</div>
              <div style={{"fontSize":"9px","color":"var(--ivory3)","textTransform":"uppercase","letterSpacing":"0.08em"}}>المستحق الآن</div>
            </div>
          </div>
          <div className="screen-list-title" style={{textAlign:"right"}}>أحدث المعاملات</div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">رسوم الفصل الأول</div>
            <div className="screen-item-badge badge-red">-SDG 8,500</div>
          </div>
          <div className="screen-item" style={{direction:"rtl"}}>
            <div className="screen-item-name">شحن رصيد - MTN</div>
            <div className="screen-item-badge badge-green">+SDG 10,000</div>
          </div>
        </div>
      </div>
      <div className="phone-nav" style={{direction:"rtl"}}>
        <div className="nav-icon active" onClick={() => navigate('/auth')}>🏠</div>
        <div className="nav-icon" onClick={() => navigate('/auth')}>📚</div>
        <div className="nav-icon" onClick={() => navigate('/auth')}>💳</div>
        <div className="nav-icon">💬</div>
        <div className="nav-icon">👤</div>
      </div>
    </div>
    <div className="phone-controls">
      <button className={`phone-ctrl ${currentScreen === 0 ? 'active' : ''}`} onClick={() => setCurrentScreen(0)} id="ctrl-0"></button>
      <button className={`phone-ctrl ${currentScreen === 1 ? 'active' : ''}`} onClick={() => setCurrentScreen(1)} id="ctrl-1"></button>
      <button className={`phone-ctrl ${currentScreen === 2 ? 'active' : ''}`} onClick={() => setCurrentScreen(2)} id="ctrl-2"></button>
    </div>
  </div>
</div>
</div>

<div id="revenue-section" style={{"padding":"5rem 2rem","background":"var(--night)","direction":"rtl"}}>
<div style={{"maxWidth":"1100px","margin":"0 auto"}} className="reveal">
  <div className="eyebrow">نموذج العمل</div>
  <h2 className="section-title">إيرادات <em>تتضاعف.</em></h2>
  <p className="section-body">كل طالب يسجل يمثل اشتراكاً مستمراً. كل دفعة هي معاملة مالية. ريادة تنمو مع طلاب السودان.</p>
  <div className="rev-grid">
    <div className="rev-card">
      <div className="rev-stream">الدخل 01</div>
      <div className="rev-label">نظام إدارة الجامعات</div>
      <div className="rev-desc">اشتراك شهري لكل طالب مسجل. يبدأ من 2 دولار/طالب/شهر، مع خصومات للجامعات الكبيرة.</div>
      <div className="rev-proj">$1.1M س1</div>
    </div>
    <div className="rev-card">
      <div className="rev-stream">الدخل 02</div>
      <div className="rev-label">معالجة المدفوعات</div>
      <div className="rev-desc">1.5–2.5% عمولة على كل دفعة رسوم دراسية. (45,000 طالب × 300 دولار سنوياً = أكثر من 200 ألف دولار).</div>
      <div className="rev-proj">$200K س1</div>
    </div>
    <div className="rev-card">
      <div className="rev-stream">الدخل 03</div>
      <div className="rev-label">النظام المميز للتعلم</div>
      <div className="rev-desc">مزايا متقدمة لمعلم الذكاء الاصطناعي، مساحات تخزين أكبر، وعلامة تجارية مخصصة للجامعات.</div>
      <div className="rev-proj">$150K س1</div>
    </div>
    <div className="rev-card">
      <div className="rev-stream">الدخل 04</div>
      <div className="rev-label">البيانات والتقارير</div>
      <div className="rev-desc">بيانات وطنية مجردة تُباع لوزارة التعليم والجهات المانحة الدولية لتحسين السياسات التعليمية.</div>
      <div className="rev-proj">$50K س1</div>
    </div>
  </div>
  <div style={{"marginTop":"2rem","padding":"2rem","background":"var(--card2)","border":"0.5px solid rgba(0,212,170,0.2)","display":"flex","alignItems":"center","justifyContent":"space-between","flexWrap":"gap"}}>
    <div>
      <div className="eyebrow" style={{"marginBottom":"0.3rem"}}>إجمالي العائد المستهدف للسنة الأولى</div>
      <div style={{"fontSize":"clamp(32px,6vw,56px)","fontWeight":"900","color":"var(--teal)","lineHeight":"1"}}>$2.5M+</div>
    </div>
    <div style={{"textAlign":"left","direction":"ltr"}}>
      <div style={{"fontSize":"13px","color":"var(--ivory3)","marginBottom":"0.3rem"}}>بناءً على</div>
      <div style={{"fontSize":"16px","fontWeight":"700","color":"var(--ivory)"}}>15 جامعة · 45,000 طالب</div>
    </div>
  </div>
</div>
</div>

<div style={{"padding":"5rem 2rem","background":"var(--lapis)","direction":"rtl"}}>
<div style={{"maxWidth":"1100px","margin":"0 auto"}} className="reveal">
  <div className="eyebrow">خطة التنفيذ</div>
  <h2 className="section-title">24 شهراً<br /><em>لريادة السوق.</em></h2>
  <div className="roadmap-grid">
    <div className="rm-phase">
      <div className="rm-phase-label">المرحلة 1</div>
      <div className="rm-phase-title">التأسيس</div>
      <div className="rm-phase-time">الشهور 1-6</div>
      <ul className="rm-items">
        <li className="rm-item">بوابة تسجيل الطلاب والقبول</li>
        <li className="rm-item">نظام مراجعة الجامعات</li>
        <li className="rm-item">المحفظة الرقمية ودفع الرسوم</li>
        <li className="rm-item">ملف الطالب الأساسي</li>
        <li className="rm-item">تقديم المحتوى الأساسي (PDF)</li>
        <li className="rm-item">لوحة التحكم المالية</li>
      </ul>
    </div>
    <div className="rm-phase">
      <div className="rm-phase-label">المرحلة 2</div>
      <div className="rm-phase-title">جوهر التعلم</div>
      <div className="rm-phase-time">الشهور 7-12</div>
      <ul className="rm-items">
        <li className="rm-item">الواجبات والدرجات</li>
        <li className="rm-item">الاختبارات والتقييمات</li>
        <li className="rm-item">تسجيل الحضور بالـ QR</li>
        <li className="rm-item">لوحات النقاش</li>
        <li className="rm-item">واجهة عربية بالكامل</li>
        <li className="rm-item">التحميل للعرض بدون إنترنت</li>
      </ul>
    </div>
    <div className="rm-phase">
      <div className="rm-phase-label">المرحلة 3</div>
      <div className="rm-phase-title">الذكاء الاصطناعي</div>
      <div className="rm-phase-time">الشهور 13-18</div>
      <ul className="rm-items">
        <li className="rm-item">المعلم الذكي المساعد</li>
        <li className="rm-item">تنبيهات الطلاب المتعثرين</li>
        <li className="rm-item">بث محاضرات الفيديو</li>
        <li className="rm-item">فصول افتراضية حية</li>
        <li className="rm-item">شهادات رقمية موثقة</li>
        <li className="rm-item">بوابة أولياء الأمور</li>
      </ul>
    </div>
    <div className="rm-phase" style={{"borderRight":"2px solid var(--gold)","borderLeft":"none"}}>
      <div className="rm-phase-label" style={{"color":"var(--teal)"}}>المرحلة 4</div>
      <div className="rm-phase-title">النظام البيئي</div>
      <div className="rm-phase-time">الشهور 19-24</div>
      <ul className="rm-items">
        <li className="rm-item">دمج WhatsApp Business</li>
        <li className="rm-item">بوابة الخريجين والتوظيف</li>
        <li className="rm-item">إطلاق تطبيق iOS</li>
        <li className="rm-item">واجهة برمجية للمطورين (API)</li>
        <li className="rm-item">مستودع الأبحاث</li>
        <li className="rm-item">التوسع في شرق إفريقيا</li>
      </ul>
    </div>
  </div>
</div>
</div>

<div id="vision" style={{direction:"rtl"}}>
  <div className="vision-glow"></div>
  <div style={{"position":"relative","zIndex":"2","maxWidth":"900px","margin":"0 auto"}} className="reveal">
    <div className="eyebrow" style={{"textAlign":"center","marginBottom":"2rem"}}>الهدف الأسمى</div>
    <div className="vision-quote">
      "طالب في <em>بورتسودان</em> يحمل هاتفاً ذكياً يجب أن يحصل على نفس المحاضرات، ونفس المعلم الذكي، ونفس الشهادة الموثقة — تماماً كطالب في <em>الخرطوم.</em>"
    </div>
    <div className="vision-attr" style={{"marginTop":"2rem","marginBottom":"3rem"}}>رسالة ريادة</div>
    <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"2rem","marginTop":"2rem"}}>
      <div style={{"textAlign":"center","padding":"1.5rem","border":"0.5px solid rgba(201,149,42,0.2)","borderRadius":"4px"}}>
        <div style={{"fontSize":"32px","marginBottom":"0.5rem"}}>🇸🇩</div>
        <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ivory)","marginBottom":"0.3rem"}}>السودان أولاً</div>
        <div style={{"fontSize":"12px","color":"var(--ivory3)","lineHeight":"1.6"}}>مصممة لتناسب البنية التحتية، اللغة، والواقع الاقتصادي في السودان</div>
      </div>
      <div style={{"textAlign":"center","padding":"1.5rem","border":"0.5px solid rgba(0,212,170,0.2)","borderRadius":"4px"}}>
        <div style={{"fontSize":"32px","marginBottom":"0.5rem"}}>🤖</div>
        <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ivory)","marginBottom":"0.3rem"}}>مبنية للذكاء الاصطناعي</div>
        <div style={{"fontSize":"12px","color":"var(--ivory3)","lineHeight":"1.6"}}>المنصة الوحيدة بمعلم ذكي عربي مدرب على المناهج الدراسية</div>
      </div>
      <div style={{"textAlign":"center","padding":"1.5rem","border":"0.5px solid rgba(201,149,42,0.2)","borderRadius":"4px"}}>
        <div style={{"fontSize":"32px","marginBottom":"0.5rem"}}>🌍</div>
        <div style={{"fontSize":"14px","fontWeight":"700","color":"var(--ivory)","marginBottom":"0.3rem"}}>توسع في إفريقيا</div>
        <div style={{"fontSize":"12px","color":"var(--ivory3)","lineHeight":"1.6"}}>السودان هو سوق البداية. إثيوبيا، أوغندا، وجنوب السودان تتبعها في السنة الثالثة</div>
      </div>
    </div>
  </div>
</div>

<div id="contact-section" style={{ padding: '5rem 2rem', background: 'var(--night)', direction: 'rtl' }}>
  <div style={{ maxWidth: '800px', margin: '0 auto' }} className="reveal">
    <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '1rem' }}>تواصل معنا</div>
    <h2 className="section-title" style={{ textAlign: 'center' }}>الخطوة الأولى نحو <em>المستقبل.</em></h2>
    <p className="section-body" style={{ textAlign: 'center', marginBottom: '3rem' }}>
      سواء كنت تمثل جامعة ترغب في الانضمام للمنصة، أو مستثمراً يؤمن برؤيتنا، يسعدنا التواصل معك.
    </p>

    <div className="menu-card" style={{ padding: '3rem', background: 'var(--card2)', border: '1px solid var(--glass-border-teal)' }}>
      {contactStatus === 'SUCCESS' ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
          <h3 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>تم إرسال رسالتك بنجاح!</h3>
          <p style={{ color: 'var(--ivory3)' }}>شكراً لتواصلك معنا. سيقوم فريق ريادة بالرد عليك في أقرب وقت ممكن.</p>
        </div>
      ) : (
        <form onSubmit={handleContactSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الاسم الكامل *</label>
              <input type="text" className="auth-input" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder="الاسم الكامل" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>البريد الإلكتروني *</label>
              <input type="email" className="auth-input" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder="example@domain.com" style={{ direction: 'ltr', textAlign: 'right' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>رقم الهاتف</label>
              <input type="tel" className="auth-input" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder="+249..." style={{ direction: 'ltr', textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الجهة / الجامعة</label>
              <input type="text" className="auth-input" value={contactForm.org} onChange={e => setContactForm({...contactForm, org: e.target.value})} placeholder="اسم المؤسسة التعليمية أو الجهة" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الموضوع *</label>
            <select className="auth-input" required value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})}>
              <option value="">-- اختر الموضوع --</option>
              <option value="UNIVERSITY_PARTNERSHIP">شراكة جامعية وانضمام للمنصة</option>
              <option value="INVESTMENT">فرص استثمارية</option>
              <option value="PRESS">إعلام وصحافة</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--ivory2)', fontSize: '0.9rem', fontWeight: 'bold' }}>الرسالة *</label>
            <textarea className="auth-input" required rows="5" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="اكتب رسالتك هنا..."></textarea>
          </div>

          <button type="submit" disabled={contactStatus === 'LOADING'} className="btn-cyan" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', opacity: contactStatus === 'LOADING' ? 0.7 : 1 }}>
            {contactStatus === 'LOADING' ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
          {contactStatus === 'ERROR' && <div style={{ color: 'var(--red)', textAlign: 'center', marginTop: '1rem' }}>حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.</div>}
        </form>
      )}
    </div>
  </div>
</div>

<footer style={{direction:"rtl"}}>
  <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><img src="/riyadah-logo.png" alt="Riyadah Logo" style={{ height: '48px' }} /></div>
  <div className="footer-tag">المنصة الوطنية للتعليم العالي في السودان</div>
  <div className="footer-links">
    <a href="#" onClick={() => navigate('/auth')}>التقنيات</a>
    <a href="#" onClick={() => navigate('/auth')}>الشركاء</a>
    <a href="#" onClick={() => navigate('/auth')}>التمويل</a>
    <a href="#" onClick={() => navigate('/auth')}>الشروط القانونية</a>
    <a href="#" onClick={() => navigate('/auth')}>البنية التحتية</a>
  </div>
  <div className="footer-copy">© 2026 ريادة. سري. بُني ليدوم.</div>
</footer>


    </div>
  );
}
