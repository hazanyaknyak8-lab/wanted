const CFG={
  music:"music.mp3",
  musicTitle:"Now playing",
  volume:0.5,
  owner:"1530686788824469646",

  mostWanted:[
    {id:"1530686788824469646",bounty:"₱69,000,000",threat:10,reason:"hari ng lahat"},
    {id:"1147462845315952690",bounty:"₱350,000",threat:6,reason:"alagad ni dope"},
    {id:"1499499066932068454",bounty:"₱750,000",threat:9,reason:""},
    {id:"1556911422091427910",bounty:"₱600,000",threat:8,reason:""},
    {id:"1544422656852627496",bounty:"₱500,000",threat:8,reason:""},
    {id:"1546289969960587270",bounty:"₱450,000",threat:7,reason:"nanununtok ng tanga"},
    {id:"1441623190412726355",bounty:"₱400,000",threat:7,reason:"."},
  ],
  wanted:[
    {id:"909977852378763264",bounty:"₱1200,000",threat:4,reason:""},
    {id:"1435619294229561434",bounty:"₱120,000",threat:4,reason:"pinakamabaho"},
    {id:"1274984004780556371",bounty:"₱100,000",threat:4,reason:""},
    {id:"1502126548096909353",bounty:"₱321,000",threat:4,reason:"nagdadamo"},
  ],
  servers:[
    {label:"MAIN SERVER",code:"jG7qCDJqFt"},
    {label:"PLUG",code:"XNVgUyqUAY",plug:true},
    {label:"PLUG",code:"wrightontop",plug:true}
  ]
};
const CHARGES=["nagpapasabog"];


const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches,coarse=matchMedia("(pointer:coarse)").matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),pad=n=>String(n).padStart(2,"0");
const AV="https://cdn.discordapp.com/embed/avatars/0.png";
const LABEL={online:"Online",idle:"Idle",dnd:"Do not disturb",offline:"Offline"};
const people=[...CFG.mostWanted.map((u,i)=>({...u,kind:"mw",rank:i+1})),...CFG.wanted.map((u,i)=>({...u,kind:"w",rank:i+1}))];
const byId=id=>people.find(u=>u.id===id);
const parseB=s=>+String(s||"").replace(/\D/g,"")||0,TOTAL=people.reduce((a,u)=>a+parseB(u.bounty),0);
const peso=s=>{const n=parseB(s);return n?"₱"+n.toLocaleString("en-US"):""};
$("#npt").textContent=CFG.musicTitle;

