/* ============================================================
   Kegel Trainer — app.js
   Estado en localStorage. Sin servidores. Todo local.
   ============================================================ */

const KEY = {
  sessions: "kt_sessions",
  level:    "kt_level",
  settings: "kt_settings",
};

const DEFAULT_SETTINGS = {
  sound: true, vibrate: true, voice: false,
  remDaily: false, remTime: "08:00",
};

/* ---------- storage helpers ---------- */
const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let state = {
  sessions: load(KEY.sessions, []),
  levelIdx: load(KEY.level, 0),              // índice en LEVELS (0 = nivel 1)
  settings: Object.assign({}, DEFAULT_SETTINGS, load(KEY.settings, {})),
};

const currentLevel = () => LEVELS[state.levelIdx];

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+name).classList.add("active");
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  window.scrollTo(0,0);
  if(name==="stats") renderStats();
  if(name==="history") renderHistory();
  if(name==="levels") renderLevels();
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>showView(t.dataset.view)));

/* ============================================================
   HOME
   ============================================================ */
function sessionsAtLevel(idx){
  return state.sessions.filter(s=>s.levelIdx===idx).length;
}

function todayISO(){ return new Date().toISOString().split("T")[0]; }
function countToday(){ return state.sessions.filter(s=>s.date===todayISO()).length; }
function weekStartISO(){
  const d=new Date(); const day=(d.getDay()+6)%7; // lunes=0
  d.setDate(d.getDate()-day); d.setHours(0,0,0,0);
  return d.toISOString().split("T")[0];
}
function countThisWeek(){
  const start=weekStartISO();
  return state.sessions.filter(s=>s.date>=start).length;
}

function renderFreq(){
  const f = currentLevel().frequency || { perDay: 1 };
  const title = document.getElementById("freqTitle");
  const count = document.getElementById("freqCount");
  const dots  = document.getElementById("freqDots");
  const note  = document.getElementById("freqNote");

  let done, target, unitNote;
  if(f.perDay){
    target = f.perDay; done = countToday();
    title.textContent = "Sesiones de hoy";
    unitNote = `Haz ${target} sesiones al día en este nivel.`;
  } else {
    target = f.perWeek; done = countThisWeek();
    title.textContent = "Sesiones de esta semana";
    unitNote = `Haz ${target} sesiones por semana en este nivel.`;
  }

  count.textContent = `${done} / ${target}`;

  let html = "";
  for(let i=0; i<target; i++){
    const filled = i < done ? "filled" : "";
    html += `<span class="freq-dot ${filled}">${i<done?"✓":i+1}</span>`;
  }
  // sesiones extra por encima de la meta
  for(let i=target; i<done; i++){
    html += `<span class="freq-dot extra">★</span>`;
  }
  dots.innerHTML = html;

  if(done>=target){
    note.textContent = f.perDay ? "¡Meta de hoy completa! 💪" : "¡Meta de la semana completa! 💪";
    note.className = "freq-note complete";
  } else {
    const falta = target-done;
    note.textContent = `Te ${falta===1?"falta":"faltan"} ${falta} ${falta===1?"sesión":"sesiones"}. ${unitNote}`;
    note.className = "freq-note";
  }
}

function recentEase(idx){
  const recent = state.sessions.filter(s=>s.levelIdx===idx).slice(-EASE_WINDOW);
  if(recent.length < EASE_WINDOW) return null;
  const avg = recent.reduce((a,s)=>a+(s.difficulty||2),0)/recent.length;
  return avg;
}

function canAdvance(){
  const lvl = currentLevel();
  if(lvl.sessionsToAdvance == null) return false;      // nivel permanente
  if(state.levelIdx >= LEVELS.length-1) return false;
  const done = sessionsAtLevel(state.levelIdx);
  if(done < lvl.sessionsToAdvance) return false;
  const ease = recentEase(state.levelIdx);
  // habilita si ya hizo las sesiones; el "ease" refina el mensaje
  return { done, ease };
}

function levelDuration(lvl){
  // estimación en minutos del tiempo total de la sesión
  let sec = 5; // preparación
  lvl.exercises.forEach(ex=>{
    sec += ex.sets * ex.reps * (ex.hold + ex.rest);
    sec += Math.max(0, ex.sets-1) * (ex.setRest||0);
  });
  return Math.round(sec/60);
}

