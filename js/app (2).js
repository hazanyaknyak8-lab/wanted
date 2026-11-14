const CFG={
  music:"music.mp3",          
  musicTitle:"NOW PLAYING",
  volume:0.5,

  hvt:[
    {id:"1530686788824469646",bounty:"₱1,000,000",threat:10,reason:"hari ng lahat"}
  ],
  mostWanted:[
    {id:"1499499066932068454",bounty:"₱750,000",threat:9,reason:""},
    {id:"1556911422091427910",bounty:"₱600,000",threat:8,reason:""},
    {id:"1544422656852627496",bounty:"₱500,000",threat:8,reason:""},
    {id:"1546289969960587270",bounty:"₱450,000",threat:7,reason:"nanununtok ng tanga"},
    {id:"1441623190412726355",bounty:"₱400,000",threat:7,reason:"."},
    {id:"1147462845315952690",bounty:"₱350,000",threat:6,reason:""}
  ],
  wanted:[
    {id:"909977852378763264",bounty:"₱150,000",threat:4,reason:""},
    {id:"1435619294229561434",bounty:"₱120,000",threat:4,reason:"pinakamabaho"}
  ],
  watch:[
    /* UNDER SURVEILLANCE: {id:"discord_id",bounty:"₱50,000",threat:2,reason:"",stamp:""} */
  ],
  servers:[
    {label:"MAIN SERVER",code:"jG7qCDJqFt"},
    {label:"PLUG",code:"XNVgUyqUAY",plug:true}
  ]
};
const CHARGES=["nagpapasabog"];


const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,coarse=matchMedia("(pointer:coarse)").matches,fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),pad=n=>String(n).padStart(2,"0");
const AV="https://cdn.discordapp.com/embed/avatars/0.png";
const LABEL={online:"ONLINE",idle:"IDLE",dnd:"DO NOT DISTURB",offline:"OFFLINE"};
const people=[...(CFG.hvt||[]).map((u,i)=>({threat:10,...u,kind:"hvt",rank:i+1})),...(CFG.watch||[]).map((u,i)=>({threat:2,...u,kind:"sv",rank:i+1})),...CFG.mostWanted.map((u,i)=>({...u,kind:"mw",rank:i+1})),...CFG.wanted.map((u,i)=>({...u,kind:"w",rank:i+1}))];
const byId=id=>people.find(u=>u.id===id);
const parseB=s=>+String(s||"").replace(/\D/g,"")||0,TOTAL=people.reduce((a,u)=>a+parseB(u.bounty),0);
$("#npt").textContent=CFG.musicTitle;

/* ---------- views (walang page scroll) ---------- */
const VIEWS=["home","hvt","mw","w","sv","srv"];
const TN={hvt:"HIGH VALUE TARGET",mw:"MOST WANTED",w:"WANTED",sv:"UNDER SURVEILLANCE"};
const stars=t=>{const n=Math.min(10,Math.max(1,t||1));return Array.from({length:5},(_,k)=>`<i class="st ${n>=2*k+2?"f":n===2*k+1?"h":""}" style="--k:${k}">★</i>`).join("")};
function go(v){
  if(!VIEWS.includes(v))v="home";
  $$(".view").forEach(e=>e.classList.toggle("on",e.id===v));
  $$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  history.replaceState(null,"","#"+v);
  const ab=$("#nav button.on");if(ab&&ab.scrollIntoView)try{ab.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}catch(e){}
}
document.addEventListener("click",e=>{
  const n=e.target.closest("[data-v],[data-go]");if(n){go(n.dataset.v||n.dataset.go);return}
  const nb=e.target.closest("[data-nav]");if(nb){nav(+nb.dataset.nav);return}
  if(e.target.closest("#mcp")){copyId();return}
  const c=e.target.closest(".card");if(c){openFile(c.dataset.id);return}
  if(e.target.id==="modal"||e.target.closest("#mx"))closeFile();
});
const modalOn=()=>$("#modal").classList.contains("on");
function step(d){const i=VIEWS.findIndex(v=>$("#"+v).classList.contains("on"));go(VIEWS[(i+d+VIEWS.length)%VIEWS.length])}
document.addEventListener("keydown",e=>{
  const typing=/^(INPUT|TEXTAREA)$/.test(e.target.tagName);
  if(e.key==="Escape"){if(typing&&e.target.value){syncQ("");return}closeFile();if(typing)e.target.blur();return}
  if(typing)return;
  const lr=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;
  if(lr){modalOn()?nav(lr):step(lr)}
  else if(e.key==="/"&&!modalOn()){const q=$(".view.on .q");if(q){e.preventDefault();q.focus()}}
});
/* swipe (phone): kaliwa/kanan para lumipat ng tab o ng target sa popup */
function swipe(el,fn){let sx=0,sy=0;
  el.addEventListener("touchstart",e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY},{passive:true});
  el.addEventListener("touchend",e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*2)fn(dx<0?1:-1)},{passive:true})}
