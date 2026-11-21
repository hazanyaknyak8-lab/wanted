/* WANTED v15 — logo.js
   Ang ASCII "WANTED" ay canvas na ngayon, bawat letter ay may sariling buhay:
   - may bilog sa paligid ng mouse na iniiwasan ng mga letter (spring physics, may bounce)
   - ang mga letter na nadadaanan ay napapalitan ng symbol/letter, tapos bumabalik
   - kumikinang: may sumasaklaw na liwanag, kumikislap na sparkle, at gumagalaw na alon ng ningning
   - i-click mo: sumasabog palayo ang mga letter tapos bumabalik
   Gumagana sa home logo at sa loading screen. Sa phone, gumagana sa pagdrag ng daliri. */
(()=>{
"use strict";
const calm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const GL="01+x:.8†#%&@$?!<>/|=*^~;";
const rnd=n=>Math.random()*n;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
let px=-9999,py=-9999;

/* kulay: b=0 madilim na pula → 1 maliwanag na pula → 1.5 puti */
const STOPS=[[0,[110,8,20]],[.6,[214,25,43]],[1,[255,102,114]],[1.5,[255,252,250]]];
const PAL=[];
for(let i=0;i<48;i++){
  const b=i/47*1.5;let a=STOPS[0],c=STOPS[STOPS.length-1];
  for(let k=0;k<STOPS.length-1;k++)if(b>=STOPS[k][0]&&b<=STOPS[k+1][0]){a=STOPS[k];c=STOPS[k+1];break}
  const t=(b-a[0])/((c[0]-a[0])||1);
  PAL.push(`rgb(${a[1].map((v,j)=>Math.round(v+(c[1][j]-v)*t)).join(",")})`);
}
const pal=b=>PAL[clamp(Math.round(b/1.5*47),0,47)];

const CFG={
  ".logo":{maxW:()=>Math.min(innerWidth*.92,1060),maxH:()=>innerHeight*(innerWidth<=720?.4:.34),maxFs:21},
  ".gt":{maxW:()=>innerWidth>900?Math.min(innerWidth*.52,820):innerWidth*.9,maxH:()=>innerHeight*(innerWidth<=720?.4:.38),maxFs:17}
};
const insts=[];

function readLines(pre){
  const l=pre.textContent.replace(/\r/g,"").split("\n");
  while(l.length&&!l[l.length-1].trim())l.pop();
  while(l.length&&!l[0].trim())l.shift();
  return l;
}
function make(sel){
  const host=document.querySelector(sel);if(!host)return;
  const wide=host.querySelector(":scope>.asc.w"),st=[...host.querySelectorAll(":scope>.asc-s>.asc")];
  if(!wide)return;
  const it={host,cfg:CFG[sel],wide:readLines(wide),stack:st.map(readLines),cv:document.createElement("canvas"),P:[],W:0,H:0,R:90,fs:12,lh:12,cw:7};
  it.cv.className="lc";it.cv.setAttribute("aria-hidden","true");
  host.appendChild(it.cv);it.ctx=it.cv.getContext("2d");
  insts.push(it);build(it);
}
function build(it){
  const stacked=innerWidth<=720&&it.stack.length>0;
  const blocks=(stacked?it.stack:[it.wide]).map(lines=>({lines,cols:Math.max(...lines.map(l=>l.length))}));
  let cols=0,rows=0;
  blocks.forEach((b,i)=>{cols=Math.max(cols,b.cols);rows+=b.lines.length+(i?1:0)});
  const fs=Math.max(6,Math.min(it.cfg.maxW()/(cols*.6),it.cfg.maxH()/(rows*1.04),it.cfg.maxFs));
  const cw=fs*.6,lh=fs*1.04;
  it.fs=fs;it.cw=cw;it.lh=lh;it.W=Math.ceil(cols*cw);it.H=Math.ceil(rows*lh);it.R=clamp(fs*8,78,150);
  const dpr=Math.min(devicePixelRatio||1,2);
  it.cv.width=it.W*dpr;it.cv.height=it.H*dpr;it.cv.style.width=it.W+"px";it.cv.style.height=it.H+"px";
  it.ctx.setTransform(dpr,0,0,dpr,0,0);
  it.P=[];let r0=0;
  blocks.forEach((b,bi)=>{
    if(bi)r0++;
    const off=(cols-b.cols)/2;
    b.lines.forEach((line,ri)=>{
      for(let ci=0;ci<line.length;ci++){
        const ch=line[ci];if(ch===" "||ch==="\t")continue;
        const col=ci+off,row=r0+ri;
        it.P.push({c:ch,g:ch,hx:(col+.5)*cw,hy:(row+.5)*lh,ox:0,oy:0,vx:0,vy:0,tm:0,nx:0,sp:0,ph:col*.33+row*.7});
      }
    });
    r0+=b.lines.length;
  });
  document.documentElement.classList.add("lfx");
  if(calm)draw(it,0,0);
}

function visible(it){
  if(!it.host.isConnected)return false;
  const v=it.host.closest(".view");
  return v?v.classList.contains("on"):true;
}
function draw(it,t,dt){
  const ctx=it.ctx,W=it.W,H=it.H,R=it.R,P=it.P;
  const r=it.cv.getBoundingClientRect();
  const lx=px-r.left,ly=py-r.top;
  const active=!calm&&lx>-R&&lx<W+R&&ly>-R&&ly<H+R;
  ctx.clearRect(0,0,W,H);
  if(active){
    const g=ctx.createRadialGradient(lx,ly,0,lx,ly,R*1.5);
    g.addColorStop(0,"rgba(214,25,43,.2)");g.addColorStop(1,"rgba(214,25,43,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  ctx.font=`700 ${it.fs}px "JetBrains Mono",ui-monospace,Menlo,Consolas,monospace`;
  ctx.textAlign="center";ctx.textBaseline="middle";

  /* liwanag na sumasaklaw (dayagonal), paulit-ulit kada 5s */
  const cyc=(t%5)/1.4-.15,tot=W+H*.6;
  /* random na kislap */
  if(!calm&&P.length&&Math.random()<dt*(active?26:12)){P[Math.random()*P.length|0].sp=.7}

  for(let i=0;i<P.length;i++){
    const p=P[i];
    let tx=0,ty=0,d=1e9;
    if(active){
      const dx=p.hx-lx,dy=p.hy-ly;d=Math.hypot(dx,dy);
      if(d<R){
        if(d<.5){const a=rnd(6.28);tx=Math.cos(a)*R;ty=Math.sin(a)*R}
        else{const k=(R-d)*1.12/d;tx=dx*k;ty=dy*k}
      }
      if(d<R*1.1)p.tm=.55;
    }
    /* spring */
    p.vx+=(170*(tx-p.ox)-11*p.vx)*dt;p.vy+=(170*(ty-p.oy)-11*p.vy)*dt;
    p.ox+=p.vx*dt;p.oy+=p.vy*dt;
    /* palit-palit na symbol */
    if(p.tm>0){
      p.tm-=dt;p.nx-=dt;
      if(p.nx<=0){p.g=GL[Math.random()*GL.length|0];p.nx=.04+rnd(.07)}
      if(p.tm<=0)p.g=p.c;
    }
    /* ningning */
    let b=.78+.14*Math.sin(t*1.6+p.ph);
    const u=(p.hx+p.hy*.6)/tot,band=Math.max(0,1-Math.abs(u-cyc)/.07);
    b+=band*.75;
    if(active&&d<R*1.7)b+=(1-d/(R*1.7))*.45;
    if(p.tm>0)b=Math.max(b,1.05+.2*Math.sin(t*30+i));
    if(p.sp>0){p.sp-=dt;b=1.5}
    const x=p.hx+p.ox,y=p.hy+p.oy;
    ctx.fillStyle=pal(b);
    ctx.fillText(p.g,x,y);
    if(p.sp>0){
      const s=p.sp*11;ctx.fillStyle="rgba(255,255,255,.9)";
      ctx.fillRect(x-s,y-.5,s*2,1);ctx.fillRect(x-.5,y-s,1,s*2);
    }
  }
}

let last=0;
function loop(now){
  const dt=Math.min(.034,(now-last)/1000||.016);last=now;
  for(let i=insts.length-1;i>=0;i--){
    const it=insts[i];
    if(!it.host.isConnected){insts.splice(i,1);continue}
    if(visible(it))draw(it,now/1000,dt);
  }
  requestAnimationFrame(loop);
}

/* pointer */
const set=e=>{px=e.clientX;py=e.clientY};
addEventListener("pointermove",set,{passive:true});
addEventListener("pointerdown",e=>{
  set(e);if(calm)return;
  /* sabog! */
  insts.forEach(it=>{
    if(!visible(it))return;
    const r=it.cv.getBoundingClientRect(),lx=px-r.left,ly=py-r.top,Rr=it.R*2.3;
    if(lx<-Rr||lx>it.W+Rr||ly<-Rr||ly>it.H+Rr)return;
    it.P.forEach(p=>{
      const dx=p.hx-lx,dy=p.hy-ly,d=Math.hypot(dx,dy);
      if(d<Rr){const k=(1-d/Rr)*680/(d||1);p.vx+=dx*k;p.vy+=dy*k;p.tm=.9}
    });
  });
},{passive:true});
addEventListener("pointerup",e=>{if(e.pointerType!=="mouse"){px=py=-9999}},{passive:true});
addEventListener("pointercancel",()=>{px=py=-9999},{passive:true});
document.documentElement.addEventListener("mouseleave",()=>{px=py=-9999});

let rt=0;
addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>insts.forEach(build),120)});

make(".gt");make(".logo");
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>insts.forEach(build));
if(!calm)requestAnimationFrame(loop);
})();