function renderHome(){
  const lvl = currentLevel();
  document.getElementById("greeting").textContent = greeting();
  document.getElementById("homeLevelName").textContent = lvl.name;
  document.getElementById("homeLevelGoal").textContent = lvl.goal;
  document.getElementById("startBtnEstimate").textContent = "≈ "+levelDuration(lvl)+" min · "+lvl.exercises.length+" ejercicios";
  document.getElementById("streakBadge").textContent = "🔥 "+calcStreak();

  // barra de progreso del nivel
  const done = sessionsAtLevel(state.levelIdx);
  const target = lvl.sessionsToAdvance;
  const bar = document.getElementById("levelProgressBar");
  const label = document.getElementById("levelProgressLabel");
  if(target){
    const pct = Math.min(100, Math.round(done/target*100));
    bar.style.width = pct+"%";
    label.textContent = `${done} / ${target} sesiones para el siguiente nivel`;
  } else {
    bar.style.width = "100%";
    label.textContent = "Nivel permanente de mantenimiento";
  }

  // ejercicios de hoy
  const exWrap = document.getElementById("todayExercises");
  exWrap.innerHTML = lvl.exercises.map(ex=>`
    <div class="ex-row">
      <span class="ex-dot" style="background:${lvl.color}"></span>
      <div class="ex-info">
        <strong>${ex.name}</strong>
        <small>${ex.hold}s contrae · ${ex.rest}s descansa</small>
      </div>
      <div class="ex-vol">${ex.reps}×${ex.sets}</div>
    </div>`).join("");

  // contador de frecuencia (veces por día / semana)
  renderFreq();

  // tips
  document.getElementById("homeTips").innerHTML = lvl.tips.map(t=>`<li>${t}</li>`).join("");

  // banner de avance
  const adv = canAdvance();
  const banner = document.getElementById("advanceBanner");
  if(adv){
    banner.classList.remove("hidden");
    const easyNote = (adv.ease!=null && adv.ease<=EASE_THRESHOLD)
      ? "Tus últimas sesiones se sintieron fáciles."
      : "Ya completaste las sesiones recomendadas.";
    document.getElementById("advanceBannerSub").textContent = easyNote+" Pasa a "+LEVELS[state.levelIdx+1].name+".";
  } else {
    banner.classList.add("hidden");
  }
}

function greeting(){
  const h = new Date().getHours();
  const name = "Diego";
  if(h<12) return "Buenos días "+name;
  if(h<19) return "Buenas tardes "+name;
  return "Buenas noches "+name;
}

document.getElementById("advanceBtn").addEventListener("click",()=>{
  if(state.levelIdx < LEVELS.length-1){
    state.levelIdx++;
    save(KEY.level, state.levelIdx);
    renderHome(); renderSettings();
    alert("¡Subiste a "+currentLevel().name+"! La rutina de hoy ya está actualizada.");
  }
});

/* ============================================================
   MOTOR DEL CRONÓMETRO GUIADO
   ============================================================ */
let workout = null;

function buildSteps(lvl){
  const steps = [{phase:"prepare", seconds:5, label:"Prepárate", cue:"Ponte cómodo", ex:"", set:0, rep:0, sets:0, reps:0}];
  lvl.exercises.forEach(ex=>{
    for(let s=1; s<=ex.sets; s++){
      for(let r=1; r<=ex.reps; r++){
        steps.push({phase:"hold", seconds:ex.hold, label:"Contrae", cue:ex.cue, ex:ex.name, set:s, rep:r, sets:ex.sets, reps:ex.reps, type:ex.type});
        // último rep de la última serie no necesita rest largo, igual damos el rest normal salvo el final
        steps.push({phase:"rest", seconds:ex.rest, label:"Relaja", cue:"Suelta", ex:ex.name, set:s, rep:r, sets:ex.sets, reps:ex.reps});
      }
      if(s < ex.sets && ex.setRest){
        steps.push({phase:"setrest", seconds:ex.setRest, label:"Descanso", cue:"Respira. Viene la serie "+(s+1), ex:ex.name, set:s, rep:0, sets:ex.sets, reps:ex.reps});
      }
    }
  });
  return steps;
}

function startWorkout(){
  const lvl = currentLevel();
  workout = {
    steps: buildSteps(lvl),
    i: 0,
    remaining: 0,
    paused: false,
    timer: null,
    startedAt: Date.now(),
  };
  document.getElementById("workoutDone").classList.add("hidden");
  document.getElementById("workoutStage").style.display = "flex";
  showView("workout");
  document.getElementById("view-workout").classList.add("active");
  runStep();
}