swipe($("main"),d=>{if(!modalOn())step(d)});
swipe($("#modal"),d=>nav(d));

/* ---------- log ---------- */
function log(msg,cls){
  const el=$("#log"),d=document.createElement("div");
  d.innerHTML=`<span>${new Date().toTimeString().slice(0,8)}</span>`;d.append(msg);if(cls)d.className=cls;
  el.appendChild(d);while(el.children.length>5)el.firstChild.remove();
}
setInterval(()=>{$("#clk").textContent=new Date().toTimeString().slice(0,8)},1000);

/* ---------- cards ---------- */
function card(u,i){
  return `<button class="card offline ${u.kind}" id="u${u.id}" data-id="${u.id}" style="--i:${i}" aria-label="Open case file">
  <div class="ph"><img alt="" src="${AV}"><b class="rk">${u.kind==="hvt"?"HVT ":""}#${pad(u.rank)}</b>${u.kind==="sv"?'<span class="rec"><i></i>REC</span>':""}${u.stamp?`<em class="stamp">${u.stamp}</em>`:""}<span class="stt"><i class="dot"></i><span class="stx sl">OFFLINE</span></span></div>
  <div class="info"><div class="nm">${u.id}</div><div class="stars">${stars(u.threat)}</div><div class="sub"><span class="un">loading...</span><span class="bty">${u.bounty||""}</span></div></div></button>`;
}
$("#gmw").innerHTML=people.filter(u=>u.kind==="mw").map(card).join("");
$("#ghvt").innerHTML=people.filter(u=>u.kind==="hvt").map(card).join("");
$("#gsv").innerHTML=people.filter(u=>u.kind==="sv").map(card).join("");
$("#gw").innerHTML=people.filter(u=>u.kind==="w").map(card).join("");
const EMPTY='<div class="empty">// NO TARGETS MATCH //</div>';
const BLANK='<div class="empty e-blank">// NO ONE LISTED YET //<small>add a Discord ID to CFG.watch in app.js</small></div>';
["#gmw","#gw","#gsv","#ghvt"].forEach(s=>{$(s).insertAdjacentHTML("beforeend",EMPTY+(s==="#gsv"||s==="#ghvt"?BLANK:""))});

function paint(u){
  const el=document.getElementById("u"+u.id);if(!el)return;
  el.className="card "+(u.s||"offline");
  el.querySelector(".nm").textContent=u.name||u.id;
  el.querySelector(".un").textContent=u.un||"not tracked yet";
  if(u.img)el.querySelector("img").src=u.img;
  el.querySelector(".sl").textContent=LABEL[u.s]||"OFFLINE";
}
function stats(){
  $("#hT").textContent=people.length;
  const on=people.filter(u=>u.s&&u.s!=="offline").length;
  $("#hO").textContent=on;document.title=(on?`(${on}) `:"")+"WANTED";
  $("#hS").textContent=CFG.servers.length;
}
async function refresh(){
  await Promise.all(people.map(async u=>{
    try{
      const r=await(await fetch("https://api.lanyard.rest/v1/users/"+u.id)).json();
      if(!r.success)throw 0;
      const d=r.data,du=d.discord_user,s=d.discord_status,a=(d.activities||[]).find(x=>x.type===4)||(d.activities||[])[0],name=du.global_name||du.username;
      const old=u.s;
      Object.assign(u,{name,un:"@"+du.username,s,act:a?(a.type===4?(a.state||"-"):a.name):"-",
        img:du.avatar?`https://cdn.discordapp.com/avatars/${u.id}/${du.avatar}.png?size=512`:AV});
      if(old===undefined)log(`${name} — ${LABEL[s]}`);
      else if(old!==s){log(`${name} → ${LABEL[s]}`,"al");if(s==="online")toast(`${name} is now ONLINE`)}
    }catch(e){u.un=u.un||"not tracked yet"}
    paint(u);
  }));
  stats();applyFlt();
  if(openId)fillFile(byId(openId));
}

