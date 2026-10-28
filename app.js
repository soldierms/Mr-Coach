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
let importedQuestions = [];
try { importedQuestions = JSON.parse(localStorage.getItem("interviewCoachImportedQuestions") || "[]"); } catch(e) { importedQuestions = []; }
QUESTIONS.push(...importedQuestions);
const selectedForPrint = new Set();
const categoriesNow = () => ["All", ...new Set(QUESTIONS.map(q => q.category))];

function persist() {
  localStorage.setItem("interviewCoachProgress", JSON.stringify({
    mastered: [...mastered], practiced: [...practiced], ratings
  }));
  localStorage.setItem("interviewCoachNotes", JSON.stringify(notes));
  renderProgress();
}
function esc(s="") { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderCategories() {
  $("#categoryFilter").innerHTML = categoriesNow().map(c => `<option ${c===filter?'selected':''}>${esc(c)}</option>`).join("");
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
  renderPrintList();
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
  $("#questionNumber").textContent = `QUESTION ${String(QUESTIONS.findIndex(x=>x.id===q.id)+1).padStart(2,"0")} OF ${QUESTIONS.length}`;
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
  const qIndex = QUESTIONS.findIndex(x=>x.id===q.id);
  $("#prevBtn").disabled = qIndex <= 0;
  $("#nextBtn").disabled = qIndex >= QUESTIONS.length-1;
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
  const idx=QUESTIONS.findIndex(q=>q.id===currentId); if(idx>=0 && idx<QUESTIONS.length-1) setTimeout(()=>selectQuestion(QUESTIONS[idx+1].id),350);
}
function showToast() { $("#toast").classList.add("visible"); setTimeout(()=>$("#toast").classList.remove("visible"),1800); }
function exportProgress() {
  const payload={exportedAt:new Date().toISOString(),mastered:[...mastered],practiced:[...practiced],ratings,notes,importedQuestions};
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
    if(Array.isArray(d.importedQuestions)){for(const q of d.importedQuestions){if(q&&q.title&&!QUESTIONS.some(existing=>existing.title.toLowerCase()===String(q.title).toLowerCase())){const id=Math.max(0,...QUESTIONS.map(x=>Number(x.id)||0))+1;q.id=id;QUESTIONS.push(q);importedQuestions.push(q);}}localStorage.setItem("interviewCoachImportedQuestions",JSON.stringify(importedQuestions));renderCategories();}
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
function renderPrintList() {
  const host=$("#printQuestionList"); if(!host) return;
  host.innerHTML=QUESTIONS.map(q=>`<label class="print-choice"><input type="checkbox" data-print-id="${q.id}" ${selectedForPrint.has(q.id)?"checked":""}><span><b>${esc(q.title)}</b><small>${esc(q.category || "Imported")}</small></span></label>`).join("");
  host.querySelectorAll("[data-print-id]").forEach(input=>input.addEventListener("change",()=>{const id=Number(input.dataset.printId);input.checked?selectedForPrint.add(id):selectedForPrint.delete(id);updatePrintCount();}));
  updatePrintCount();
}
function updatePrintCount(){const el=$("#printSelectedCount");if(el)el.textContent=`${selectedForPrint.size} selected`;}
function printSelectedQuestions(){
  const chosen=QUESTIONS.filter(q=>selectedForPrint.has(q.id));
  if(!chosen.length){alert("Select at least one question to print.");return;}
  const html=chosen.map((q,i)=>`<article><h2>${i+1}. ${esc(q.title)}</h2><p class="category">${esc(q.category||"Imported question")}</p><h3>Suggested answer</h3><p>${esc(q.answer||"Answer to be added.")}</p></article>`).join("");
  const w=window.open("","_blank");
  if(!w){alert("Your browser blocked the print window. Allow pop-ups for this app and try again.");return;}
  w.document.write(`<!doctype html><html><head><title>Interview questions</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font:15px/1.6 Arial,sans-serif;color:#182230;max-width:800px;margin:35px auto;padding:0 24px}h1{font-size:25px}h2{font-size:19px;margin-bottom:3px}h3{font-size:13px;margin-bottom:3px}.category{font-size:11px;color:#667085;margin-top:0}article{break-inside:avoid;border-bottom:1px solid #ddd;padding:12px 0 18px}p{white-space:pre-wrap}@media print{body{margin:0 auto;padding:0 12mm}article{break-inside:avoid}}</style></head><body><h1>Technical Interview Practice</h1>${html}<script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}
function loadScript(src){return new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>s.src===src);if(existing){existing.addEventListener("load",resolve,{once:true});if(window.pdfjsLib||window.mammoth||window.Tesseract)resolve();return;}const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error("Could not load document reader library. Check your internet connection."));document.head.appendChild(s);});}
function parseExtractedText(text,filename){
  const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const blocks=[];let current=[];
  const isQuestion=line=>/^(?:\d+[.)]|q\s*\d+[:.)]?|question\s*\d*[:.)]?|[-•*])\s+/i.test(line)||(/\?\s*$/.test(line)&&line.length<220);
  for(const line of lines){if(isQuestion(line)&&current.length){blocks.push(current);current=[line.replace(/^(?:\d+[.)]|q\s*\d+[:.)]?|question\s*\d*[:.)]?|[-•*])\s+/i,"")];}else current.push(line);}
  if(current.length)blocks.push(current);
  const found=[];
  for(const b of blocks){const title=(b[0]||"").replace(/^Question:\s*/i,"").trim();if(!title||title.length<8)continue;
    const rest=b.slice(1).join(" ").trim();
    found.push({title,category:filename.replace(/\.[^.]+$/,"").slice(0,60)||"Imported questions",simple:"Review this question and explain it in your own words.",answer:rest||"Draft answer: add a truthful, interview-ready answer here.",example:"Add a real example from your own experience.",followups:[],source:filename});
  }
  if(!found.length){const chunks=text.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>x.length>15);for(const chunk of chunks){const first=chunk.split(/[.!?]\s/)[0].slice(0,180);if(first)found.push({title:first,category:filename.replace(/\.[^.]+$/,"")||"Imported questions",simple:"Review and edit this extracted item.",answer:chunk.slice(first.length).trim()||"Draft answer: add an answer here.",example:"Add a real example.",followups:[],source:filename});}}
  return found;
}
async function extractFile(file){
  const name=file.name.toLowerCase();let text="";
  setUploadStatus(`Reading ${file.name}…`);
  if(name.endsWith(".txt")||name.endsWith(".md")){text=await file.text();}
  else if(name.endsWith(".pdf")){
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    if(!window.pdfjsLib)throw new Error("PDF reader did not load.");
    pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const doc=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;const pages=[];
    for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i);const content=await page.getTextContent();pages.push(content.items.map(x=>x.str).join(" "));}
    text=pages.join("\n");
    if(!text.trim())throw new Error("This PDF appears to be scanned. Upload page images or use an OCR-enabled PDF.");
  } else if(name.endsWith(".docx")){
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js");
    const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});text=result.value;
  } else if(file.type.startsWith("image/")){
    await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
    setUploadStatus(`Recognizing text in ${file.name}. This may take a little while…`);
    const result=await Tesseract.recognize(file,"eng");text=result.data.text;
  } else throw new Error(`Unsupported file type: ${file.name}`);
  return parseExtractedText(text,file.name);
}
function setUploadStatus(message){const el=$("#uploadStatus");if(el)el.textContent=message;}
async function handleQuestionFiles(files){
  const all=[];
  for(const file of files){try{const items=await extractFile(file);all.push(...items);setUploadStatus(`${file.name}: extracted ${items.length} possible question(s).`);}catch(e){setUploadStatus(`${file.name}: ${e.message}`);}}
  $("#importReview").value=JSON.stringify(all,null,2);
  if(all.length)setUploadStatus(`Extracted ${all.length} possible question(s). Review and edit the JSON below before importing. Extraction can be imperfect, especially from photos.`);
  else setUploadStatus("No likely questions were extracted. Try a clearer image or a text-based document, or paste questions into the review box as JSON.");
}
function importReviewedQuestions(){
  let items;try{items=JSON.parse($("#importReview").value);}catch(e){alert("The review area must contain valid JSON. Check commas and quotation marks.");return;}
  if(!Array.isArray(items)||!items.length){alert("Add at least one question object to import.");return;}
  const existing=new Set(QUESTIONS.map(q=>q.title.trim().toLowerCase()));let added=0;
  for(const item of items){if(!item||typeof item.title!=="string"||!item.title.trim())continue;const title=item.title.trim();if(existing.has(title.toLowerCase()))continue;
    const id=Math.max(0,...QUESTIONS.map(q=>Number(q.id)||0))+1;
    const q={id,category:String(item.category||"Imported questions"),title,simple:String(item.simple||"Review this question and explain it in your own words."),answer:String(item.answer||"Draft answer: add a truthful answer here."),example:String(item.example||"Add a real example from your experience."),followups:Array.isArray(item.followups)?item.followups:[],terms:Array.isArray(item.terms)?item.terms:[],source:String(item.source||"Imported document")};
    QUESTIONS.push(q);existing.add(title.toLowerCase());importedQuestions.push(q);added++;
  }
  localStorage.setItem("interviewCoachImportedQuestions",JSON.stringify(importedQuestions));
  if(!added){alert("No new questions were imported. They may be duplicates or missing titles.");return;}
  renderCategories();renderList();renderProgress();setUploadStatus(`Imported ${added} new question(s). Your original questions and existing progress were kept.`);$("#importReview").value="";showToast();$("#toast").textContent=`Imported ${added} questions`;
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
  $("#prevBtn").addEventListener("click",()=>{const i=QUESTIONS.findIndex(q=>q.id===currentId);if(i>0)selectQuestion(QUESTIONS[i-1].id);});
  $("#nextBtn").addEventListener("click",()=>{const i=QUESTIONS.findIndex(q=>q.id===currentId);if(i>=0&&i<QUESTIONS.length-1)selectQuestion(QUESTIONS[i+1].id);});
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
  $("#questionFiles").addEventListener("change",e=>{if(e.target.files&&e.target.files.length)handleQuestionFiles([...e.target.files]);e.target.value="";});
  $("#importQuestionsBtn").addEventListener("click",importReviewedQuestions);
  $("#clearImportReviewBtn").addEventListener("click",()=>{$("#importReview").value="";setUploadStatus("Review area cleared. Your imported questions remain saved.");});
  $("#selectAllPrintBtn").addEventListener("click",()=>{QUESTIONS.forEach(q=>selectedForPrint.add(q.id));renderPrintList();});
  $("#clearPrintBtn").addEventListener("click",()=>{selectedForPrint.clear();renderPrintList();});
  $("#printSelectedBtn").addEventListener("click",printSelectedQuestions);
  document.addEventListener("keydown",e=>{
    if(e.target.matches("input,textarea,select")) return;
    const i=QUESTIONS.findIndex(q=>q.id===currentId);
    if(e.key==="ArrowRight" && i>=0 && i<QUESTIONS.length-1) selectQuestion(QUESTIONS[i+1].id);
    if(e.key==="ArrowLeft" && i>0) selectQuestion(QUESTIONS[i-1].id);
  });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
document.addEventListener("DOMContentLoaded",init);
