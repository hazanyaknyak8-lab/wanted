const CFG={
  music:"music.mp3",          
  musicTitle:"NOW PLAYING",
  volume:0.5,

  mostWanted:[
    {id:"1530686788824469646",bounty:"₱1,000,000",threat:10,reason:"hari ng lahat"},
    {id:"1499499066932068454",bounty:"₱750,000",threat:9,reason:""},
    {id:"1556911422091427910",bounty:"₱600,000",threat:8,reason:""},
    {id:"1544422656852627496",bounty:"₱500,000",threat:8,reason:""},
    {id:"1546289969960587270",bounty:"₱450,000",threat:7,reason:"nanununtok ng tanga, tinatapon ang mga basura kagaya mo"},
    {id:"1441623190412726355",bounty:"₱400,000",threat:7,reason:"."},
    {id:"1147462845315952690",bounty:"₱350,000",threat:6,reason:""}
  ],
  wanted:[
    {id:"909977852378763264",bounty:"₱150,000",threat:4,reason:""},
    {id:"1435619294229561434",bounty:"₱120,000",threat:4,reason:""}
  ],
  servers:[
    {label:"MAIN_SERVER",code:"jG7qCDJqFt"},
    {label:"THE_PLUG",code:"XNVgUyqUAY",plug:true}
  ]
};
const CHARGES=["tumitira ng pwd"];


const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,coarse=matchMedia("(pointer:coarse)").matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),pad=n=>String(n).padStart(2,"0");
const AV="https://cdn.discordapp.com/embed/avatars/0.png";
const LABEL={online:"ONLINE",idle:"IDLE",dnd:"DO NOT DISTURB",offline:"OFFLINE"};
const people=[...CFG.mostWanted.map((u,i)=>({...u,kind:"mw",rank:i+1})),...CFG.wanted.map((u,i)=>({...u,kind:"w",rank:i+1}))];
const byId=id=>people.find(u=>u.id===id);
$("#npt").textContent=CFG.musicTitle;

/* ---------- views (walang page scroll) ---------- */
const VIEWS=["home","mw","w","srv"];
function go(v){
  if(!VIEWS.includes(v))v="home";
  $$(".view").forEach(e=>e.classList.toggle("on",e.id===v));
  $$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  history.replaceState(null,"","#"+v);
}
document.addEventListener("click",e=>{
  const n=e.target.closest("[data-v],[data-go]");if(n){go(n.dataset.v||n.dataset.go);return}
  const c=e.target.closest(".card");if(c){openFile(c.dataset.id);return}
  if(e.target.id==="modal"||e.target.closest("#mx"))closeFile();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeFile();
  else if(!$("#modal").classList.contains("on")&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){
    const i=VIEWS.findIndex(v=>$("#"+v).classList.contains("on"));go(VIEWS[(i+(e.key==="ArrowRight"?1:VIEWS.length-1))%VIEWS.length])}
});

/* ---------- log ---------- */
function log(msg,cls){
  const el=$("#log"),d=document.createElement("div");
  d.innerHTML=`<span>${new Date().toTimeString().slice(0,8)}</span>`;d.append(msg);if(cls)d.className=cls;
  el.appendChild(d);while(el.children.length>5)el.firstChild.remove();
}
setInterval(()=>{$("#clk").textContent=new Date().toTimeString().slice(0,8)},1000);

/* ---------- cards ---------- */
function card(u){
  return `<button class="card offline" id="u${u.id}" data-id="${u.id}" aria-label="Open case file">
  <div class="ph"><img alt="" src="${AV}"><b class="rk">#${pad(u.rank)}</b><span class="stt"><i class="dot"></i><span class="stx sl">OFFLINE</span></span></div>
  <div class="info"><div class="nm">${u.id}</div><div class="sub"><span class="un">loading...</span><span class="bty">${u.bounty||""}</span></div></div></button>`;
}
$("#gmw").innerHTML=CFG.mostWanted.length?people.filter(u=>u.kind==="mw").map(card).join(""):"";
$("#gw").innerHTML=people.filter(u=>u.kind==="w").map(card).join("");

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
  $("#hO").textContent=people.filter(u=>u.s&&u.s!=="offline").length;
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
      if(old===undefined)log(`[SYNC] ${name} :: ${LABEL[s]}`);
      else if(old!==s)log(`[ALERT] ${name} -> ${LABEL[s]}`,"al");
    }catch(e){u.un=u.un||"not tracked yet"}
    paint(u);
  }));
  stats();
  if(openId)fillFile(byId(openId));
}

