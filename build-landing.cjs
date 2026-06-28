const fs = require('fs');

let html = fs.readFileSync('C:/Users/Administrator/Downloads/riyada_interactive_showcase.html', 'utf8');

// Extract the body content (everything after <style> and before <script>)
let bodyMatch = html.match(/<\/style>([\s\S]*?)<script>/);
if (!bodyMatch) {
  console.error("Could not find body content");
  process.exit(1);
}
let body = bodyMatch[1];

// Convert class to className
body = body.replace(/class="/g, 'className="');

// Convert onclick to onClick
body = body.replace(/onclick="([^"]*)"/g, (match, p1) => {
  return `onClick={() => navigate('/auth')}`;
});

// Convert style attributes to JSX style objects
body = body.replace(/style="([^"]*)"/g, (match, p1) => {
  let styleParts = p1.split(';').filter(p => p.trim() !== '');
  let styleObj = {};
  styleParts.forEach(part => {
    let [key, val] = part.split(':');
    if (!key || !val) return;
    key = key.trim();
    val = val.trim();
    // camelCase key
    key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    styleObj[key] = val;
  });
  return `style={${JSON.stringify(styleObj)}}`;
});

// Remove HTML comments
body = body.replace(/<!--[\s\S]*?-->/g, '');

// Replace the topnav logo text with the image logo
body = body.replace(
  /<div className="nav-logo">RI<span>A<\/span>DA<\/div>/,
  `<div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><img src="/riyadah-logo.png" alt="Riyadah Logo" style={{ height: '32px' }} /></div>`
);

// Replace the footer logo text with the image logo
body = body.replace(
  /<div className="footer-logo">RI<span>A<\/span>DA<\/div>/,
  `<div className="footer-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><img src="/riyadah-logo.png" alt="Riyadah Logo" style={{ height: '48px' }} /></div>`
);

// Output the final React Component
const component = `
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const [currentScreen, setCurrentScreen] = useState(0);

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
        ctx.fillStyle = this.gold ? \`rgba(201,149,42,\${alpha})\` : this.teal ? \`rgba(0,212,170,\${alpha})\` : \`rgba(245,240,232,\${alpha*0.3})\`;
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
            ctx.strokeStyle=\`rgba(201,149,42,\${0.08*(1-d/80)})\`;
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
          el.textContent = suffix==='M' ? \`$\${(ease*target).toFixed(1)}M\` : val+(suffix||'');
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
      [0.48,0.02],[0.72,0.02],[0.82,0.08],[0.88,0.14],[0.92,0.22],[0.90,0.30],
      [0.96,0.36],[0.98,0.44],[0.96,0.52],[0.88,0.58],[0.86,0.66],[0.90,0.72],
      [0.88,0.80],[0.82,0.86],[0.76,0.90],[0.70,0.92],[0.62,0.90],[0.56,0.96],
      [0.48,0.98],[0.40,0.96],[0.32,0.90],[0.26,0.84],[0.20,0.78],[0.14,0.70],
      [0.10,0.62],[0.08,0.54],[0.10,0.46],[0.08,0.38],[0.10,0.30],[0.14,0.22],
      [0.20,0.16],[0.28,0.10],[0.36,0.06],[0.44,0.03]
    ];
    const unis = [
      {x:0.56,y:0.36,name:"Khartoum",size:8,type:'major'},
      {x:0.52,y:0.38,name:"Omdurman Islamic",size:7,type:'major'},
      {x:0.58,y:0.34,name:"U of K",size:6,type:'major'},
      {x:0.70,y:0.28,name:"Kassala",size:5,type:'regional'},
      {x:0.78,y:0.40,name:"Red Sea",size:5,type:'regional'},
      {x:0.30,y:0.32,name:"Darfur",size:6,type:'priority'},
      {x:0.22,y:0.50,name:"S. Darfur",size:5,type:'priority'},
      {x:0.44,y:0.54,name:"Kordofan",size:5,type:'regional'},
      {x:0.60,y:0.60,name:"Blue Nile",size:5,type:'regional'},
      {x:0.50,y:0.70,name:"Sennar",size:4,type:'regional'},
      {x:0.38,y:0.72,name:"S. Kordofan",size:4,type:'priority'},
      {x:0.54,y:0.82,name:"Upper Nile",size:4,type:'priority'},
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
          mx.fillStyle=\`rgba(\${r},\${g},\${b},\${0.15*pulse})\`;
        } else {
          mx.fillStyle = color.replace(')',\`, \${0.12*pulse})\`).replace('rgb','rgba').replace('rgba(rgba','rgba');
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
        mx.fillStyle=\`rgba(201,149,42,\${alpha})\`;
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

  // Update the HTML string to use the currentScreen state for classes
  return (
    <div className="landing-wrapper">
      ${body.replace(/id="particle-canvas"/g, 'id="particle-canvas" ref={canvasRef}').replace(/id="sudan-map-canvas"/g, 'id="sudan-map-canvas" ref={mapCanvasRef}').replace(/id="screen-0" className="screen-slide"/, 'id="screen-0" className={`screen-slide ${currentScreen !== 0 ? \'hidden\' : \'\'}`}').replace(/id="screen-1" className="screen-slide hidden"/, 'id="screen-1" className={`screen-slide ${currentScreen !== 1 ? \'hidden\' : \'\'}`}').replace(/id="screen-2" className="screen-slide hidden"/, 'id="screen-2" className={`screen-slide ${currentScreen !== 2 ? \'hidden\' : \'\'}`}').replace(/id="ctrl-0" className="phone-ctrl active"/, 'id="ctrl-0" className={`phone-ctrl ${currentScreen === 0 ? \'active\' : \'\'}`} onClick={() => setCurrentScreen(0)}').replace(/id="ctrl-1" className="phone-ctrl"/, 'id="ctrl-1" className={`phone-ctrl ${currentScreen === 1 ? \'active\' : \'\'}`} onClick={() => setCurrentScreen(1)}').replace(/id="ctrl-2" className="phone-ctrl"/, 'id="ctrl-2" className={`phone-ctrl ${currentScreen === 2 ? \'active\' : \'\'}`} onClick={() => setCurrentScreen(2)}').replace(/class="([^"]*)"/g, 'className="$1"').replace(/<br>/g, '<br />').replace(/onclick="[^"]*"/gi, '')}
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/scratch/Riyada/src/pages/LandingPage.jsx', component);
console.log("LandingPage.jsx built successfully.");