/* ---------- views ---------- */
const VIEWS=["home","mw","w","hos","srv"];
const TN={mw:"Most wanted",w:"Wanted"};
const CROSS='<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z"/></svg>';
const stars=t=>{const n=Math.min(10,Math.max(1,t||1));return Array.from({length:5},(_,k)=>`<i class="st ${n>=2*k+2?"f":n===2*k+1?"h":""}"></i>`).join("")};
function go(v){
  if(!VIEWS.includes(v))v="home";
  $$(".view").forEach(e=>e.classList.toggle("on",e.id===v));
  $$("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  history.replaceState(null,"","#"+v);moveInd();
  const ab=$("#nav button.on");if(ab&&ab.scrollIntoView)try{ab.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"})}catch(e){}
  const vw=document.getElementById(v);if(vw)vw.scrollTop=0;
}
document.addEventListener("click",e=>{
  const n=e.target.closest("[data-v],[data-go]");if(n){go(n.dataset.v||n.dataset.go);return}
  const nb=e.target.closest("[data-nav]");if(nb){nav(+nb.dataset.nav);return}
  if(e.target.closest("#mcp")){copyId();return}
  const c=e.target.closest(".card");if(c){c.dataset.h!==undefined?openHos(+c.dataset.h):openFile(c.dataset.id);return}
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

/* popups: i-lock ang likod habang bukas */
const lockBg=on=>{$("main").inert=on;$("#top").inert=on};

/* ---------- log ---------- */
function log(msg,cls){
  const el=$("#log"),d=document.createElement("div");
  d.innerHTML=`<span>${new Date().toTimeString().slice(0,8)}</span>`;d.append(msg);if(cls)d.className=cls;
  el.appendChild(d);while(el.children.length>5)el.firstChild.remove();
}
setInterval(()=>{$("#clk").textContent=new Date().toTimeString().slice(0,8)},1000);

/* ---------- cards ---------- */
const cn=u=>{const n=(u.name||"").trim();return /[\p{L}\p{N}]{2}/u.test(n)?n:(u.un||"").replace("@","")||u.id};
const IMG=`<img alt="" src="${AV}" onload="this.classList.add('ok')" onerror="this.classList.add('ok')">`;
function card(u){
  const lead=u.kind==="mw"&&u.rank===1;
  return `<button class="card offline ${u.kind}${lead?" lead":""}" id="u${u.id}" data-id="${u.id}" aria-label="Open case file">
  <div class="ph">${IMG}<b class="rk">#${pad(u.rank)}</b><span class="stt"><i class="dot"></i><span class="stx sl">Offline</span></span></div>
  <div class="info">${lead?`<div class="kl">${CROSS}King of the list</div>`:""}<div class="nm">${u.id}</div><div class="mrow"><div class="stars">${stars(u.threat)}</div><span class="bty">${peso(u.bounty)}</span></div><span class="un">loading…</span></div></button>`;
}
$("#gmw").innerHTML=people.filter(u=>u.kind==="mw").map(card).join("");
$("#gw").innerHTML=people.filter(u=>u.kind==="w").map(card).join("");
const EMPTY='<div class="empty">No targets match<small>try another name or turn off the filter</small></div>';
["#gmw","#gw"].forEach(s=>{$(s).insertAdjacentHTML("beforeend",EMPTY)});

function setImg(im,src){if(im.getAttribute("src")!==src){im.classList.remove("ok");im.src=src}}
function paint(u){
  const el=document.getElementById("u"+u.id);if(!el)return;
  ["online","idle","dnd","offline"].forEach(c=>el.classList.remove(c));el.classList.add(u.s||"offline");
  el.querySelector(".nm").textContent=cn(u);
  el.querySelector(".un").textContent=u.un||"not tracked yet";
  if(u.img)setImg(el.querySelector("img"),u.img);
  el.querySelector(".sl").textContent=LABEL[u.s]||"Offline";
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
      else if(old!==s){log(`${name} → ${LABEL[s]}`,"al");if(s==="online")toast(`${name} is now online`)}
    }catch(e){u.un=u.un||"not tracked yet"}
    paint(u);
  }));
  stats();applyFlt();
  if(openId)fillFile(byId(openId));
}

/* ---------- case file popup ---------- */
let openId=null,lastFocus=null;
function fillFile(u){
  const f=$(".file");f.className="file "+(u.s||"offline")+" "+u.kind+(u.kind==="mw"&&u.rank===1?" lead":"");
  const mw=u.kind==="mw"||u.kind==="hvt",n=Math.min(10,Math.max(1,u.threat||(mw?Math.max(10-u.rank,6):4)));
  setImg($("#mi"),u.img||AV);
  $("#mr").textContent=(TN[u.kind]||"Wanted")+" #"+pad(u.rank);
  $("#mk").textContent=u.kind==="hvt"?"Priority one":"Case #"+pad(u.rank);
  $("#mn").textContent=cn(u);
  $("#mu").textContent=(u.un?u.un+" · ":"")+u.id;
  $("#ms").textContent=LABEL[u.s]||"Offline";$("#ms").className="stx";
  $("#mb").textContent=peso(u.bounty)||"—";
  $("#ma").textContent=u.act||"-";
  const th=$("#mh");if(th.dataset.n!==String(n)){th.dataset.n=n;th.innerHTML=stars(n)+`<small>${n}/10</small>`}
  $("#mwhy").textContent=u.reason||"Classified. Walang detalye.";
  const ch=u.charges||[...new Set([CHARGES[u.rank%CHARGES.length],CHARGES[(u.rank+2)%CHARGES.length]])];
  $("#mc").innerHTML="";ch.forEach(c=>{const li=document.createElement("li");li.textContent=c;$("#mc").appendChild(li)});
  $("#mo").href="https://discord.com/users/"+u.id;
}
function openFile(id){
  const u=byId(id);if(!u)return;
  openId=id;lastFocus=document.activeElement;$("#mh").dataset.n="";fillFile(u);
  if(coarse&&navigator.vibrate)navigator.vibrate(8);
  lockBg(true);
  $("#modal").classList.add("on");$("#modal").setAttribute("aria-hidden","false");$("#mx").focus({preventScroll:true});
}
function closeFile(){
  if(!openId)return;openId=null;
  $("#modal").classList.remove("on");$("#modal").setAttribute("aria-hidden","true");
  if(hOpen===null)lockBg(false);
  if(lastFocus)lastFocus.focus({preventScroll:true});
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
  b.textContent="Copied";clearTimeout(b._t);b._t=setTimeout(()=>b.textContent="Copy ID",1400);
}

