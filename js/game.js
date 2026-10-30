(() => {
const D=window.BV_DATA;
const fresh=()=>({name:"GHOST_01",xp:0,credits:250,energy:100,trace:0,ops:0,data:0,earned:0,solved:0,upgrades:[],integrity:100,started:Date.now(),completed:[],bestStreak:0,streak:0,loot:0,breaches:0});
let s;
try{s=Object.assign(fresh(),JSON.parse(localStorage.getItem("blackvoid_save_v2")||"{}"));}catch(e){s=fresh();}
["credits","xp","energy","trace","ops","data","earned","solved","integrity","loot","breaches","streak"].forEach(k=>{if(typeof s[k]!=="number"||!Number.isFinite(s[k]))s[k]=fresh()[k];});
if(!Array.isArray(s.upgrades))s.upgrades=[];
if(!Array.isArray(s.completed))s.completed=[];
let activePuzzle=null,activeChallenge=null,selectedNode=null;
const $=id=>document.getElementById(id),rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const has=id=>s.upgrades.includes(id),maxEnergy=()=>has("battery")?150:100;
const xpNeed=()=>100+Math.floor(s.xp/150)*50;
const rank=()=>s.xp>=2400?"ROOT ARCHITECT":s.xp>=1400?"VOID WALKER":s.xp>=850?"PHANTOM":s.xp>=450?"ELITE":s.xp>=150?"OPERATOR":"ROOKIE";

// 게임 화폐는 실제 저장값을 Byte로 두고, 일정량을 모으면 상위 등급으로 표기한다.
function money(n){
  const tiers=[["Byte",1],["Bit",1000],["Kilobyte",1000000],["Megabyte",1000000000],["Gigabyte",1000000000000]];
  let t=tiers[0];
  for(const item of tiers){if(n>=item[1])t=item;else break;}
  const value=n/t[1];
  return (value>=100?Math.floor(value):value>=10?value.toFixed(1):value.toFixed(2)).replace(/\.?0+$/,"")+" "+t[0];
}
function persist(){try{localStorage.setItem("blackvoid_save_v2",JSON.stringify(s));$("saveState").textContent="SAVE SYNCED TO THIS BROWSER";}catch(e){$("saveState").textContent="SAVE UNAVAILABLE";}}
function log(t,c=""){const d=document.createElement("div");d.className="line "+c;d.textContent=t;$("terminal").append(d);$("terminal").scrollTop=$("terminal").scrollHeight;}
function feed(t){const d=document.createElement("div");d.textContent="["+new Date().toLocaleTimeString("ko-KR")+"] "+t;$("eventFeed").prepend(d);while($("eventFeed").children.length>35)$("eventFeed").lastChild.remove();}
function toast(t){const el=$("toast");el.textContent=t;el.style.display="block";clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display="none",2300);}
function earn(n){s.credits+=n;s.earned+=n;}
function addXP(n){const old=rank();s.xp+=n;if(rank()!==old){toast("RANK UP: "+rank());feed("NEW CLEARANCE UNLOCKED: "+rank());}}
function addTrace(n){s.trace=Math.min(100,s.trace+n*(has("cloak")?.65:1));if(s.trace>=100){s.trace=38;s.energy=Math.max(0,s.energy-(has("firewall")?8:20));s.integrity=Math.max(0,s.integrity-4);log("추적 게이지 최대! 가상 세션이 강제 종료됐다.","bad");feed("TRACE ALERT — SESSION FORCED OUT");toast("TRACE ALERT — 시스템 재정비 필요");}}
function spend(n){n=Math.max(1,Math.ceil(n*(has("cpu")?.8:1)));if(s.energy<n){log("에너지가 부족해. recover 명령으로 충전해.","bad");toast("ENERGY LOW");return false;}s.energy-=n;return true;}
function render(){
  $("codename").textContent=s.name;$("rank").textContent=rank();$("credits").textContent=money(s.credits);
  $("xpLabel").textContent=s.xp+" / "+xpNeed();$("xpMeter").style.width=(s.xp%xpNeed()/xpNeed()*100)+"%";
  $("traceLabel").textContent=Math.floor(s.trace)+"%";$("traceMeter").style.width=s.trace+"%";
  $("energyLabel").textContent=s.energy+" / "+maxEnergy();$("energyMeter").style.width=s.energy/maxEnergy()*100+"%";
  $("profileName").textContent=s.name;$("profileRank").textContent=rank();$("profileOps").textContent=s.ops;
  $("profileEarned").textContent=money(s.earned);$("profileData").textContent=s.data+" KB";$("profileSolved").textContent=s.solved;
  $("cpuValue").textContent=rand(8,29)+"%";$("cpuMeter").style.width=$("cpuValue").textContent;
  $("memValue").textContent=rand(25,65)+"%";$("memMeter").style.width=$("memValue").textContent;
  $("firewallValue").textContent=has("firewall")?"GHOST ACTIVE":"ACTIVE";
}
function setObjective(title,desc,action){$("objectiveTitle").textContent=title;$("objectiveDesc").textContent=desc;$("objectiveBtn").onclick=action;}
function listContracts(){
  const host=$("contractList");host.innerHTML="";
  D.contracts.forEach(c=>{
    const el=document.createElement("article");el.className="contract";const done=s.completed.includes(c.id);
    el.innerHTML=`<h3>${c.name} ${done?"✓":""}</h3><p>${c.desc}</p><p class="reward">${c.difficulty} · ${money(c.reward)} · ${c.xp} XP</p><p>ENERGY ${c.energy} · TRACE +${c.trace}%</p>`;
    const b=document.createElement("button");b.textContent=done?"재도전하기":"작전 시작 →";b.onclick=()=>startContract(c);el.append(b);host.append(el);
  });
}
function listNodes(){
  const host=$("networkMap");host.innerHTML="";
  D.nodes.forEach((n,i)=>{
    const b=document.createElement("button");b.className="node"+(selectedNode===i?" selected":"");
    b.innerHTML=`<strong>${n.id}</strong><small>${n.kind}<br>위험도 ${n.risk}</small>`;
    b.onclick=()=>{
      selectedNode=i;document.querySelectorAll(".node").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");
      $("nodeInfo").textContent=`${n.id} / ${n.kind} · 위험도 ${n.risk} · 예상 보상 ${money(n.reward)} · 에너지 ${n.energy}. `;
      const go=document.createElement("button");go.textContent="보안 게이트 침투 →";go.onclick=()=>startNodeBreach(i);$("nodeInfo").append(go);
    };host.append(b);
  });
}
function startNodeBreach(i){
  const n=D.nodes[i];if(!spend(n.energy))return;
  const code=String(rand(1000,9999));
  activeChallenge={code,tries:0,node:n,index:i};
  $("modalTitle").textContent="NODE BREACH / "+n.id;
  $("modalDesc").textContent="가상 보안 게이트의 4자리 인증 코드를 기억하고 입력해. 실패하면 TRACE가 상승한다.";
  $("modalCode").textContent=code;$("modalInput").value="";$("modalMessage").textContent="";$("modal").classList.add("open");
  addTrace(n.trace);render();persist();
  log("침투 시작: "+n.id+" / 보안 게이트 인증 필요","info");
}
function exploreNode(i){
  // 터미널의 connect 명령도 동일한 침투 퍼즐을 실행한다.
  startNodeBreach(i);
}
function completeNodeBreach(){
  const n=activeChallenge.node;
  const reward=n.reward+(has("magnet")?Math.floor(n.reward*.2):0)+Math.min(100,s.streak*5);
  earn(reward);addXP(25);s.data+=rand(5,14);s.ops++;s.breaches++;s.loot++;
  s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
  log(`${n.id} 침투 성공 · +${money(reward)} · +25 XP · DATA LOOT 확보`,"good");
  feed("NODE BREACHED: "+n.id+" / DATA LOOT +1");closeModal();render();persist();
}
function startContract(c){
  if(!spend(c.energy))return;addTrace(c.trace);
  if(c.type==="cipher"){openPage("lab");newPuzzle();log("CIPHER BREAK: 암호 연구소에서 퍼즐을 완료해.","info");render();persist();return;}
  if(c.type==="challenge"||c.type==="boss"){startChallenge(c);render();persist();return;}
  let bonus=c.type==="data"&&has("magnet")?Math.floor(c.reward*.5):0;
  earn(c.reward+bonus);addXP(c.xp);s.ops++;s.data+=c.type==="data"?rand(18,38):rand(8,18);
  s.completed.push(c.id);s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
  log(`${c.name} 작전 성공 · +${money(c.reward+bonus)} · +${c.xp} XP`,"good");
  feed("CONTRACT COMPLETE: "+c.name);render();listContracts();persist();
}
function listUpgrades(){
  const host=$("upgradeList");host.innerHTML="";
  D.upgrades.forEach(u=>{
    const owned=has(u.id),el=document.createElement("article");el.className="upgrade";
    el.innerHTML=`<h3>${u.name} ${owned?"✓":""}</h3><p>${u.desc}</p><p class="reward">${owned?"INSTALLED":money(u.cost)}</p>`;
    const b=document.createElement("button");b.textContent=owned?"설치 완료":"구매하기";b.disabled=owned||s.credits<u.cost;
    b.onclick=()=>{if(s.credits<u.cost)return;s.credits-=u.cost;s.upgrades.push(u.id);if(u.id==="battery")s.energy=Math.min(maxEnergy(),s.energy+50);log("장비 설치 완료: "+u.name,"good");feed("UPGRADE INSTALLED: "+u.name);render();listUpgrades();persist();};
    el.append(b);host.append(el);
  });
}
function words(){return ["GHOST","LASER","CYBER","PROXY","PIXEL","SHADOW","VECTOR","SIGNAL","PHANTOM","CIPHER","MATRIX","NEBULA","ORBIT","NEXUS","FIREWALL","BACKDOOR"];}
function newPuzzle(){
  const w=words()[rand(0,words().length-1)],shift=rand(2,5),c=[...w].map(ch=>String.fromCharCode((ch.charCodeAt(0)-65+shift)%26+65)).join("");
  activePuzzle={word:w,shift,cipher:c};$("cipherText").textContent=c;$("cipherHint").textContent="암호 규칙을 찾아 입력해.";
  $("cipherInput").value="";$("puzzleCount").textContent="PUZZLE ACTIVE";$("labResult").textContent="";$("cipherInput").focus();
}
function hintPuzzle(){if(!activePuzzle)newPuzzle();$("cipherHint").textContent=`힌트: 알파벳을 ${activePuzzle.shift}칸 뒤로 밀어 암호화했어. 원래 글자로 되돌려 봐.`;}
function solvePuzzle(){
  if(!activePuzzle){toast("먼저 새 암호를 생성해.");return;}
  if($("cipherInput").value.trim().toUpperCase()!==activePuzzle.word){$("labResult").textContent="해독 실패. 규칙을 다시 확인해.";addTrace(3);s.streak=0;render();return;}
  const reward=95+(has("decoder")?45:0);earn(reward);addXP(55);s.solved++;s.ops++;s.data+=12;s.completed.push("cipher");s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
  $("labResult").textContent=`DECODE SUCCESS · +${money(reward)} · +55 XP`;$("puzzleCount").textContent="SOLVED";
  log("암호 해독 성공: "+activePuzzle.word,"good");feed("CIPHER DECODED / DATA FRAGMENT RECOVERED");
  activePuzzle=null;render();listContracts();persist();
}
function startChallenge(c){
  activeChallenge={code:String(rand(1000,9999)),contract:c,tries:0};
  $("modalTitle").textContent=c.type==="boss"?"BLACKOUT / FINAL CHECK":"ACCESS TRIAL";
  $("modalDesc").textContent="게임용 인증 코드를 기억하고 입력해. 오답이면 추적 수치가 올라가.";
  $("modalCode").textContent=activeChallenge.code;$("modalInput").value="";$("modalMessage").textContent="";$("modal").classList.add("open");
}
function submitChallenge(){
  if(!activeChallenge)return;activeChallenge.tries++;
  if($("modalInput").value.trim()===activeChallenge.code){
    if(activeChallenge.node){completeNodeBreach();return;}
    const c=activeChallenge.contract;earn(c.reward);addXP(c.xp);s.ops++;s.data+=c.type==="boss"?80:20;s.completed.push(c.id);
    addTrace(2);s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
    log(c.name+" 인증 성공 · +"+money(c.reward)+" · +"+c.xp+" XP","good");
    feed("ACCESS GRANTED: "+c.name);closeModal();render();listContracts();persist();
  }else{
    $("modalMessage").textContent="코드 불일치. 다시 입력해. TRACE +"+(has("firewall")?2:6)+"%";
    addTrace(has("firewall")?2:6);s.streak=0;render();persist();
  }
}
function closeModal(){$("modal").classList.remove("open");activeChallenge=null;}
function command(raw){
  const p=raw.trim().split(/\s+/),c=(p[0]||"").toLowerCase();if(!c)return;
  log("root@void:~$ "+raw,"good");
  switch(c){
    case"help":
      log("CORE: help · scan · status · connect 1~6 · missions · decrypt · shop · recover · whoami · save","info");
      log("HACK: probe · breach · upload · trace · loot · map","info");
      break;
    case"scan":
      if(!spend(8))break;
      D.nodes.slice(0,4).forEach(n=>log(`[SCAN] ${n.id} / RISK ${n.risk}`,"info"));
      earn(40);addXP(20);addTrace(6);s.data+=12;s.ops++;s.streak++;
      log("스캔 완료 · +"+money(40)+" · +20 XP","good");feed("VIRTUAL SCAN COMPLETE");break;
    case"probe":
      if(!spend(5))break;
      if(selectedNode===null)selectedNode=rand(0,D.nodes.length-1);
      log("PROBE RESULT: "+D.nodes[selectedNode].id+" / PORT 443 OPEN / FIREWALL DETECTED","info");
      addTrace(2);s.data+=3;break;
    case"breach":
      if(selectedNode===null){log("먼저 map에서 노드를 선택하거나 connect 1~6을 입력해.","bad");break;}
      exploreNode(selectedNode);break;
    case"upload":
      if(s.data<10){log("업로드할 데이터가 부족해. 노드를 탐색해 DATA를 모아.","bad");break;}
      s.data-=10;const up=rand(35,75);earn(up);addXP(12);log("DATA UPLOAD COMPLETE · +"+money(up)+" · DATA -10 KB","good");feed("DATA SOLD TO BLACK MARKET");break;
    case"trace":
      log("TRACE LEVEL: "+Math.floor(s.trace)+"% / "+(s.trace>70?"DANGER":"STABLE"),s.trace>70?"bad":"info");
      log("TRACE DECREASES SLOWLY WHILE YOU WAIT. RECOVER ALSO REDUCES TRACE.");break;
    case"loot":
      log("DATA LOOT: "+s.loot+" PACKETS / BREACHES: "+s.breaches+" / BEST STREAK: "+s.bestStreak,"info");break;
    case"map":
      openPage("network");log("가상 네트워크 지도 열림. 노드를 선택해 침투해.","info");break;
    case"status":
      log(`KERNEL ONLINE | RANK ${rank()} | XP ${s.xp}`);
      log(`ENERGY ${s.energy}/${maxEnergy()} | TRACE ${Math.floor(s.trace)}% | DATA MONEY ${money(s.credits)}`);
      log(`INTEGRITY ${s.integrity}% | OPS ${s.ops} | LOOT ${s.loot}`,"info");break;
    case"connect":{
      const i=Number(p[1])-1;if(!Number.isInteger(i)||i<0||i>=D.nodes.length){log("사용법: connect 1~6","bad");break;}
      selectedNode=i;openPage("network");listNodes();exploreNode(i);break;
    }
    case"missions":openPage("contracts");break;
    case"decrypt":openPage("lab");newPuzzle();break;
    case"shop":openPage("market");break;
    case"recover":
      if(s.credits<35){log("데이터 화폐가 부족해. 현재 잔액: "+money(s.credits),"bad");break;}
      s.credits-=35;s.energy=Math.min(maxEnergy(),s.energy+45);s.trace=Math.max(0,s.trace-8);log("에너지 +45 · TRACE -8% · 비용 "+money(35),"good");break;
    case"whoami":log(`CODENAME ${s.name} / ${rank()} / ${s.xp} XP`);break;
    case"date":log(new Date().toString());break;
    case"clear":$("terminal").innerHTML="";log("TERMINAL CLEARED","good");break;
    case"save":persist();toast("저장 완료");break;
    default:log("명령어를 찾을 수 없어. help를 입력해.","bad");
  }
  render();persist();
}
function openPage(id){
  document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id==="page-"+id));
  document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
  const names={terminal:["SYSTEM / TERMINAL","COMMAND TERMINAL"],contracts:["OPERATIONS / CONTRACTS","AVAILABLE CONTRACTS"],network:["NETWORK / TOPOLOGY","VIRTUAL NETWORK"],lab:["CRYPTO / RESEARCH","CIPHER LAB"],market:["BLACK MARKET / GEAR","UPGRADE MARKET"],profile:["OPERATOR / ARCHIVE","OPERATOR RECORDS"]};
  $("pageKicker").textContent=names[id][0];$("pageTitle").textContent=names[id][1];
  if(id==="contracts")listContracts();if(id==="network")listNodes();if(id==="market")listUpgrades();
}
function rename(){const n=prompt("새 코드네임 (최대 16자)",s.name);if(n&&n.trim()){s.name=n.trim().slice(0,16);render();persist();}}
function reset(){if(!confirm("저장된 게임 진행 상황을 모두 초기화할까?"))return;s=fresh();persist();render();listContracts();listUpgrades();openPage("terminal");$("terminal").innerHTML="";log("새 오퍼레이터 세션이 시작됐다.","good");}
function exportSave(){const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="blackvoid-save.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("세이브 파일 내보내기 완료");}
function init(){
  log("BLACK//VOID KERNEL v6.0.0","good");log("[ OK ] VIRTUAL NETWORK READY");log("[ OK ] DATA HEIST MODULE LOADED");
  log("가상 침투 시뮬레이션에 접속했어. help로 명령어를 확인해.","info");
  feed("BLACK//VOID v6.0.0 INITIALIZED");feed("LOCAL BROWSER SAVE READY");
  render();listContracts();listNodes();listUpgrades();
  setObjective("FIRST CONTACT","터미널에서 help를 입력하고 scan으로 첫 데이터를 확보해.",()=>openPage("terminal"));
}
window.BV={command,openPage,init,render,save:persist,toast};
document.addEventListener("DOMContentLoaded",()=>{
  init();
  document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>openPage(b.dataset.page)));
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>openPage(b.dataset.page)));
  document.querySelectorAll("[data-command]").forEach(b=>b.addEventListener("click",()=>command(b.dataset.command)));
  $("commandForm").addEventListener("submit",e=>{e.preventDefault();command($("commandInput").value);$("commandInput").value="";});
  $("clearBtn").onclick=()=>command("clear");$("newCipher").onclick=newPuzzle;$("getHint").onclick=hintPuzzle;$("cipherSubmit").onclick=solvePuzzle;
  $("cipherInput").addEventListener("keydown",e=>{if(e.key==="Enter")solvePuzzle();});
  $("modalSubmit").onclick=submitChallenge;$("modalCancel").onclick=closeModal;
  $("modalInput").addEventListener("keydown",e=>{if(e.key==="Enter")submitChallenge();});
  $("renameBtn").onclick=rename;$("resetBtn").onclick=reset;$("exportBtn").onclick=exportSave;
  $("objectiveBtn").onclick=()=>openPage("terminal");
  $("fullBtn").onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();try{await screen.orientation.lock("landscape");}catch(e){}}catch(e){toast("브라우저 메뉴에서 전체화면을 선택해 줘.");}};
  $("rotateContinue").onclick=()=>{$("rotate").style.display="none";};
  setInterval(()=>{$("clock").textContent=new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});if(s.trace>0){s.trace=Math.max(0,s.trace-.18);render();}},1500);
  setInterval(persist,25000);window.addEventListener("pagehide",persist);
});
})();