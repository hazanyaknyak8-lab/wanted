/* WANTED v15 — fx.js
   1. cursor na hindi na mawawala (krus + ring, laging nasa pinakataas)
   2. cards/servers na umiiwas sa mouse (spring physics)
   3. parallax ng logo + kamay + red na ilaw sa background
   4. glyph trail, click ping, scramble ng headings
   PC lang (mouse). Sa phone/tablet walang gagawin ang file na to. */
(()=>{
"use strict";
const fine=matchMedia("(hover:hover) and (pointer:fine)");
if(!fine.matches)return;
const calm=matchMedia("(prefers-reduced-motion:reduce)");
const root=document.documentElement,body=document.body;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

let mx=-300,my=-300,rx=-300,ry=-300;
let seen=false,inWin=false,down=false,speed=0,lastMove=0;
const bgx=$("#bgx");
if(!calm.matches)root.classList.add("fxon");

/* ---------------- cursor ---------------- */
const cx=document.createElement("div");cx.id="cx";cx.setAttribute("aria-hidden","true");
cx.innerHTML='<svg viewBox="0 0 24 34" width="24" height="34"><path d="M9 1h6v6h7v6h-7v20H9V13H2V7h7z"/></svg>';
const cr=document.createElement("div");cr.id="cring";cr.setAttribute("aria-hidden","true");
cr.innerHTML="<i></i><b></b>";
body.append(cr,cx);

const IA="a[href],button,[role=button],.card,.s,#gate,input[type=range]";
const NAT="input[type=search],input[type=text],textarea,video,select";
function aim(el){
  const nat=!!(el&&el.closest&&el.closest(NAT));
  root.classList.toggle("nat",nat);
  const ia=!nat&&el&&el.closest?el.closest(IA):null;
  let lab="";
  if(ia){if(ia.matches(".card"))lab="OPEN";else if(ia.matches(".s"))lab="JOIN";else if(ia.id==="gate")lab="ENTER"}
  cx.classList.toggle("hov",!!ia);cr.classList.toggle("hov",!!ia);cr.classList.toggle("lab",!!lab);
  if(lab)cr.lastChild.textContent=lab;
}
function place(e){
  const t=e.timeStamp,dt=Math.max(1,t-lastMove);
  speed=speed*.7+Math.hypot(e.clientX-mx,e.clientY-my)/dt*1000*.3;lastMove=t;
  mx=e.clientX;my=e.clientY;
  cx.style.transform=`translate3d(${mx}px,${my}px,0)`;
  if(!seen){seen=true;rx=mx;ry=my;root.classList.add("cur-on");aim(e.target)}
  if(!inWin){inWin=true;root.classList.add("cur-vis")}
  if(bgx){bgx.style.setProperty("--gx",mx+"px");bgx.style.setProperty("--gy",my+"px")}
}
addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;place(e);trailAdd();wake()},{passive:true});
addEventListener("pointerover",e=>{if(e.pointerType==="mouse")aim(e.target)},{passive:true});
addEventListener("pointerdown",e=>{
  if(e.pointerType!=="mouse")return;
  place(e);down=true;cx.classList.add("dn");cr.classList.add("dn");
  if(!calm.matches){const p=document.createElement("i");p.className="ping";p.style.left=mx+"px";p.style.top=my+"px";body.appendChild(p);p.addEventListener("animationend",()=>p.remove(),{once:true})}
  wake();
},{passive:true});
const up=()=>{down=false;cx.classList.remove("dn");cr.classList.remove("dn");wake()};
addEventListener("pointerup",up,{passive:true});addEventListener("pointercancel",up,{passive:true});
/* lumabas/pumasok ang mouse sa window */
root.addEventListener("mouseleave",()=>{inWin=false;root.classList.remove("cur-vis");wake()});
root.addEventListener("mouseenter",()=>{if(seen){inWin=true;root.classList.add("cur-vis")}});
/* pagkatapos mag-switch ng page/modal, i-check ulit kung ano ang nasa ilalim ng mouse */
document.addEventListener("click",()=>setTimeout(()=>{if(seen)aim(document.elementFromPoint(mx,my))},380));
/* safety: kung nag-alt-tab/nag-blur, bitawan ang press state */
addEventListener("blur",up);

/* ---------------- main loop ---------------- */
let raf=0,lt=0,ppx=0,ppy=0;
const wake=()=>{if(!raf){lt=performance.now();raf=requestAnimationFrame(tick)}};
const logo=$(".logo"),home=$("#home");

function tick(now){
  raf=0;
  const dt=clamp((now-lt)/1000,.001,.034);lt=now;
  let busy=false;

  /* ring: sumusunod nang may lag */
  if(calm.matches){rx=mx;ry=my}
  else{
    const a=1-Math.exp(-dt*18);rx+=(mx-rx)*a;ry+=(my-ry)*a;
    if(Math.abs(mx-rx)+Math.abs(my-ry)>.4)busy=true;else{rx=mx;ry=my}
  }
  cr.style.transform=`translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;

  if(!calm.matches){
    /* parallax: logo + kamay */
    const tx=inWin?mx/innerWidth-.5:0,ty=inWin?my/innerHeight-.5:0,b=1-Math.exp(-dt*5);
    ppx+=(tx-ppx)*b;ppy+=(ty-ppy)*b;
    if(Math.abs(tx-ppx)+Math.abs(ty-ppy)>.0008)busy=true;
    if(home&&home.classList.contains("on")){
      if(logo){logo.style.setProperty("--lx",(ppx*9).toFixed(2)+"deg");logo.style.setProperty("--ly",(-ppy*7).toFixed(2)+"deg")}
      home.style.setProperty("--hx",(-ppx*30).toFixed(1));home.style.setProperty("--hy",(-ppy*18).toFixed(1));
    }
    busy=dodge(dt)||busy;
  }
  if(busy)wake();
}

/* ---------------- dodge: umiiwas ang cards sa mouse ----------------
   Spring physics. Ang cursor ay may "takot" na field sa paligid ng card:
   - malapit pero nasa labas: umaatras + tumatagilid palayo + lumiliit nang kaunti
   - nasa loob na ng card: halos hindi na umaatras (para laging pwedeng i-click),
     pero may tilt at ilaw na sumusunod sa mouse
   - sa mismong pagpasok: may flinch (biglang iwas) tapos babalik nang may bounce */
const S=new Map(),KK=[200,200,240,240,240,300,90],CC=[13,13,17,17,17,23,15];
function dodge(dt){
  const active=$(".view.on"),modal=$("#modal.on")||$("#hm.on");
  let ok=false,px=0,py=0;
  if(active&&seen&&inWin&&!modal){
    const r=active.getBoundingClientRect();
    ok=mx>=r.left&&mx<=r.right&&my>=r.top&&my<=r.bottom;
    px=mx-r.left+active.scrollLeft;py=my-r.top+active.scrollTop;
  }
  const boost=1+clamp(speed/2200,0,.5);   /* mas mabilis ang mouse, mas malakas ang iwas */
  let busy=false;
  document.querySelectorAll(".card,.s").forEach(el=>{
    let st=S.get(el);if(!st){st={p:[0,0,0,0,0,1,0],v:[0,0,0,0,0,0,0],in:false,k:""};S.set(el,st)}
    const w=el.offsetWidth,h=el.offsetHeight,T=[0,0,0,0,0,1,0];
    if(ok&&w&&el.closest(".view")===active){
      const L=el.offsetLeft,Tp=el.offsetTop,ccx=L+w/2,ccy=Tp+h/2;
      const dx=Math.max(L-px,0,px-(L+w)),dy=Math.max(Tp-py,0,py-(Tp+h)),out=Math.hypot(dx,dy);
      const inside=out===0,inset=inside?Math.min(px-L,L+w-px,py-Tp,Tp+h-py):0;
      let ux=ccx-px,uy=ccy-py;const len=Math.hypot(ux,uy)||1;ux/=len;uy/=len;
      const big=Math.max(w,h),wide=big>420,ts=clamp(260/big,.25,1);
      const P=(wide?7:el.classList.contains("s")?10:15)*boost,R=wide?130:200;
      const f=inside?Math.max(0,1-inset/30):Math.pow(Math.max(0,1-out/R),2);
      T[0]=ux*P*f;T[1]=uy*P*f;
      T[2]=uy*11*f*ts;T[3]=-ux*13*f*ts;T[4]=ux*2.4*f*(wide?.4:1);
      T[5]=inside?1.02:1-.035*f;T[6]=inside?0:f;
      if(inside){
        T[2]+=clamp((ccy-py)/(h/2),-1,1)*6*ts;
        T[3]+=clamp((px-ccx)/(w/2),-1,1)*7*ts;
        if(down)T[5]*=.97;
      }
      if(inside&&!st.in){st.v[0]+=ux*150;st.v[1]+=uy*150;st.v[2]+=uy*70;st.v[3]-=ux*70;st.v[4]+=ux*40}
      st.in=inside;
      el.style.setProperty("--mx",(px-L).toFixed(0)+"px");el.style.setProperty("--my",(py-Tp).toFixed(0)+"px");
    }else st.in=false;

    let moving=false;
    for(let i=0;i<7;i++){
      const a=KK[i]*(T[i]-st.p[i])-CC[i]*st.v[i];
      st.v[i]+=a*dt;st.p[i]+=st.v[i]*dt;
      if(Math.abs(st.v[i])>(i<2?.05:.02)||Math.abs(T[i]-st.p[i])>(i<2?.02:.004))moving=true;
    }
    if(!moving){for(let i=0;i<7;i++){st.p[i]=T[i];st.v[i]=0}}
    const p=st.p,k=p.map(n=>n.toFixed(2)).join();
    if(k!==st.k){
      st.k=k;
      const flat=Math.abs(p[0])+Math.abs(p[1])+Math.abs(p[2])+Math.abs(p[3])+Math.abs(p[4])+Math.abs(p[5]-1)<.01;
      el.style.transform=flat?"":`translate3d(${p[0].toFixed(2)}px,${p[1].toFixed(2)}px,0) perspective(900px) rotateX(${p[2].toFixed(2)}deg) rotateY(${p[3].toFixed(2)}deg) rotateZ(${p[4].toFixed(2)}deg) scale(${p[5].toFixed(4)})`;
      el.style.setProperty("--fear",clamp(p[6],0,1).toFixed(3));
    }
    if(moving)busy=true;
  });
  return busy;
}
addEventListener("scroll",wake,{capture:true,passive:true});
addEventListener("resize",wake);

/* ---------------- glyph trail ---------------- */
const cv=document.createElement("canvas");cv.id="wtrail";cv.setAttribute("aria-hidden","true");body.appendChild(cv);
const c2=cv.getContext("2d"),TP=[],GL="01+x:.8†";
let W=0,H=0,dpr=1,lx=-99,ly=-99,trun=false;
function fit(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c2.setTransform(dpr,0,0,dpr,0,0)}
fit();addEventListener("resize",fit);
function trailLoop(){
  c2.clearRect(0,0,W,H);c2.font='700 13px "JetBrains Mono",ui-monospace,monospace';c2.textAlign="center";c2.textBaseline="middle";
  for(let i=TP.length-1;i>=0;i--){
    const p=TP[i];p.l-=.028;if(p.l<=0){TP.splice(i,1);continue}
    p.y+=p.v;p.x+=p.d;
    c2.globalAlpha=p.l*.9;c2.fillStyle=p.l>.7?"#ff6672":"#d6192b";c2.shadowColor="rgba(240,64,79,.8)";c2.shadowBlur=8;c2.fillText(p.c,p.x,p.y);
  }
  c2.globalAlpha=1;c2.shadowBlur=0;
  if(TP.length)requestAnimationFrame(trailLoop);else trun=false;
}
function trailAdd(){
  if(calm.matches||$("#modal.on")||$("#hm.on"))return;
  if(Math.hypot(mx-lx,my-ly)<18)return;
  lx=mx;ly=my;
  TP.push({x:lx,y:ly,v:.25+Math.random()*.35,d:(Math.random()-.5)*.25,l:1,c:GL[Math.random()*GL.length|0]});
  if(TP.length>50)TP.shift();
  if(!trun){trun=true;requestAnimationFrame(trailLoop)}
}

/* ---------------- scramble ng page title ---------------- */
const SG="01+x:.8†#%&";
function scramble(el){
  if(calm.matches)return;
  const txt=el.dataset.t||(el.dataset.t=el.textContent);let f=0;const total=16;
  clearInterval(el._s);
  el._s=setInterval(()=>{
    f++;const k=f/total;
    el.textContent=[...txt].map((ch,i)=>ch===" "||i<k*txt.length?ch:SG[Math.random()*SG.length|0]).join("");
    if(f>=total){clearInterval(el._s);el.textContent=txt}
  },34);
}
new MutationObserver(ms=>ms.forEach(m=>{
  const v=m.target;
  if(v.classList.contains("on")&&!(m.oldValue||"").split(/\s+/).includes("on")){const h=v.querySelector(".head h2");if(h)scramble(h)}
})).observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],attributeOldValue:true});
document.querySelectorAll(".view").forEach(v=>{});
})();