/* ---------- case file popup ---------- */
let openId=null,lastFocus=null;
function fillFile(u){
  const f=$(".file");f.className="file "+(u.s||"offline");
  const mw=u.kind==="mw",n=Math.min(10,Math.max(1,u.threat||(mw?Math.max(10-u.rank,6):4)));
  $("#mi").src=u.img||AV;
  $("#mr").textContent=(mw?"MOST WANTED":"WANTED")+" #"+pad(u.rank);
  $("#mk").textContent=`CASE FILE // ${mw?"TARGET":"SUSPECT"}_${pad(u.rank)}.dat`;
  $("#mn").textContent=u.name||u.id;
  $("#mu").textContent=(u.un?u.un+" · ":"")+u.id;
  $("#ms").textContent=LABEL[u.s]||"OFFLINE";$("#ms").className="stx";
  $("#mb").textContent=u.bounty||"—";
  $("#ma").textContent=u.act||"-";
  $("#mh").innerHTML='<i class="f"></i>'.repeat(n)+"<i></i>".repeat(10-n);
  $("#mwhy").textContent=u.reason||"No details. Classified.";
  const ch=u.charges||[...new Set([CHARGES[u.rank%CHARGES.length],CHARGES[(u.rank+2)%CHARGES.length]])];
  $("#mc").innerHTML="";ch.forEach(c=>{const li=document.createElement("li");li.textContent=c;$("#mc").appendChild(li)});
  $("#mo").href="https://discord.com/users/"+u.id;
}
function openFile(id){
  const u=byId(id);if(!u)return;
  openId=id;lastFocus=document.activeElement;fillFile(u);
  $("#modal").classList.add("on");$("#modal").setAttribute("aria-hidden","false");$("#mx").focus();
}
function closeFile(){
  if(!openId)return;openId=null;
  $("#modal").classList.remove("on");$("#modal").setAttribute("aria-hidden","true");
  if(lastFocus)lastFocus.focus();
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
const BOOT=[["BIOS","wanted-os kernel 6.6.1-red"],["NET","routing through 7 proxy nodes"],["SEC","bypassing firewall"],["SYS","mounting /roster/most_wanted"],
["API","connecting presence feed"],["AUD","initializing audio engine"],["SEC","decrypting target dossiers"],["SYS","all systems nominal"]];
let ready=false,exited=false;
async function boot(){
  const el=$("#boot"),hex=()=>Math.floor(Math.random()*65535).toString(16).padStart(4,"0");
  for(let i=0;i<BOOT.length;i++){
    const d=document.createElement("div");el.appendChild(d);
    d.innerHTML=`<span class="k">[ .... ]</span> ${BOOT[i][0]} ${BOOT[i][1]} <span class="k">0x${hex()}</span>`;
    await sleep(rm?0:170+Math.random()*160);
    d.innerHTML=`<span class="k">[ OK ]</span> ${BOOT[i][0]} ${BOOT[i][1]}`;
    const p=Math.round((i+1)/BOOT.length*100);$("#pbi").style.width=p+"%";$("#pbp").textContent=p+"%";$("#pbt").textContent=BOOT[i][1].toUpperCase().slice(0,28);
    while(el.children.length>10)el.firstChild.remove();
  }
  $("#pbt").textContent="ACCESS GRANTED";await sleep(rm?0:500);
  ready=true;if(playing)exit();else $("#enter").classList.add("show");
}
function exit(){
  if(exited)return;exited=true;
  $("#gate").classList.add("out");document.body.classList.add("live");
  setTimeout(()=>$("#gate").remove(),1100);
  go(location.hash.slice(1));initHero();refresh();setInterval(refresh,30000);
}
$("#gate").addEventListener("click",()=>{userOff=false;au.muted=false;au.play().then(ui).catch(ui);if(ready)exit()});
log("root@wanted:~$ tail -f roster.log","al");log("[SYS] feed connected");stats();
boot();

/* ---------- red mouse trail ---------- */
const tc=$("#trail"),tx=tc.getContext("2d");let pts=[],parts=[];
function tsize(){const r=Math.min(devicePixelRatio||1,2);tc.width=innerWidth*r;tc.height=innerHeight*r;tx.setTransform(r,0,0,r,0,0)}
tsize();addEventListener("resize",tsize);
const addPt=(x,y)=>{pts.push({x,y,t:performance.now()});if(pts.length>60)pts.shift()};
const burst=(x,y)=>{for(let i=0;i<14;i++){const a=Math.random()*6.283,v=1+Math.random()*3.5;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:performance.now(),s:2+Math.random()*3})}};
if(!rm){
  document.addEventListener("pointermove",e=>addPt(e.clientX,e.clientY),{passive:true});
  document.addEventListener("pointerdown",e=>burst(e.clientX,e.clientY),{passive:true});
  document.addEventListener("touchmove",e=>{const t=e.touches[0];if(t)addPt(t.clientX,t.clientY)},{passive:true});
  (function loop(now){
    tx.clearRect(0,0,innerWidth,innerHeight);
    pts=pts.filter(p=>now-p.t<600);tx.lineCap="round";tx.shadowColor="#ff1f2d";tx.shadowBlur=14;
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],k=1-(now-b.t)/600;if(Math.hypot(b.x-a.x,b.y-a.y)>160)continue;
      tx.strokeStyle=`rgba(255,31,45,${k})`;tx.lineWidth=1+k*5;tx.beginPath();tx.moveTo(a.x,a.y);tx.lineTo(b.x,b.y);tx.stroke()}
    parts=parts.filter(p=>now-p.t<700);
    for(const p of parts){const k=1-(now-p.t)/700;p.x+=p.vx;p.y+=p.vy;p.vx*=.96;p.vy*=.96;tx.fillStyle=`rgba(255,60,70,${k})`;tx.fillRect(p.x,p.y,p.s*k+1,p.s*k+1)}
    requestAnimationFrame(loop);
  })(performance.now());
}

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