function runStep(){
  const w = workout;
  if(w.i >= w.steps.length){ finishWorkout(); return; }
  const step = w.steps[w.i];
  w.remaining = step.seconds;

  const stage = document.getElementById("workoutStage");
  stage.className = "workout-stage phase-"+(step.phase==="hold"?"hold":(step.phase==="prepare"?"hold":"rest"));

  document.getElementById("woExercise").textContent = step.ex || "Preparación";
  document.getElementById("woSetRep").textContent = step.set
    ? `Serie ${step.set}/${step.sets}` + (step.rep?` · Rep ${step.rep}/${step.reps}`:"")
    : "";
  document.getElementById("woPhase").textContent = step.label;
  document.getElementById("woCue").textContent = step.cue || "";
  updateCount(step.seconds, step.seconds);
  updateProgress();

  cue(step.phase); // sonido/vibración al iniciar fase

  clearInterval(w.timer);
  w.timer = setInterval(tick, 1000);
}

function tick(){
  const w = workout;
  if(w.paused) return;
  w.remaining--;
  const step = w.steps[w.i];
  updateCount(w.remaining, step.seconds);

  if(w.remaining <= 0){
    clearInterval(w.timer);
    w.i++;
    runStep();
  } else if(w.remaining <= 3 && step.phase!=="setrest"){
    beep(600, 0.06); // ticks finales
  }
}

function updateCount(rem, total){
  document.getElementById("woCount").textContent = Math.max(0, rem);
  const ring = document.getElementById("ringFg");
  const circ = 628; // 2*pi*100
  const frac = total>0 ? (rem/total) : 0;
  ring.style.strokeDashoffset = circ*(1-frac);
}

function updateProgress(){
  const w = workout;
  const pct = Math.round(w.i/w.steps.length*100);
  document.getElementById("workoutProgress").style.width = pct+"%";
}