/* ---------- case file popup ---------- */
let openId=null,lastFocus=null;
function fillFile(u){
  const f=$(".file");f.className="file "+(u.s||"offline")+" "+u.kind;
  const mw=u.kind==="mw"||u.kind==="hvt",n=Math.min(10,Math.max(1,u.threat||(mw?Math.max(10-u.rank,6):4)));
  $("#mi").src=u.img||AV;
  $("#mr").textContent=(TN[u.kind]||"WANTED")+" #"+pad(u.rank);
  $("#mk").textContent=u.kind==="hvt"?"PRIORITY ONE":"CASE #"+pad(u.rank);
  $("#mn").textContent=u.name||u.id;
  $("#mu").textContent=(u.un?u.un+" · ":"")+u.id;
  $("#ms").textContent=LABEL[u.s]||"OFFLINE";$("#ms").className="stx";
  $("#mb").textContent=u.bounty||"—";
  $("#ma").textContent=u.act||"-";
  const th=$("#mh");if(th.dataset.n!==String(n)){th.dataset.n=n;th.innerHTML=stars(n)+`<small>${n}/10</small>`}
  $("#mwhy").textContent=u.reason||"No details. Classified.";
  const ch=u.charges||[...new Set([CHARGES[u.rank%CHARGES.length],CHARGES[(u.rank+2)%CHARGES.length]])];
  $("#mc").innerHTML="";ch.forEach(c=>{const li=document.createElement("li");li.textContent=c;$("#mc").appendChild(li)});
  $("#mo").href="https://discord.com/users/"+u.id;
}
function openFile(id){
  const u=byId(id);if(!u)return;
  openId=id;lastFocus=document.activeElement;$("#mh").dataset.n="";fillFile(u);
  if(coarse&&navigator.vibrate)navigator.vibrate(8);
  $("#modal").classList.add("on");$("#modal").setAttribute("aria-hidden","false");$("#mx").focus();
}
function closeFile(){
  if(!openId)return;openId=null;
  $("#modal").classList.remove("on");$("#modal").setAttribute("aria-hidden","true");
  if(lastFocus)lastFocus.focus();
}

function nav(d){
  const vis=people.filter(u=>!document.getElementById("u"+u.id).classList.contains("hid")),i=vis.findIndex(u=>u.id===openId);
  if(i<0||vis.length<2)return;
  const u=vis[(i+d+vis.length)%vis.length];openId=u.id;$("#mh").dataset.n="";fillFile(u);
  const f=$(".file");f.classList.remove("sw");void f.offsetWidth;f.classList.add("sw");
}
async function copyId(){
  const b=$("#mcp");
  try{await navigator.clipboard.writeText(openId)}catch(e){const t=document.createElement("textarea");t.value=openId;document.body.appendChild(t);t.select();try{document.execCommand("copy")}catch(_){}t.remove()}
  b.textContent="COPIED ✓";clearTimeout(b._t);b._t=setTimeout(()=>b.textContent="COPY ID",1400);
}

