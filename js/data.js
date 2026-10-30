window.BV_DATA = {
  contracts: [
    {id:"recon",name:"01 / GHOST RECON",desc:"가상 네트워크의 구조를 조사하고 노드 정보를 수집한다.",difficulty:"EASY",energy:9,trace:6,reward:65,xp:35,type:"scan"},
    {id:"cipher",name:"02 / CIPHER BREAK",desc:"암호 연구소의 데이터 조각을 해독한다.",difficulty:"NORMAL",energy:12,trace:8,reward:95,xp:55,type:"cipher"},
    {id:"access",name:"03 / ACCESS TRIAL",desc:"가상 보안 인증 코드를 제한 시간 안에 검증한다.",difficulty:"NORMAL",energy:14,trace:10,reward:120,xp:65,type:"challenge"},
    {id:"mining",name:"04 / DATA MINING",desc:"시뮬레이션 저장소에서 데이터 조각을 회수한다.",difficulty:"EASY",energy:10,trace:5,reward:75,xp:40,type:"data"},
    {id:"blackout",name:"05 / BLACKOUT",desc:"고위험 가상 서버의 다단계 보안 퍼즐에 도전한다.",difficulty:"HARD",energy:22,trace:19,reward:230,xp:125,type:"boss"},
    {id:"ghost-upload",name:"06 / GHOST UPLOAD",desc:"감시망의 빈틈을 찾아 데이터 패킷을 빼내라.",difficulty:"NORMAL",energy:13,trace:9,reward:145,xp:75,type:"data"},
    {id:"deep-core",name:"07 / DEEP CORE",desc:"핵심 가상 서버의 보안 게이트를 돌파하라.",difficulty:"EXTREME",energy:28,trace:24,reward:420,xp:210,type:"boss"}
  ],
  nodes: [
    {id:"NEXUS-01",kind:"가상 라우터",risk:"낮음",reward:30,energy:5,trace:3},
    {id:"VAULT-07",kind:"암호 데이터 금고",risk:"중간",reward:65,energy:8,trace:7},
    {id:"NEON-GRID",kind:"시뮬레이션 서버",risk:"중간",reward:55,energy:7,trace:6},
    {id:"OBSIDIAN",kind:"보안 연구실",risk:"높음",reward:105,energy:12,trace:12},
    {id:"GHOST-NET",kind:"숨겨진 가상 노드",risk:"높음",reward:145,energy:15,trace:15},
    {id:"CORE-ZERO",kind:"최종 시뮬레이션",risk:"최고",reward:220,energy:20,trace:22}
  ],
  upgrades: [
    {id:"cpu",name:"QUANTUM CPU",desc:"모든 작전 에너지 소비 20% 감소",cost:190},
    {id:"cloak",name:"TRACE CLOAK",desc:"추적 게이지 증가량 35% 감소",cost:260},
    {id:"battery",name:"POWER CELL",desc:"최대 에너지 100 → 150",cost:180},
    {id:"decoder",name:"DECRYPTOR X",desc:"암호 해독 보상 +45 CR",cost:230},
    {id:"firewall",name:"GHOST FIREWALL",desc:"경보 발생 시 에너지 손실 감소",cost:320},
    {id:"magnet",name:"DATA MAGNET",desc:"데이터 작전 보상 +50%",cost:280}
  ]
};