/* ---------- servers ---------- */
const srv=(s)=>`<a class="s${s.plug?" plug":""}" id="s${s.code}" href="https://discord.gg/${s.code}" target="_blank" rel="noopener">
  <img alt="" src="${AV}"><div><b>${s.label}</b><small>discord.gg/${s.code}</small></div><span class="go">${s.plug?"Join":"Join server"}</span></a>`;
$("#gs").innerHTML=CFG.servers.filter(s=>!s.plug).map(srv).join("")+'<div class="plh">Plugs</div>'+CFG.servers.filter(s=>s.plug).map(srv).join("");
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
const paintVol=()=>vol.style.setProperty("--v",vol.value+"%");
function ui(){const on=!au.paused&&!au.muted;playing=!au.paused;topEl.classList.toggle("off",!on);mute.setAttribute("aria-pressed",String(!on));paintVol()}
function resume(){if(!userOff&&au.paused)au.play().then(ui).catch(()=>{})}
au.play().then(ui).catch(()=>{});
["pointerdown","keydown","touchstart"].forEach(ev=>addEventListener(ev,resume,{passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)resume()});
au.addEventListener("pause",()=>{ui();if(!userOff&&!document.hidden)setTimeout(resume,400)});
au.addEventListener("ended",()=>{au.currentTime=0;resume()});
au.addEventListener("stalled",()=>{const t=au.currentTime;au.load();au.currentTime=t;resume()});
au.addEventListener("error",()=>{$("#npt").textContent="Add music.mp3"});
mute.onclick=()=>{if(au.paused){userOff=false;au.muted=false;au.play().then(ui).catch(ui)}else{au.muted=!au.muted;userOff=au.muted;ui()}};
vol.oninput=()=>{au.volume=vol.value/100;if(au.volume>0){au.muted=false;userOff=false}ui()};
ui();

/* ---------- boot: hintayin ang font para walang flash ng maling letra ---------- */
let ready=false,exited=false;
async function boot(){
  try{await Promise.race([document.fonts.load('400 100px "Pirata One"'),sleep(2200)])}catch(e){}
  document.documentElement.classList.add("fr");
  await sleep(rm?0:900);ready=true;$("#enter").classList.add("show");
}
function exit(){
  if(exited)return;exited=true;
  $("#gate").classList.add("out");document.body.classList.add("live");
  setTimeout(()=>$("#gate").remove(),1000);
  go(location.hash.slice(1));refresh();setInterval(refresh,30000);
  countUp($("#hB"),TOTAL,money);
}
$("#gate").addEventListener("click",()=>{userOff=false;au.muted=false;au.play().then(ui).catch(ui);if(ready)exit()});
log("Roster is live","al");stats();
boot();

/* ---------- bg.gif: ilalagay lang kapag nahanap ---------- */
const bgi=new Image();bgi.onload=()=>document.documentElement.classList.add("hasbg");bgi.src="bg.gif";

/* ---------- toast ---------- */
function toast(msg){
  const box=$("#toasts"),el=document.createElement("div");el.className="toast";el.append(msg);box.appendChild(el);
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
  ["#gmw","#gw"].forEach(s=>{const g=$(s);g.classList.toggle("none",!!g.querySelector(".card")&&!g.querySelector(".card:not(.hid)"))});
}
function syncQ(v){flt.q=v;$$(".q").forEach(i=>{if(i.value!==v)i.value=v});applyFlt()}
$$(".q").forEach(i=>i.addEventListener("input",()=>syncQ(i.value)));
$$("[data-f]").forEach(b=>b.addEventListener("click",()=>{
  flt.on=!flt.on;$$("[data-f]").forEach(c=>{c.classList.toggle("on",flt.on);c.setAttribute("aria-pressed",flt.on)});applyFlt();
}));

