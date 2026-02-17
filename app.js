const scene1 = document.getElementById("scene1");
const scene2 = document.getElementById("scene2");
const scene3 = document.getElementById("scene3");

const sealBtn = document.getElementById("sealBtn");
const envStage = document.getElementById("envStage");

const cakeBtns = Array.from(document.querySelectorAll(".cakePick[data-id]"));
const chosenCakeImg = document.getElementById("chosenCakeImg");
const chosenCakeName = document.getElementById("chosenCakeName");
const revealCakeBtn = document.getElementById("revealCakeBtn");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalBackdrop = modal.querySelector(".modal-backdrop");
const countdownEl = document.getElementById("countdown");

const cakeSrc = {
  cakeA: "cake-chocolate.png",
  cakeB: "cake-strawberry.png",
  cakeC: "cake-matcha.png"
};

function go(to){
  [scene1, scene2, scene3].forEach(s => s.classList.remove("active"));
  to.classList.add("active");
}

// ===== Scene1 intro animation (REWORK) =====
window.addEventListener("DOMContentLoaded", () => {
  runScene1Intro();
  restoreChoice();
});

function runScene1Intro(){
  // 0) 标题缓慢出现（在中间）
  setTimeout(() => scene1.classList.add("s1-title-in"), 120);

  // 1) 碎✨掉落（在标题出现后开始）
  setTimeout(() => {
    scene1.classList.add("s1-spark");
    startSparkRain(22); // 你想更多就调大
  }, 520);

  // 2) 标题停留一会儿再淡出
  setTimeout(() => scene1.classList.add("s1-title-out"), 2200);

  // 3) 信封淡入出现（标题淡出后）
  setTimeout(() => scene1.classList.add("s1-envelope-in"), 2850);
}

function startSparkRain(count = 18){
  const box = document.getElementById("sparkRain");
  if(!box) return;

  box.innerHTML = "";
  const emojis = ["✨","✦","✧","⋆"];

  for(let i=0;i<count;i++){
    const s = document.createElement("div");
    s.className = "spark";
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];

    // 横向随机
    const left = Math.random()*100;
    // 下落距离随机（按屏高比例）
    const dy = 260 + Math.random()*320; // px
    // 时长随机
    const dur = 1.2 + Math.random()*1.2; // s
    // 旋转随机
    const rot = (Math.random()*140 - 70).toFixed(0) + "deg";

    s.style.left = left + "%";
    s.style.setProperty("--dy", dy + "px");
    s.style.setProperty("--dur", dur + "s");
    s.style.setProperty("--rot", rot);

    // 让它不是同一时间掉
    s.style.animationDelay = (Math.random()*0.7) + "s";

    box.appendChild(s);
  }

  // 4 秒后自动清理（避免 DOM 越堆越多）
  setTimeout(()=>{ box.innerHTML = ""; }, 4200);
}


// ===== Countdown to March 6 00:00 (device local time) =====
let countdownTimer = null;
function getTargetDate(){
  const now = new Date();
  const y = now.getFullYear();
  let target = new Date(y, 2, 6, 0, 0, 0); // March = 2 (0-based)
  if (now.getTime() > target.getTime()) target = new Date(y + 1, 2, 6, 0, 0, 0);
  return target;
}
function formatCountdown(ms){
  if (ms <= 0) return "00h 00m 00s";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${hours}h ${pad(mins)}m ${pad(secs)}s`;
}
function startCountdown(){
  const target = getTargetDate();
  function tick(){
    const msLeft = target.getTime() - Date.now();
    countdownEl.textContent = formatCountdown(msLeft);
    if (msLeft <= 0) stopCountdown();
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}
function stopCountdown(){
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

function openModal(){
  modal.classList.remove("hidden");
  startCountdown();
}
function closeModal(){
  modal.classList.add("hidden");
  stopCountdown();
}

// Scene1 -> Scene2
sealBtn.addEventListener("click", ()=>{
  envStage.classList.add("opened");
  setTimeout(()=>go(scene2), 650);
});

// choose cake -> Scene3
cakeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    cakeBtns.forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");

    const id = btn.dataset.id;
    const name = btn.dataset.name;

    localStorage.setItem("chosenCakeId", id);
    localStorage.setItem("chosenCakeName", name);

    chosenCakeImg.src = cakeSrc[id];
    chosenCakeName.textContent = name;

    go(scene3);
  });
});

// restore choice
function restoreChoice(){
  const id = localStorage.getItem("chosenCakeId");
  const name = localStorage.getItem("chosenCakeName");
  if(id && cakeSrc[id]){
    chosenCakeImg.src = cakeSrc[id];
    chosenCakeName.textContent = name || "";
  }
}

// tap cake -> modal
revealCakeBtn.addEventListener("click", ()=>{
  revealCakeBtn.animate(
    [{transform:"scale(1)"},{transform:"scale(.985)"},{transform:"scale(1)"}],
    {duration:160, easing:"ease-out"}
  );
  setTimeout(openModal, 120);
});

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });
