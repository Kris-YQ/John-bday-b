js

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

/* =========================
   Scene 1 intro:
   - word-by-word slow appear
   - spark rain
   - title fade out
   - envelope fade in at same position
   ========================= */
window.addEventListener("DOMContentLoaded", () => {
  runScene1Intro();
  restoreChoice();
});

function runScene1Intro(){
  const titleEl = document.getElementById("title1");
  buildWordSpans(titleEl); // 逐词拆分

  // 碎✨稍后开始掉落
  setTimeout(() => {
    scene1.classList.add("s1-spark");
    startSparkRain(18);
  }, 750);

  // 计算动画总时长：最后一个词出现 + 停留
  const totalMs = getWordAnimTotalMs(titleEl, 520, 900) + 900;

  // 标题淡出
  setTimeout(() => {
    scene1.classList.add("s1-title-out");
  }, totalMs);

  // 信封淡入（同位置）
  setTimeout(() => {
    scene1.classList.add("s1-envelope-in");
  }, totalMs + 550);
}

function buildWordSpans(titleEl){
  const raw = titleEl.textContent.trim();
  const parts = raw.split(" "); // 逐“单词”
  titleEl.innerHTML = "";

  const wordDelay = 520; // 想更慢：650；想更快：420
  parts.forEach((p, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.textContent = (i === parts.length - 1) ? p : (p + " ");
    span.style.setProperty("--d", `${i * wordDelay}ms`);
    titleEl.appendChild(span);
  });
}

function getWordAnimTotalMs(titleEl, wordDelay=520, wordDur=900){
  const count = titleEl.querySelectorAll(".w").length || 1;
  return (count - 1) * wordDelay + wordDur;
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

    s.style.left = (Math.random()*100) + "%";
    s.style.setProperty("--dy", (240 + Math.random()*420) + "px");
    s.style.setProperty("--dur", (1.3 + Math.random()*1.4) + "s");
    s.style.setProperty("--rot", (Math.random()*140 - 70).toFixed(0) + "deg");
    s.style.setProperty("--delay", (Math.random()*0.9) + "s");

    box.appendChild(s);
  }

  // 自动清理
  setTimeout(()=>{ box.innerHTML = ""; }, 5200);
}

// Scene1 -> Scene2
sealBtn.addEventListener("click", ()=>{
  envStage.classList.add("opened");
  setTimeout(()=>go(scene2), 650);
});

// Scene2 -> Scene3 (NO selected / NO hover)
cakeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.dataset.id;
    const name = btn.dataset.name;

    localStorage.setItem("chosenCakeId", id);
    localStorage.setItem("chosenCakeName", name);

    chosenCakeImg.src = cakeSrc[id];
    chosenCakeName.textContent = name;

    go(scene3);
  });
});

// restore choice if reload
function restoreChoice(){
  const id = localStorage.getItem("chosenCakeId");
  const name = localStorage.getItem("chosenCakeName");
  if(id && cakeSrc[id]){
    chosenCakeImg.src = cakeSrc[id];
    chosenCakeName.textContent = name || "";
  }
}

/* ===== Countdown to March 6 00:00 (device local time) ===== */
let countdownTimer = null;
function getTargetDate(){
  const now = new Date();
  const y = now.getFullYear();
  let target = new Date(y, 2, 6, 0, 0, 0); // March = 2
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

// Scene3 tap cake -> modal
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