/* ---------- servers ---------- */
const srv=(s)=>`<a class="s${s.plug?" plug":""}" id="s${s.code}" href="https://discord.gg/${s.code}" target="_blank" rel="noopener">
  <img alt="" src="${AV}"><div><b>${s.label}</b><small>discord.gg/${s.code}</small></div><span class="go">${s.plug?"ENTER":"CONNECT"} &gt;</span></a>`;
$("#gs").innerHTML=CFG.servers.map(srv).join("");
CFG.servers.forEach(async s=>{
  try{
    const d=await(await fetch(`https://discord.com/api/v9/invites/${s.code}?with_counts=true`)).json(),el=document.getElementById("s"+s.code);
    if(d.guild){el.querySelector("b").textContent=d.guild.name;if(d.guild.icon)el.querySelector("img").src=`https://cdn.discordapp.com/icons/${d.guild.id}/${d.guild.icon}.png?size=128`}
    if(d.approximate_member_count)el.querySelector("small").textContent=`${d.approximate_presence_count} online / ${d.approximate_member_count} members`;
  }catch(e){}
});

/* ---------- music: autoplay, fallback sa tap, resume ---------- */
const au=new Audio();au.loop=true;au.preload="auto";au.src=CFG.music;au.volume=CFG.volume;
const topEl=$("#top"),mute=$("#mute"),vol=$("#vol");
let userOff=false,playing=false;vol.value=CFG.volume*100;
function ui(){const on=!au.paused&&!au.muted;playing=!au.paused;topEl.classList.toggle("off",!on);mute.textContent=on?"♪":"✕"}
function resume(){if(!userOff&&au.paused)au.play().then(ui).catch(()=>{})}
au.play().then(ui).catch(()=>{});
["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,resume,{passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)resume()});
au.addEventListener("pause",()=>{ui();if(!userOff&&!document.hidden)setTimeout(resume,400)});
au.addEventListener("ended",()=>{au.currentTime=0;resume()});
au.addEventListener("stalled",()=>{const t=au.currentTime;au.load();au.currentTime=t;resume()});
au.addEventListener("error",()=>{$("#npt").textContent="ADD music.mp3"});
mute.onclick=()=>{if(au.paused){userOff=false;au.muted=false;au.play().then(ui).catch(ui)}else{au.muted=!au.muted;userOff=au.muted;ui()}};
vol.oninput=()=>{au.volume=vol.value/100;if(au.volume>0){au.muted=false;userOff=false}ui()};
ui();

/* ---------- boot ---------- */
const BOOT=[["","Opening the list"],["","Finding the targets"],["","Loading the bounties"],["","Ready"]];
let ready=false,exited=false;
async function boot(){
  const el=$("#boot"),hex=()=>Math.floor(Math.random()*65535).toString(16).padStart(4,"0");
  for(let i=0;i<BOOT.length;i++){
    const d=document.createElement("div");el.appendChild(d);
    d.innerHTML=`${BOOT[i][1]}...`;
    await sleep(rm?0:170+Math.random()*160);
    d.innerHTML=`${BOOT[i][1]}`;
    const p=Math.round((i+1)/BOOT.length*100);$("#pbi").style.width=p+"%";$("#pbp").textContent=p+"%";$("#pbt").textContent=BOOT[i][1].toUpperCase().slice(0,28);
    while(el.children.length>10)el.firstChild.remove();
  }
  $("#pbt").textContent="ENTER";await sleep(rm?0:500);
  ready=true;if(playing)exit();else $("#enter").classList.add("show");
}
function exit(){
  if(exited)return;exited=true;
  $("#gate").classList.add("out");document.body.classList.add("live");
  setTimeout(()=>$("#gate").remove(),1100);
  go(location.hash.slice(1));initHero();refresh();setInterval(refresh,30000);
  countUp($("#hB"),TOTAL,money);typeTag();
}
$("#gate").addEventListener("click",()=>{userOff=false;au.muted=false;au.play().then(ui).catch(ui);if(ready)exit()});
log("Roster is live","al");stats();
boot();

/* ---------- red mouse trail: PC lang (mouse + fine pointer), wala sa mobile ---------- */
const tc=$("#trail");
if(fine&&!rm){
  const tx=tc.getContext("2d");let pts=[],parts=[];
  const tsize=()=>{const r=Math.min(devicePixelRatio||1,2);tc.width=innerWidth*r;tc.height=innerHeight*r;tx.setTransform(r,0,0,r,0,0)};
  tsize();addEventListener("resize",tsize);
  const addPt=(x,y)=>{pts.push({x,y,t:performance.now()});if(pts.length>60)pts.shift()};
  const burst=(x,y)=>{for(let i=0;i<14;i++){const a=Math.random()*6.283,v=1+Math.random()*3.5;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:performance.now(),s:2+Math.random()*3})}};
  document.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")addPt(e.clientX,e.clientY)},{passive:true});
  document.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")burst(e.clientX,e.clientY)},{passive:true});
  (function loop(now){
    tx.clearRect(0,0,innerWidth,innerHeight);
    pts=pts.filter(p=>now-p.t<600);tx.lineCap="round";tx.shadowColor="#ff1f2d";tx.shadowBlur=14;
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],k=1-(now-b.t)/600;if(Math.hypot(b.x-a.x,b.y-a.y)>160)continue;
      tx.strokeStyle=`rgba(255,31,45,${k})`;tx.lineWidth=1+k*5;tx.beginPath();tx.moveTo(a.x,a.y);tx.lineTo(b.x,b.y);tx.stroke()}
    parts=parts.filter(p=>now-p.t<700);
    for(const p of parts){const k=1-(now-p.t)/700;p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;tx.fillStyle=`rgba(255,60,70,${k})`;tx.fillRect(p.x,p.y,p.s*k+1,p.s*k+1)}
    requestAnimationFrame(loop);
  })(performance.now());
}else tc.remove();

