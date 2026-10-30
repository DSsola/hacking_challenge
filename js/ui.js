// UI-only helpers. Game logic lives in game.js.
document.addEventListener("DOMContentLoaded",()=>{
  const sound=document.getElementById("soundBtn");
  if(sound){sound.textContent="♫";sound.title="사운드 효과 준비 중";sound.addEventListener("click",()=>window.BV.toast("사운드 모듈은 다음 업데이트에서 추가할게요."))}
  const rotate=document.getElementById("rotate");
  if(rotate && window.matchMedia("(orientation: landscape)").matches) rotate.style.display="none";
  window.addEventListener("orientationchange",()=>{
    if(window.matchMedia("(orientation: landscape)").matches) rotate.style.display="none";
    else if(window.matchMedia("(max-width: 900px)").matches) rotate.style.display="flex";
  });
});