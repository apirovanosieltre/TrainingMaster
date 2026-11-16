/* A single persistent timer shared by free training and exercise presets. */
const TIMER_KEY = 'forma-training-timer-v1';
const TIMER_DEFAULT = {mode:'countdown',status:'ready',durationMs:90000,remainingMs:90000,endAt:null,elapsedMs:0,startedAt:null,label:'Timer libero',sound:true,countdownSound:true};
function restoreTimer(){
  try {
    const saved=JSON.parse(localStorage.getItem(TIMER_KEY));
    if(!saved||!['countdown','stopwatch'].includes(saved.mode)||!['ready','running','paused','finished'].includes(saved.status))return {...TIMER_DEFAULT};
    const t={...TIMER_DEFAULT,...saved};
    if(typeof saved.countdownSound!=='boolean')t.countdownSound=t.sound!==false;
    if(![t.durationMs,t.remainingMs,t.elapsedMs].every(n=>Number.isFinite(n)&&n>=0)||t.durationMs<1000||t.durationMs>5999000)return {...TIMER_DEFAULT};
    if(t.status==='running'&&!Number.isFinite(t.mode==='countdown'?t.endAt:t.startedAt))return {...TIMER_DEFAULT};
    if(t.mode==='countdown'&&t.status==='running'&&t.endAt<=Date.now())return {...t,status:'finished',remainingMs:0,endAt:null};
    return t;
  }catch{return {...TIMER_DEFAULT};}
}
let trainingTimer=restoreTimer(),timerAudio=null,timerLastCountdownSecond=null;
function timerPersist(){try{localStorage.setItem(TIMER_KEY,JSON.stringify(trainingTimer))}catch{}}
function timerValue(now=Date.now()){
  const t=trainingTimer;
  return t.mode==='countdown'?(t.status==='running'?Math.max(0,t.endAt-now):t.remainingMs):(t.elapsedMs+(t.status==='running'?Math.max(0,now-t.startedAt):0));
}
function timerFormat(ms,ceil=false){const total=Math.max(0,ceil?Math.ceil(ms/1000):Math.floor(ms/1000));const h=Math.floor(total/3600);return (h?String(h).padStart(2,'0')+':':'')+String(Math.floor(total/60)%60).padStart(2,'0')+':'+String(total%60).padStart(2,'0');}
function timerStatus(){const t=trainingTimer;return t.status==='finished'?'Tempo concluso':t.status==='running'?(t.mode==='stopwatch'?'Cronometro in corso':'Conto alla rovescia'):t.status==='paused'?'In pausa':'Pronto a partire';}
function timerUnlockAudio(){
  if(!trainingTimer.sound&&!trainingTimer.countdownSound)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){if(!timerAudio)timerAudio=new Audio();timerAudio.resume().catch(()=>{});}}catch{}
}
function timerPlayTone(frequency,duration,offset=0){
  if(document.hidden||!timerAudio||timerAudio.state!=='running')return false;
  try{const osc=timerAudio.createOscillator(),gain=timerAudio.createGain(),start=timerAudio.currentTime+offset;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.16,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+duration);osc.connect(gain);gain.connect(timerAudio.destination);osc.start(start);osc.stop(start+duration+.02);return true;}catch{return false}
}
function timerChime(){if(!trainingTimer.sound)return;for(let i=0;i<3;i++)timerPlayTone(i===2?880:660,.22,i*.3);}
function timerCheckCountdownSound(){
  const t=trainingTimer;
  if(t.mode!=='countdown'||t.status==='ready'||t.status==='finished'){timerLastCountdownSecond=null;return;}
  if(t.status!=='running')return;
  const second=Math.ceil(timerValue()/1000);
  if(second===timerLastCountdownSecond)return;
  // One cue for the current displayed second; never replay missed cues after backgrounding.
  if(!t.countdownSound||second<1||second>5||document.hidden){timerLastCountdownSecond=second;return;}
  if(timerPlayTone(720,.10))timerLastCountdownSecond=second;
}
function timerPage(){
  const t=trainingTimer,busy=t.status==='running'||t.status==='paused';
  return heading('Il tuo tempo, il tuo ritmo.','Un timer per gli esercizi, un cronometro per tutto il resto.')+`
  <div class="timer-layout"><section class="card timer-main">
    <div class="timer-modes" aria-label="Modalità timer">${[['countdown','Conto alla rovescia'],['stopwatch','Cronometro']].map(([m,l])=>`<button class="${t.mode===m?'selected':''}" aria-pressed="${t.mode===m}" onclick="timerChooseMode('${m}')">${l}</button>`).join('')}</div>
    <p class="eyebrow timer-context">${esc(t.label)}</p>
    <div class="timer-dial" id="timer-dial"><div class="timer-dial-inner"><span class="timer-status" id="timer-status">${timerStatus()}</span><div class="timer-digits" id="timer-digits" role="timer" aria-label="Tempo ${t.mode==='countdown'?'rimanente':'trascorso'}">${timerFormat(timerValue(),t.mode==='countdown')}</div><span class="small">${t.mode==='countdown'?'MINUTI : SECONDI':'TEMPO TRASCORSO'}</span></div></div>
    <div class="timer-actions"><button class="light" onclick="timerReset()" aria-label="Azzera timer">↺ Azzera</button><button id="timer-primary" class="timer-start" onclick="timerToggle()">${t.status==='running'?'Pausa':t.status==='paused'?'Riprendi':t.status==='finished'?'Riparti':'Avvia timer'}</button></div>
    ${t.mode==='countdown'?`<div class="timer-settings"><div class="timer-duration"><div><label for="timer-minutes">Minuti</label><input id="timer-minutes" type="number" inputmode="numeric" min="0" max="99" step="1" value="${Math.floor(t.durationMs/60000)}" ${busy?'disabled':''} onchange="timerEditDuration()"></div><span>:</span><div><label for="timer-seconds">Secondi</label><input id="timer-seconds" type="number" inputmode="numeric" min="0" max="59" step="1" value="${(t.durationMs/1000)%60}" ${busy?'disabled':''} onchange="timerEditDuration()"></div></div><div class="timer-presets" aria-label="Durate rapide">${[30,45,60,90,120].map(n=>`<button class="${t.durationMs===n*1000?'chosen':''}" onclick="timerPreset(${n})">${n<60?n+' s':n%60?Math.floor(n/60)+' min '+n%60+' s':n/60+' min'}</button>`).join('')}</div><p class="small" id="timer-validation" role="status">${busy?'Azzera il timer per modificare la durata.':'Imposta una durata da 1 secondo a 99 minuti e 59 secondi.'}</p></div>`:'<div class="hint">Misura liberamente la durata della sessione. Puoi mettere in pausa e riprendere quando vuoi.</div>'}
    ${screenWakeSettingsHTML()}
    <label class="timer-sound"><input type="checkbox" ${t.sound?'checked':''} onchange="timerSetSound(this.checked)"> Segnale sonoro al termine</label>
    ${t.mode==='countdown'?`<label class="timer-sound"><input type="checkbox" ${t.countdownSound?'checked':''} onchange="timerSetCountdownSound(this.checked)"> Beep negli ultimi 5 secondi</label>`:''}
    <p class="timer-note small">Il tempo resta corretto cambiando pagina o ricaricando. Con schermo bloccato o app chiusa il segnale sonoro non è garantito.</p>
  </section><div class="timer-sidebar"><section class="card"><span class="eyebrow" style="color:#83916f">TEMPI GIÀ PRONTI</span><h2 style="margin:12px 0 8px">Segui la tua scheda</h2><p class="small">Apri un esercizio e scegli il timer di lavoro o di recupero. Le durate sono già impostate dal programma.</p><div class="timer-example"><span>Plank · Sessione A</span><strong>40 s <small>lavoro</small> / 45 s <small>recupero</small></strong></div><button class="light" style="width:100%" onclick="go('plans')">Apri le schede →</button></section><section class="card timer-tip"><h3>Una serie alla volta.</h3><p class="small" style="margin-top:10px">I tempi di recupero fanno parte dell’allenamento. Usali per ritrovare il respiro e prepararti alla prossima serie.</p></section></div></div>`;
}
function timerHasProgress(){const t=trainingTimer;return t.status==='running'||t.status==='paused';}
function timerApplyConfig(config){
  const sound=trainingTimer.sound,countdownSound=trainingTimer.countdownSound;timerLastCountdownSecond=null;trainingTimer={...TIMER_DEFAULT,...config,sound,countdownSound,status:'ready',remainingMs:config.durationMs||TIMER_DEFAULT.durationMs,endAt:null,elapsedMs:0,startedAt:null};timerPersist();
  if($('#modal').open)$('#modal').close();go('timer');timerUpdate();
}
let pendingTimerConfig=null;
function timerConfigure(config){
  if(timerHasProgress()){
    pendingTimerConfig=config;
    modal('Sostituire il timer attuale?',`<p>Il timer «${esc(trainingTimer.label)}» è ${trainingTimer.status==='running'?'ancora in corso':'in pausa'}. Puoi continuarlo oppure sostituirlo con quello nuovo.</p><div class="timer-confirm"><button class="light" onclick="pendingTimerConfig=null;document.querySelector('dialog').close()">Continua quello attuale</button><button onclick="timerConfirmConfig()">Sostituisci timer</button></div>`);
  }else timerApplyConfig(config);
}
function timerConfirmConfig(){if(pendingTimerConfig){const config=pendingTimerConfig;pendingTimerConfig=null;timerApplyConfig(config);}}
function timerFromExercise(label,seconds,phase){timerConfigure({mode:'countdown',label:label+' · '+phase,durationMs:seconds*1000});}
function timerPreset(seconds){timerConfigure({mode:'countdown',label:'Timer libero',durationMs:seconds*1000});}
function timerChooseMode(mode){if(mode!==trainingTimer.mode)timerConfigure({mode,label:'Timer libero',durationMs:trainingTimer.durationMs});}
function timerEditDuration(){
  const minutes=$('#timer-minutes'),seconds=$('#timer-seconds');if(!minutes||!seconds)return;
  const m=Number(minutes.value),s=Number(seconds.value);
  if(!minutes.checkValidity()||!seconds.checkValidity()||minutes.value===''||seconds.value===''||!Number.isInteger(m)||!Number.isInteger(s)||m*60+s<1){$('#timer-validation').textContent='Inserisci da 0 a 99 minuti e da 0 a 59 secondi, per almeno 1 secondo.';return false;}
  trainingTimer.durationMs=(m*60+s)*1000;trainingTimer.remainingMs=trainingTimer.durationMs;trainingTimer.status='ready';trainingTimer.label='Timer libero';timerPersist();timerUpdate();$('#timer-validation').textContent='Durata aggiornata. Il timer è pronto.';return true;
}
function timerToggle(){
  const t=trainingTimer;
  if(t.status==='running'){
    const value=timerValue();if(t.mode==='countdown'){t.remainingMs=value;t.endAt=null;}else{t.elapsedMs=value;t.startedAt=null;}t.status=value<=0&&t.mode==='countdown'?'finished':'paused';
  }else{
    if(t.status==='ready'&&t.mode==='countdown'&&page==='timer'&&t.label==='Timer libero'&&timerEditDuration()===false)return;
    timerUnlockAudio();
    if(t.mode==='countdown'){if(t.status==='finished')t.remainingMs=t.durationMs;t.endAt=Date.now()+t.remainingMs;}else t.startedAt=Date.now();t.status='running';
  }
  timerPersist();if(page==='timer')render();timerUpdate();
}
function timerReset(){
  const t=trainingTimer;timerLastCountdownSecond=null;t.status='ready';t.remainingMs=t.durationMs;t.elapsedMs=0;t.endAt=null;t.startedAt=null;timerPersist();if(page==='timer')render();timerUpdate();
}
function timerSetSound(enabled){trainingTimer.sound=enabled;timerPersist();if(enabled)timerUnlockAudio();}
function timerSetCountdownSound(enabled){trainingTimer.countdownSound=enabled;timerPersist();if(enabled)timerUnlockAudio();}
function timerUpdate(){
  const t=trainingTimer;
  if(t.status==='running'&&t.mode==='countdown'&&timerValue()<=0){t.status='finished';t.remainingMs=0;t.endAt=null;timerPersist();timerChime();if(page==='timer')render();const announce=$('#timer-announcement');if(announce)announce.textContent='Timer concluso. '+t.label;}
  timerCheckCountdownSound();
  if(typeof screenWakeTimerChanged==='function')screenWakeTimerChanged(t.status);
  const text=timerFormat(timerValue(),t.mode==='countdown'),digits=$('#timer-digits');if(digits){digits.textContent=text;digits.classList.toggle('timer-final-countdown',t.mode==='countdown'&&t.status==='running'&&timerValue()>0&&timerValue()<=5000);}
  const status=$('#timer-status');if(status)status.textContent=timerStatus();
  const dial=$('#timer-dial');if(dial){dial.style.setProperty('--timer-progress',t.mode==='countdown'?Math.max(0,Math.min(100,(t.durationMs-timerValue())/t.durationMs*100))+'%':'100%');dial.classList.toggle('finished',t.status==='finished');}
  const dock=$('#timer-dock');if(!dock)return;
  const show=page!=='timer'&&(t.status==='running'||t.status==='paused'||t.status==='finished');dock.hidden=!show;
  if(show){$('#timer-dock-name').textContent=t.label;$('#timer-dock-clock').textContent=text;$('#timer-dock-status').textContent=timerStatus();$('#timer-dock-toggle').textContent=t.status==='running'?'Pausa':t.status==='paused'?'Riprendi':'Riparti';}
  document.title=t.status==='running'?text+' · Forma':'Forma — Il tuo prossimo passo';
}
setInterval(timerUpdate,200);
document.addEventListener('visibilitychange',()=>timerUpdate());
window.addEventListener('pageshow',()=>timerUpdate());
