let currentId = 1;
let mode = "learn";
let filter = "All";
let showAnswer = false;
let recognition = null;
let isRecording = false;
let lastTranscript = "";
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const saved = JSON.parse(localStorage.getItem("interviewCoachProgress") || "{}");
const notes = JSON.parse(localStorage.getItem("interviewCoachNotes") || "{}");
const mastered = new Set(saved.mastered || []);
const practiced = new Set(saved.practiced || []);
const ratings = saved.ratings || {};
const byId = (id) => QUESTIONS.find(q => q.id === Number(id));
const categories = ["All", ...new Set(QUESTIONS.map(q => q.category))];

function persist() {
  localStorage.setItem("interviewCoachProgress", JSON.stringify({
    mastered: [...mastered], practiced: [...practiced], ratings
  }));
  localStorage.setItem("interviewCoachNotes", JSON.stringify(notes));
  renderProgress();
}
function esc(s="") { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderCategories() {
  $("#categoryFilter").innerHTML = categories.map(c => `<option ${c===filter?'selected':''}>${esc(c)}</option>`).join("");
}
function renderList() {
  const search = $("#searchBox").value.toLowerCase().trim();
  const list = QUESTIONS.filter(q => (filter==="All" || q.category===filter) &&
    (!search || `${q.title} ${q.category} ${q.simple}`.toLowerCase().includes(search)));
  $("#questionList").innerHTML = list.map(q => `
    <button class="question-item ${q.id===currentId?'active':''}" data-id="${q.id}">
      <span class="q-num">${String(q.id).padStart(2,"0")}</span>
      <span class="q-title">${esc(q.title)}</span>
      <span class="q-state">${mastered.has(q.id) ? "✓" : practiced.has(q.id) ? "•" : ""}</span>
    </button>`).join("") || `<p class="muted pad">No questions match your search.</p>`;
  $$("#questionList [data-id]").forEach(b => b.addEventListener("click", () => selectQuestion(Number(b.dataset.id))));
  $("#listCount").textContent = `${list.length} questions`;
}
function selectQuestion(id) {
  stopSpeaking();
  stopRecording();
  currentId = id; showAnswer = false; lastTranscript = "";
  renderQuestion(); renderList();
  if (window.innerWidth < 820) $("#practicePanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderQuestion() {
  const q = byId(currentId);
  if (!q) return;
  $("#questionNumber").textContent = `QUESTION ${String(q.id).padStart(2,"0")} OF ${QUESTIONS.length}`;
  $("#questionCategory").textContent = q.category;
  $("#questionTitle").textContent = q.title;
  $("#simpleExplanation").textContent = q.simple;
  $("#answerText").textContent = q.answer;
  $("#exampleText").textContent = q.example;
  $("#termsList").innerHTML = q.terms ? q.terms.map(t=>`<li>${esc(t)}</li>`).join("") : "";
  $("#termsWrap").hidden = !q.terms;
  $("#followupList").innerHTML = q.followups.map(t=>`<li>${esc(t)}</li>`).join("");
  $("#answerSection").hidden = !showAnswer;
  $("#answerToggle").textContent = showAnswer ? "Hide suggested answer" : "Show suggested answer";
  $("#answerToggle").setAttribute("aria-expanded", String(showAnswer));
  $("#selfNotes").value = notes[q.id] || "";
  $("#rating").value = ratings[q.id] || "";
  $("#prevBtn").disabled = q.id === 1;
  $("#nextBtn").disabled = q.id === QUESTIONS.length;
  $("#practicePrompt").textContent = mode==="mock" ? "Answer without looking at the suggested answer. Aim for 45–90 seconds." : mode==="speak" ? "Tap Start speaking, answer naturally, then review your transcript." : "Learn the idea first, then explain it in your own words.";
  $("#transcript").value = lastTranscript;
  $("#modeLearn").classList.toggle("selected",mode==="learn");
  $("#modeSpeak").classList.toggle("selected",mode==="speak");
  $("#modeMock").classList.toggle("selected",mode==="mock");
  $("#recordBtn").hidden = mode==="learn";
  $("#timerHint").textContent = mode==="mock" ? "Mock answer target: 45–90 seconds" : "Practice at your own pace";
}
function renderProgress() {
  $("#totalCount").textContent = QUESTIONS.length;
  $("#practicedCount").textContent = practiced.size;
  $("#masteredCount").textContent = mastered.size;
  $("#progressBar").style.width = `${Math.round(mastered.size/QUESTIONS.length*100)}%`;
  $("#progressLabel").textContent = `${Math.round(mastered.size/QUESTIONS.length*100)}% mastered`;
}
function setMode(m) { mode=m; showAnswer=false; renderQuestion(); }
function revealAnswer() { showAnswer=!showAnswer; renderQuestion(); }
function speak(text) {
  if (!("speechSynthesis" in window)) { alert("Text-to-speech is not supported in this browser. Try Safari or Chrome with speech enabled."); return; }
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = Number($("#speechRate").value || 0.95);
  u.lang = "en-US";
  u.onend = () => $("#speakQuestionBtn").classList.remove("speaking");
  speechSynthesis.speak(u);
  $("#speakQuestionBtn").classList.add("speaking");
}
function stopSpeaking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  $("#speakQuestionBtn")?.classList.remove("speaking");
}
function startRecording() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Speech recognition is not available in this browser. On iPhone, try dictation in the transcript box; on Mac, try Chrome or use your device keyboard microphone.");
    return;
  }
  if (isRecording) { stopRecording(); return; }
  recognition = new SR();
  recognition.lang = "en-US"; recognition.interimResults = true; recognition.continuous = true;
  recognition.onresult = (e) => {
    let text = "";
    for (let i=0;i<e.results.length;i++) text += e.results[i][0].transcript + (e.results[i].isFinal ? " " : "");
    lastTranscript = text.trim();
    $("#transcript").value = lastTranscript;
  };
  recognition.onerror = () => stopRecording();
  recognition.onend = () => { isRecording=false; $("#recordBtn").textContent="🎙 Start speaking"; $("#recordBtn").classList.remove("recording"); };
  try {
    recognition.start(); isRecording=true;
    $("#recordBtn").textContent="■ Stop recording"; $("#recordBtn").classList.add("recording");
  } catch(e) { alert("Could not start microphone. Check browser microphone permission and try again."); }
}
function stopRecording() {
  if (recognition && isRecording) { try { recognition.stop(); } catch(e) {} }
  isRecording=false;
  if ($("#recordBtn")) { $("#recordBtn").textContent="🎙 Start speaking"; $("#recordBtn").classList.remove("recording"); }
}
function markPracticed() { practiced.add(currentId); persist(); renderList(); $("#toast").textContent="Marked as practiced"; showToast(); }
function markMastered() {
  mastered.add(currentId); practiced.add(currentId); persist(); renderList();
  $("#toast").textContent="Question marked mastered"; showToast();
  if(currentId<QUESTIONS.length) setTimeout(()=>selectQuestion(currentId+1),350);
}
function showToast() { $("#toast").classList.add("visible"); setTimeout(()=>$("#toast").classList.remove("visible"),1800); }
function exportProgress() {
  const payload={exportedAt:new Date().toISOString(),mastered:[...mastered],practiced:[...practiced],ratings,notes};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="interview-coach-progress.json"; a.click(); URL.revokeObjectURL(a.href);
}
function importProgress(file) {
  const reader=new FileReader();
  reader.onload=()=>{try{
    const d=JSON.parse(reader.result);
    (d.mastered||[]).forEach(n=>mastered.add(Number(n)));
    (d.practiced||[]).forEach(n=>practiced.add(Number(n)));
    Object.assign(ratings,d.ratings||{}); Object.assign(notes,d.notes||{});
    persist(); renderList(); renderQuestion(); showToast(); $("#toast").textContent="Progress imported";
  }catch(e){alert("That file could not be read as interview-coach progress.");}};
  reader.readAsText(file);
}
function startTimer() {
  let secs=60; const display=$("#timerDisplay");
  clearInterval(window.timerId);
  display.textContent="01:00";
  window.timerId=setInterval(()=>{secs--;display.textContent=`${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
    if(secs<=0){clearInterval(window.timerId);display.textContent="Time’s up";}});
}
function init() {
  renderCategories(); renderList(); renderQuestion(); renderProgress();
  $("#categoryFilter").addEventListener("change",e=>{filter=e.target.value;renderList();});
  $("#searchBox").addEventListener("input",renderList);
  $("#answerToggle").addEventListener("click",revealAnswer);
  $("#modeLearn").addEventListener("click",()=>setMode("learn"));
  $("#modeSpeak").addEventListener("click",()=>setMode("speak"));
  $("#modeMock").addEventListener("click",()=>setMode("mock"));
  $("#speakQuestionBtn").addEventListener("click",()=>speak(byId(currentId).title));
  $("#speakAnswerBtn").addEventListener("click",()=>speak(byId(currentId).answer));
  $("#stopSpeakingBtn").addEventListener("click",stopSpeaking);
  $("#recordBtn").addEventListener("click",startRecording);
  $("#prevBtn").addEventListener("click",()=>selectQuestion(currentId-1));
  $("#nextBtn").addEventListener("click",()=>selectQuestion(currentId+1));
  $("#practicedBtn").addEventListener("click",markPracticed);
  $("#masteredBtn").addEventListener("click",markMastered);
  $("#selfNotes").addEventListener("input",e=>{notes[currentId]=e.target.value;localStorage.setItem("interviewCoachNotes",JSON.stringify(notes));});
  $("#rating").addEventListener("change",e=>{ratings[currentId]=e.target.value;persist();});
  $("#exportBtn").addEventListener("click",exportProgress);
  $("#importBtn").addEventListener("click",()=>$("#importFile").click());
  $("#importFile").addEventListener("change",e=>e.target.files[0]&&importProgress(e.target.files[0]));
  $("#timerBtn").addEventListener("click",startTimer);
  $("#clearSearchBtn").addEventListener("click",()=>{$("#searchBox").value="";filter="All";renderCategories();renderList();});
  $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("mobile-open"));
  document.addEventListener("keydown",e=>{
    if(e.target.matches("input,textarea,select")) return;
    if(e.key==="ArrowRight" && currentId<QUESTIONS.length) selectQuestion(currentId+1);
    if(e.key==="ArrowLeft" && currentId>1) selectQuestion(currentId-1);
  });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
document.addEventListener("DOMContentLoaded",init);