/* ---------- count-up ---------- */
const money=n=>{n=Math.round(n);return"₱"+(n>=1e6?(n/1e6).toFixed(2).replace(/\.?0+$/,"")+"M":n>=1e3?Math.round(n/1e3)+"K":n)};
function countUp(el,to,fmt,ms=1400){
  if(rm){el.textContent=fmt(to);return}
  const t0=performance.now();
  (function f(n){const k=Math.min(1,(n-t0)/ms);el.textContent=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0);
}

/* ---------- nav indicator ---------- */
function moveInd(){const b=$("#nav button.on"),i=$("#nvi");if(!b||!i)return;i.style.width=b.offsetWidth+"px";i.style.transform=`translateX(${b.offsetLeft}px)`}
addEventListener("resize",moveInd);document.fonts&&document.fonts.ready.then(moveInd);setTimeout(moveInd,300);

/* ---------- HOS (hostage): ikaw lang ang nagpo-post, via js/hostages.js ---------- */
const HL=Array.isArray(window.HOS)?window.HOS:[],esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LOCK='<svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const hmed=(p,full)=>p.video?`<video src="${esc(p.video)}${full?"":"#t=0.6"}" playsinline ${full?"controls autoplay loop":'muted preload="metadata"'}></video>`:p.image?`<img alt="" src="${esc(p.image)}">`:`<div class="hx">✝</div>`;
const ghos=$("#ghos");
ghos.innerHTML=HL.map((p,i)=>`<button class="card hos" data-h="${i}" aria-label="Open sealed post"><div class="ph">${hmed(p,false)}<b class="rk">H-${pad(i+1)}</b><span class="lk">${LOCK}</span></div><div class="info"><div class="nm">Sealed post</div><span class="un">Tap to open</span></div></button>`).join("")+'<div class="empty">Wala pang hostage<small>soon</small></div>';
ghos.classList.toggle("none",!HL.length);
let owner=null;
async function getOwner(){if(owner)return owner;try{const r=await(await fetch("https://api.lanyard.rest/v1/users/"+CFG.owner)).json(),d=r.data.discord_user;owner={name:d.global_name||d.username,img:d.avatar?`https://cdn.discordapp.com/avatars/${CFG.owner}/${d.avatar}.png?size=64`:AV}}catch(e){owner={name:"OWNER",img:AV}}return owner}
let hOpen=null;
const XB='<button class="x" id="hx" aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
function openHos(i){
  const p=HL[i];if(!p)return;hOpen=i;lastFocus=document.activeElement;
  $("#hbox").innerHTML=`${XB}<div class="seal"><div class="lk big">${LOCK}</div><div class="mt">H-${pad(i+1)} · Sealed</div><p>buksan mo para makita mo, tanginamo.</p><button class="btn" id="unseal">Unseal</button></div>`;
  lockBg(true);
  $("#hm").classList.add("on");$("#hm").setAttribute("aria-hidden","false");
  if(coarse&&navigator.vibrate)navigator.vibrate(8);
  $("#unseal").onclick=async()=>{
    const o=await getOwner();if(hOpen!==i)return;
    $("#hbox").innerHTML=`${XB}<div class="rev">${p.video||p.image?`<div class="hmed">${hmed(p,true)}</div>`:""}<div class="hbd"><div class="mt">H-${pad(i+1)}${p.date?" · "+esc(p.date):""}</div>${p.name?`<div class="mn">${esc(p.name)}</div>`:""}${p.note?`<p class="hn">${esc(p.note)}</p>`:""}<div class="by"><img alt="" src="${o.img}"><span>Posted by <b>${esc(o.name)}</b></span></div></div></div>`;
    $("#hx").onclick=closeHos;
  };
  $("#hx").onclick=closeHos;
  $("#unseal").focus({preventScroll:true});
}
function closeHos(){
  hOpen=null;$("#hm").classList.remove("on");$("#hm").setAttribute("aria-hidden","true");
  if(!openId)lockBg(false);
  if(lastFocus)lastFocus.focus({preventScroll:true});
  setTimeout(()=>{if(hOpen===null)$("#hbox").innerHTML=""},350);
}
$("#hm").addEventListener("click",e=>{if(e.target.id==="hm")closeHos()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&hOpen!==null)closeHos()});