/* ---------- hero: ASCII na nabubuo at umiiwas sa mouse ---------- */
const ptr={x:-999,y:-999,t:0};
const hc=$("#hero"),hx=hc.getContext("2d");let P=[],hw=0,hh=0,hS=6,hR=10,hgrad,hStart=0,rzT;
const RAMP=[[".",":","'"],["-","~","\""],["*","x","+"],["d","F","?"],["8","@","%"]];
const upd=e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.t=performance.now()};
document.addEventListener("pointermove",upd,{passive:true});
document.addEventListener("touchstart",e=>{if(e.touches[0])upd(e.touches[0])},{passive:true});
document.addEventListener("touchmove",e=>{if(e.touches[0])upd(e.touches[0])},{passive:true});
async function initHero(){
  try{await Promise.race([document.fonts.load("900 100px Orbitron"),document.fonts.load("700 20px 'JetBrains Mono'"),sleep(1500)])}catch(e){}
  const w=Math.round(Math.min(innerWidth*.8,700)),h=Math.round(w*(w<500?.3:.2)),dpr=Math.min(devicePixelRatio||1,2);
  hc.style.width=w+"px";hc.style.height=h+"px";hc.width=w*dpr;hc.height=h*dpr;hx.setTransform(dpr,0,0,dpr,0,0);hw=w;hh=h;
  const o=document.createElement("canvas");o.width=w;o.height=h;const ox=o.getContext("2d");
  let fs=h*.9;ox.font=`900 ${fs}px Orbitron, Impact, sans-serif`;
  fs*=Math.min(1,w*.97/ox.measureText("WANTED").width);ox.font=`900 ${fs}px Orbitron, Impact, sans-serif`;
  ox.textAlign="center";ox.textBaseline="middle";ox.fillStyle="#fff";ox.fillText("WANTED",w/2,h/2+fs*.04);
  const d=ox.getImageData(0,0,w,h).data;hS=Math.max(4,Math.round(w/130));hR=Math.round(hS*1.75);P=[];
  for(let y=0;y<h-hR/2;y+=hR)for(let x=0;x<w;x+=hS){
    let a=0,n=0;
    for(let yy=0;yy<hR;yy+=2)for(let xx=0;xx<hS;xx+=2){a+=d[(Math.min(h-1,y+yy)*w+Math.min(w-1,x+xx))*4+3];n++}
    const cov=a/n/255;if(cov<.2)continue;
    const b=Math.min(4,Math.floor(cov*5)),c=RAMP[b][Math.floor(Math.random()*3)];
    P.push(rm?{x,y,tx:x,ty:y,vx:0,vy:0,d:0,b,c}:{x:Math.random()*w,y:Math.random()*h,tx:x,ty:y,vx:0,vy:0,d:Math.random()*1.4,b,c});
  }
  hgrad=hx.createLinearGradient(0,0,0,h);hgrad.addColorStop(0,"#ffd9dc");hgrad.addColorStop(.4,"#ff3b47");hgrad.addColorStop(1,"#b3000d");
  hStart=performance.now();
}
function drawHero(now){
  if(!P.length)return;
  const r=hc.getBoundingClientRect(),mx=ptr.x-r.left,my=ptr.y-r.top,act=now-ptr.t<1800,R=Math.max(50,hh*.55),R2=R*R,t=(now-hStart)/1000,sw=((now/2400)%1.7-.35)*hw,hot=[];
  hx.clearRect(0,0,hw,hh);hx.font=`700 ${(hS*1.6).toFixed(1)}px "JetBrains Mono",ui-monospace,monospace`;hx.textBaseline="top";hx.fillStyle=hgrad;
  for(const p of P){
    if(t>p.d){
      let ax=(p.tx-p.x)*.075,ay=(p.ty-p.y)*.075;
      if(act){const dx=p.x-mx,dy=p.y-my,q=dx*dx+dy*dy;if(q<R2){const dd=Math.sqrt(q)||1,f=(1-dd/R)*3.4;ax+=dx/dd*f;ay+=dy/dd*f}}
      p.vx=(p.vx+ax)*.82;p.vy=(p.vy+ay)*.82;p.x+=p.vx;p.y+=p.vy;
    }
    if(Math.random()<.004)p.c=RAMP[p.b][Math.floor(Math.random()*3)];
    if(Math.abs(p.x-sw)<10&&t>2)hot.push(p.x,p.y,p.c);else hx.fillText(p.c,p.x,p.y);
  }
  if(hot.length){hx.fillStyle="#fff";for(let i=0;i<hot.length;i+=3)hx.fillText(hot[i+2],hot[i],hot[i+1])}
}
addEventListener("resize",()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(exited)initHero()},250)});
(function hl(now){if($("#home").classList.contains("on"))drawHero(now);requestAnimationFrame(hl)})(performance.now());