/* señales de audio / voz / vibración */
let audioCtx = null;
function beep(freq=440, dur=0.12){
  if(!state.settings.sound) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.type="sine";
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.18, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
    o.start(); o.stop(audioCtx.currentTime+dur);
  }catch(e){}
}
function vibrate(ms){ if(state.settings.vibrate && navigator.vibrate) navigator.vibrate(ms); }
function speak(text){
  if(!state.settings.voice || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text); u.lang="es-ES"; u.rate=1;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
function cue(phase){
  if(phase==="hold"){ beep(880,0.15); vibrate(120); speak("Contrae"); }
  else if(phase==="rest"){ beep(440,0.15); vibrate(60); speak("Relaja"); }
  else if(phase==="setrest"){ beep(330,0.2); vibrate([80,60,80]); speak("Descansa"); }
  else if(phase==="prepare"){ speak("Prepárate"); }
}

/* controles */
document.getElementById("woPauseBtn").addEventListener("click",function(){
  workout.paused = !workout.paused;
  this.textContent = workout.paused ? "Reanudar" : "Pausar";
});
document.getElementById("woSkipBtn").addEventListener("click",()=>{
  // salta al siguiente ejercicio distinto
  const w = workout; const curEx = w.steps[w.i].ex;
  clearInterval(w.timer);
  while(w.i < w.steps.length && w.steps[w.i].ex === curEx) w.i++;
  runStep();
});
document.getElementById("workoutClose").addEventListener("click",()=>{
  if(confirm("¿Salir de la sesión? No se guardará.")){
    clearInterval(workout.timer);
    document.getElementById("view-workout").classList.remove("active");
    showView("home");
  }
});
document.getElementById("startWorkoutBtn").addEventListener("click",startWorkout);

/* ============================================================
   FIN DE SESIÓN
   ============================================================ */
let pendingDifficulty = 2;
function finishWorkout(){
  clearInterval(workout.timer);
  const mins = Math.max(1, Math.round((Date.now()-workout.startedAt)/60000));
  document.getElementById("workoutStage").style.display = "none";
  const done = document.getElementById("workoutDone");
  done.classList.remove("hidden");
  document.getElementById("doneSummary").textContent =
    `${currentLevel().name} · ${mins} min · ${currentLevel().exercises.length} ejercicios`;
  pendingDifficulty = 2;
  document.querySelectorAll("#difficultyPicker button").forEach(b=>b.classList.remove("sel"));
  document.getElementById("doneNotes").value = "";
  workout.minutes = mins;
  beep(660,0.4); vibrate([120,80,120]);
}

document.querySelectorAll("#difficultyPicker button").forEach(b=>{
  b.addEventListener("click",()=>{
    pendingDifficulty = parseInt(b.dataset.d);
    document.querySelectorAll("#difficultyPicker button").forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel");
  });
});

document.getElementById("saveSessionBtn").addEventListener("click",()=>{
  const now = new Date();
  state.sessions.push({
    id: Date.now(),
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().slice(0,5),
    levelIdx: state.levelIdx,
    levelName: currentLevel().name,
    minutes: workout.minutes||1,
    difficulty: pendingDifficulty,
    notes: document.getElementById("doneNotes").value.trim(),
  });
  save(KEY.sessions, state.sessions);
  document.getElementById("view-workout").classList.remove("active");
  renderHome();
  showView("home");
});

document.getElementById("discardSessionBtn").addEventListener("click",()=>{
  document.getElementById("view-workout").classList.remove("active");
  showView("home");
});

/* ============================================================
   HISTORIAL
   ============================================================ */
const DIFF_TXT = {1:["Fácil","d1"],2:["Normal","d2"],3:["Difícil","d3"]};
function renderHistory(){
  const list = document.getElementById("historyList");
  const empty = document.getElementById("historyEmpty");
  const sessions = [...state.sessions].sort((a,b)=>b.id-a.id);
  if(!sessions.length){ list.innerHTML=""; empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");
  list.innerHTML = sessions.map(s=>{
    const d = new Date(s.date+"T12:00:00");
    const [txt,cls] = DIFF_TXT[s.difficulty]||DIFF_TXT[2];
    return `<div class="hist-card">
      <div class="hist-top">
        <span class="hist-date">${d.toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"})}</span>
        <span class="hist-diff ${cls}">${txt}</span>
      </div>
      <div class="hist-meta"><span>${s.levelName}</span><span>${s.time}</span><span>${s.minutes} min</span></div>
      ${s.notes?`<div class="hist-notes">${s.notes}</div>`:""}
      <button class="hist-del" onclick="delSession(${s.id})">Borrar</button>
    </div>`;
  }).join("");
}
window.delSession = function(id){
  if(!confirm("¿Borrar esta sesión?")) return;
  state.sessions = state.sessions.filter(s=>s.id!==id);
  save(KEY.sessions, state.sessions);
  renderHistory(); renderHome();
};

/* ============================================================
   STATS
   ============================================================ */
function calcStreak(){
  if(!state.sessions.length) return 0;
  const days = new Set(state.sessions.map(s=>s.date));
  let streak = 0;
  let d = new Date();
  // si hoy no hay sesión empezamos a contar desde ayer
  const todayStr = d.toISOString().split("T")[0];
  if(!days.has(todayStr)) d.setDate(d.getDate()-1);
  for(;;){
    const str = d.toISOString().split("T")[0];
    if(days.has(str)){ streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function renderStats(){
  const s = state.sessions;
  const now = new Date();
  const month = s.filter(x=>{ const d=new Date(x.date); return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); });
  document.getElementById("stTotal").textContent = s.length;
  document.getElementById("stMonth").textContent = month.length;
  document.getElementById("stStreak").textContent = calcStreak();
  document.getElementById("stMinutes").textContent = s.reduce((a,x)=>a+(x.minutes||0),0);

  // calendario
  const y=now.getFullYear(), m=now.getMonth();
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const doneDays=new Set(s.map(x=>x.date));
  const todayStr=now.toISOString().split("T")[0];
  document.getElementById("calTitle").textContent =
    now.toLocaleDateString("es-MX",{month:"long",year:"numeric"}).replace(/^\w/,c=>c.toUpperCase());
  const head=["D","L","M","M","J","V","S"].map(x=>`<div>${x}</div>`).join("");
  let cal="";
  for(let i=0;i<first;i++) cal+='<div class="cal-day blank"></div>';
  for(let day=1;day<=days;day++){
    const str=`${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const c=["cal-day"]; if(doneDays.has(str))c.push("done"); if(str===todayStr)c.push("today");
    cal+=`<div class="${c.join(" ")}">${day}</div>`;
  }
  document.getElementById("calendar").innerHTML =
    `<div class="cal-head">${head}</div><div class="calendar">${cal}</div>`;

  // barras por nivel
  const counts = LEVELS.map((_,i)=>sessionsAtLevel(i));
  const max = Math.max(1,...counts);
  document.getElementById("levelBars").innerHTML = LEVELS.map((lvl,i)=>`
    <div class="lvl-bar">
      <div class="lvl-bar-top"><span>${lvl.name}</span><b>${counts[i]}</b></div>
      <div class="lvl-bar-track"><div class="lvl-bar-fill" style="width:${counts[i]/max*100}%"></div></div>
    </div>`).join("");
}

/* ============================================================
   NIVELES (página)
   ============================================================ */
function renderLevels(){
  const wrap = document.getElementById("levelsList");
  wrap.innerHTML = LEVELS.map((lvl,i)=>{
    let badge="", cls="level-card";
    if(i<state.levelIdx){ badge=`<span class="level-badge badge-done">Completado</span>`; }
    else if(i===state.levelIdx){ badge=`<span class="level-badge badge-current">Nivel actual</span>`; cls+=" current"; }
    else { badge=`<span class="level-badge badge-locked">Próximo</span>`; cls+=" locked"; }
    const exs = lvl.exercises.map(ex=>
      `<div class="level-ex"><b>${ex.name}</b> — ${ex.hold}s/${ex.rest}s · ${ex.reps}×${ex.sets}</div>`).join("");
    const adv = lvl.sessionsToAdvance ? `Avanza tras ${lvl.sessionsToAdvance} sesiones` : "Nivel permanente";
    return `<div class="${cls}" style="border-left-color:${lvl.color}">
      ${badge}
      <h3>${lvl.name}</h3>
      <div class="wk">${lvl.weeks} · ${adv}</div>
      <div class="goal">${lvl.goal}</div>
      ${exs}
    </div>`;
  }).join("");
}

/* ============================================================
   AJUSTES
   ============================================================ */
function renderSettings(){
  const s = state.settings;
  document.getElementById("setSound").checked = s.sound;
  document.getElementById("setVibrate").checked = s.vibrate;
  document.getElementById("setVoice").checked = s.voice;
  document.getElementById("remDaily").checked = s.remDaily;
  document.getElementById("remTime").value = s.remTime;
  const sel = document.getElementById("manualLevel");
  sel.innerHTML = LEVELS.map((l,i)=>`<option value="${i}" ${i===state.levelIdx?"selected":""}>${l.name}</option>`).join("");
}

function bindSetting(id, key, after){
  document.getElementById(id).addEventListener("change",e=>{
    state.settings[key] = e.target.checked;
    save(KEY.settings, state.settings);
    if(after) after();
  });
}
bindSetting("setSound","sound");
bindSetting("setVibrate","vibrate");
bindSetting("setVoice","voice");
bindSetting("remDaily","remDaily",()=>{ if(state.settings.remDaily) requestNotify(); scheduleReminder(); });

document.getElementById("remTime").addEventListener("change",e=>{
  state.settings.remTime=e.target.value; save(KEY.settings,state.settings); scheduleReminder();
});
document.getElementById("manualLevel").addEventListener("change",e=>{
  state.levelIdx=parseInt(e.target.value); save(KEY.level,state.levelIdx); renderHome();
});

/* exportar / importar / borrar */
document.getElementById("exportBtn").addEventListener("click",()=>{
  const data={sessions:state.sessions,levelIdx:state.levelIdx,settings:state.settings,exported:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`kegel-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
});
document.getElementById("importFile").addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(d.sessions){ state.sessions=d.sessions; save(KEY.sessions,state.sessions); }
      if(typeof d.levelIdx==="number"){ state.levelIdx=d.levelIdx; save(KEY.level,state.levelIdx); }
      if(d.settings){ state.settings=Object.assign({},DEFAULT_SETTINGS,d.settings); save(KEY.settings,state.settings); }
      renderHome(); renderSettings();
      alert("Copia importada correctamente.");
    }catch{ alert("Archivo no válido."); }
  };
  r.readAsText(file);
});
document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("Esto borra TODAS tus sesiones y progreso. ¿Seguro?") && confirm("No se puede deshacer. ¿Confirmas?")){
    localStorage.removeItem(KEY.sessions); localStorage.removeItem(KEY.level); localStorage.removeItem(KEY.settings);
    state={sessions:[],levelIdx:0,settings:Object.assign({},DEFAULT_SETTINGS)};
    renderHome(); renderSettings(); showView("home");
  }
});

/* ============================================================
   RECORDATORIOS (notificaciones)
   ============================================================ */
function requestNotify(){ if("Notification" in window) Notification.requestPermission(); }
let reminderTimer=null;
function scheduleReminder(){
  if(reminderTimer) clearTimeout(reminderTimer);
  if(!state.settings.remDaily || !("Notification" in window)) return;
  const [h,m]=state.settings.remTime.split(":").map(Number);
  const now=new Date(); const next=new Date();
  next.setHours(h,m,0,0);
  if(next<=now) next.setDate(next.getDate()+1);
  reminderTimer=setTimeout(()=>{
    if(Notification.permission==="granted")
      new Notification("Kegel Trainer",{body:"Es hora de tu sesión de hoy 💪",icon:"icons/icon-192.png"});
    scheduleReminder();
  }, next-now);
}

/* ============================================================
   SERVICE WORKER (offline / instalable)
   ============================================================ */
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
}

/* ============================================================
   INIT
   ============================================================ */
renderHome();
renderSettings();
scheduleReminder();
