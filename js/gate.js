/* WANTED v15 — gate.js : boot sequence ng loading screen */
(()=>{
"use strict";
const g=document.getElementById("gate");if(!g)return;
const $=id=>document.getElementById(id);
const log=$("glog"),bar=$("gbar"),pct=$("gpct"),clk=$("gclk"),enter=$("enter");
const rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const slug=typeof DEEP!=="undefined"?DEEP:"";
const n=typeof people!=="undefined"?people.length:0;
if(slug&&enter)enter.textContent="TAP TO OPEN CASE FILE";

const lines=[
  ["booting wanted.exe","ok"],
  ["linking lanyard.rest","ok"],
  ["pulling bounty ledger","ok"],
  [n?n+" targets in the roster":"reading roster","ok"],
  ["scanning hideouts","ok"],
  ...(slug?[["locating case file @"+slug,"found"]]:[]),
  ["decrypting case files","ok"],
  ["access granted","granted"]
];
function add(l){
  const d=document.createElement("div");
  const a=document.createElement("span");a.textContent="> ";
  const t=document.createTextNode(l[0]+" ");
  const e=document.createElement("em");e.textContent=l[1];
  d.append(a,t,e);log.appendChild(d);
  while(log.children.length>6)log.firstChild.remove();
}
const tick=()=>{if(!g.isConnected)return;clk.textContent=new Date().toTimeString().slice(0,8)};
tick();const ci=setInterval(()=>{if(!g.isConnected)clearInterval(ci);else tick()},1000);

const T=rm?1:2300,t0=performance.now();let shown=0,done=false;
function step(now){
  if(!g.isConnected)return;
  const k=Math.min(1,(now-t0)/T),p=1-Math.pow(1-k,1.8);
  bar.style.setProperty("--p",(p*100).toFixed(1)+"%");
  pct.textContent=Math.floor(p*100)+"%";
  while(shown<lines.length&&p>=(shown+1)/lines.length*.97)add(lines[shown++]);
  if(k<1)requestAnimationFrame(step);
  else if(!done){
    done=true;while(shown<lines.length)add(lines[shown++]);
    pct.textContent="100%";window.__gateReady=true;window.dispatchEvent(new Event("gate:ready"));
  }
}
requestAnimationFrame(step);
})();