/* ---------- bg.gif: ilalagay lang kapag nahanap ---------- */
const bgi=new Image();bgi.onload=()=>document.documentElement.classList.add("hasbg");bgi.src="bg.gif";


/* =================== v4 extras =================== */

/* ---------- toast ---------- */
function toast(msg){
  const box=$("#toasts"),el=document.createElement("div");el.className="toast";
  el.innerHTML='<b style="color:var(--red)">[ALERT]</b> ';el.append(msg);box.appendChild(el);
  while(box.children.length>3)box.firstChild.remove();
  setTimeout(()=>{el.classList.add("out");setTimeout(()=>el.remove(),450)},4200);
}

/* ---------- search + online-only filter ---------- */
const flt={q:"",on:false};
function applyFlt(){
  const q=flt.q.trim().toLowerCase();
  people.forEach(u=>{
    const el=document.getElementById("u"+u.id);if(!el)return;
    const hay=((u.name||"")+" "+(u.un||"")+" "+u.id).toLowerCase();
    el.classList.toggle("hid",!((!q||hay.includes(q))&&(!flt.on||(u.s&&u.s!=="offline"))));
  });
  ["#gmw","#gw","#gsv","#ghvt"].forEach(s=>{const g=$(s);g.classList.toggle("blank",!g.querySelector(".card"));g.classList.toggle("none",!!g.querySelector(".card")&&!g.querySelector(".card:not(.hid)"))});
}
function syncQ(v){flt.q=v;$$(".q").forEach(i=>{if(i.value!==v)i.value=v});applyFlt()}
$$(".q").forEach(i=>i.addEventListener("input",()=>syncQ(i.value)));
$$("[data-f]").forEach(b=>b.addEventListener("click",()=>{
  flt.on=!flt.on;$$("[data-f]").forEach(c=>{c.classList.toggle("on",flt.on);c.setAttribute("aria-pressed",flt.on)});applyFlt();
}));

/* ---------- count-up + typewriter ---------- */
const money=n=>{n=Math.round(n);return"₱"+(n>=1e6?(n/1e6).toFixed(2).replace(/\.?0+$/,"")+"M":n>=1e3?Math.round(n/1e3)+"K":n)};
function countUp(el,to,fmt,ms=1500){
  if(rm){el.textContent=fmt(to);return}
  const t0=performance.now();
  (function f(n){const k=Math.min(1,(n-t0)/ms);el.textContent=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0);
}
function typeTag(){
  if(rm)return;const el=$(".tagl"),t=el.textContent;el.style.minHeight=el.offsetHeight+"px";el.textContent="";
  let i=0;const id=setInterval(()=>{el.textContent=t.slice(0,++i);if(i>=t.length)clearInterval(id)},32);
}

/* ---------- ticker + glitch titles ---------- */
(function(){
  const items=["DEAD OR ALIVE","NO ESCAPE","NO MERCY","THREE CROSSES"];
  const g=items.map(t=>`<span><b>✝</b> ${t}</span>`).join("").repeat(2);
  $("#tk").innerHTML=g+g;
  $$(".brand,.head h2").forEach(e=>{e.classList.add("gl");e.dataset.t=e.textContent});
})();

/* ---------- card tilt + spotlight (PC lang) ---------- */
if(fine&&!rm){
  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse"||!e.target.closest)return;
    const c=e.target.closest(".card");if(!c)return;
    const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    c.style.setProperty("--mx",(px*100).toFixed(1)+"%");c.style.setProperty("--my",(py*100).toFixed(1)+"%");
    c.style.setProperty("--rx",((.5-py)*8).toFixed(2)+"deg");c.style.setProperty("--ry",((px-.5)*10).toFixed(2)+"deg");
  },{passive:true});
  document.addEventListener("pointerout",e=>{
    const c=e.target.closest&&e.target.closest(".card");
    if(c&&!c.contains(e.relatedTarget)){c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")}
  });
}

/* ---------- red embers sa background (magaan, gumagana sa phone at PC) ---------- */
const fx=$("#fx");
if(rm)fx.remove();else{
  const fc=fx.getContext("2d"),N=coarse?16:42;let E=[],fw=0,fh=0;
  const mk=init=>({x:Math.random()*fw,y:init?Math.random()*fh:fh+10,r:.6+Math.random()*1.8,vy:.25+Math.random()*.7,ph:Math.random()*6.28,sp:.4+Math.random()*1.2,a:.25+Math.random()*.55});
  const fs=()=>{const r=Math.min(devicePixelRatio||1,2),nw=innerWidth,changed=nw!==fw;fw=nw;fh=innerHeight;fx.width=fw*r;fx.height=fh*r;fc.setTransform(r,0,0,r,0,0);if(!E.length||changed)E=Array.from({length:N},()=>mk(true))};
  fs();addEventListener("resize",fs);
  (function f(now){
    fc.clearRect(0,0,fw,fh);const t=now/1000;
    for(const e of E){
      e.y-=e.vy;e.x+=Math.sin(t*e.sp+e.ph)*.35;if(e.y<-10)Object.assign(e,mk(false));
      const k=Math.max(0,Math.min(1,e.y/fh)),al=e.a*(.4+.6*k)*(.7+.3*Math.sin(t*3+e.ph));
      fc.fillStyle=`rgba(255,${(60+k*70)|0},50,${al.toFixed(3)})`;fc.beginPath();fc.arc(e.x,e.y,e.r,0,6.283);fc.fill();
    }
    requestAnimationFrame(f);
  })(performance.now());
}
