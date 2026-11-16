/* Screen Wake Lock lifecycle, isolated from the timer and persisted data. */
function createScreenWakeController(env){
  const key='forma-screen-awake-v1';
  let preference={enabled:false,mode:'timer'};
  try{const saved=JSON.parse(env.storage.getItem(key));if(saved&&typeof saved.enabled==='boolean'&&['timer','app'].includes(saved.mode))preference={enabled:saved.enabled,mode:saved.mode};}catch{}
  let sentinel=null,pending=null,generation=0,timerRunning=false,lastTimerStatus=null,away=false,blocked=false,status='off';
  function supported(){return env.secure!==false&&!!env.wakeLock&&typeof env.wakeLock.request==='function';}
  function visible(){return !away&&env.document.visibilityState==='visible';}
  function wanted(){return preference.enabled&&visible()&&(preference.mode==='app'||timerRunning);}
  function snapshot(){return {enabled:preference.enabled,mode:preference.mode,supported:supported(),active:!!sentinel&&!sentinel.released,status};}
  function notify(next){status=next;env.onChange?.(snapshot());}
  function save(){try{env.storage.setItem(key,JSON.stringify(preference));}catch{}}
  function safeRelease(lock){try{const result=lock.release();if(result&&typeof result.catch==='function')result.catch(()=>{});}catch{}}
  function restingStatus(){return !supported()?'unsupported':!preference.enabled?'off':!visible()?'hidden':preference.mode==='timer'&&!timerRunning?'waiting':'released';}
  function sync({retry=false}={}){
    if(retry)blocked=false;
    if(!supported()||!wanted()){
      generation++;const old=sentinel;sentinel=null;if(old&&!old.released)safeRelease(old);notify(restingStatus());return pending||Promise.resolve();
    }
    if(sentinel&&!sentinel.released){notify('active');return Promise.resolve();}
    if(pending){notify('requesting');return pending;}
    if(blocked){notify(status==='denied'?'denied':'released');return Promise.resolve();}
    const requestGeneration=++generation;notify('requesting');
    pending=Promise.resolve().then(()=>env.wakeLock.request('screen')).then(lock=>{
      if(requestGeneration!==generation||!wanted()){safeRelease(lock);return;}
      if(lock.released){blocked=true;notify('released');return;}
      sentinel=lock;
      lock.addEventListener('release',()=>{if(sentinel!==lock)return;sentinel=null;blocked=true;notify(wanted()?'released':restingStatus());});
      notify('active');
    }).catch(()=>{if(requestGeneration===generation){blocked=true;notify(wanted()?'denied':restingStatus());}}).finally(()=>{
      pending=null;
      // An on/off change may invalidate a request while it is still awaiting the platform.
      if(requestGeneration!==generation&&supported()&&wanted())sync();
    });
    return pending;
  }
  function setEnabled(value){preference.enabled=!!value;save();return sync({retry:true});}
  function setMode(value){if(!['timer','app'].includes(value))return Promise.resolve();preference.mode=value;save();return sync({retry:true});}
  function timerStatusChanged(value){if(value===lastTimerStatus)return;lastTimerStatus=value;timerRunning=value==='running';return sync({retry:timerRunning});}
  function visibilityChanged(){return sync({retry:visible()});}
  function pageHidden(){away=true;return sync();}
  function pageShown(){away=false;return sync({retry:true});}
  status=restingStatus();
  return {snapshot,sync,setEnabled,setMode,timerStatusChanged,visibilityChanged,pageHidden,pageShown,retry:()=>sync({retry:true})};
}
if(typeof module!=='undefined'&&module.exports)module.exports={createScreenWakeController};
else {
  let wakeStorage;try{wakeStorage=window.localStorage;}catch{wakeStorage={getItem:()=>null,setItem(){}};}
  const screenWakeController=createScreenWakeController({wakeLock:navigator.wakeLock,document,storage:wakeStorage,secure:window.isSecureContext,onChange:()=>screenWakeRender()});
  const SCREEN_WAKE_MESSAGES={
    off:['Disattivato','Attiva l’opzione per evitare lo spegnimento automatico durante l’uso scelto.'],
    waiting:['In attesa del timer','Si attiverà avviando il timer o il cronometro e si fermerà in pausa o al termine.'],
    requesting:['Attivazione…','Sto chiedendo al telefono di mantenere lo schermo acceso.'],
    active:['Attivo','Lo schermo viene mantenuto acceso finché l’app è visibile, secondo la modalità scelta.'],
    hidden:['Sospeso','L’app non è visibile. Al ritorno proverà a riattivarsi se necessario.'],
    released:['Interrotto dal telefono','Il sistema ha interrotto la funzione. Puoi riprovare; non viene forzato il blocco manuale.'],
    denied:['Non disponibile ora','Il telefono o il browser non hanno consentito l’attivazione. Puoi riprovare o controllare il risparmio energetico.'],
    unsupported:['Non supportato','Questa funzione non è disponibile in questo browser o contesto. Il timer resta utilizzabile normalmente.']
  };
  window.screenWakeSettingsHTML=function(){const s=screenWakeController.snapshot(),message=SCREEN_WAKE_MESSAGES[s.status];return `<section class="screen-awake-panel" aria-label="Schermo acceso"><div class="screen-awake-heading"><label for="screen-awake-enabled"><input id="screen-awake-enabled" type="checkbox" ${s.enabled?'checked':''} ${!s.supported?'disabled':''} aria-describedby="screen-awake-help" onchange="screenWakeSetEnabled(this.checked)"><span>Mantieni schermo acceso</span></label><span class="screen-awake-badge ${s.active?'is-active':''}" data-screen-awake-badge>${message[0]}</span></div><label class="screen-awake-scope-label" for="screen-awake-mode">Quando mantenerlo acceso</label><select id="screen-awake-mode" ${!s.supported?'disabled':''} onchange="screenWakeSetMode(this.value)"><option value="timer" ${s.mode==='timer'?'selected':''}>Solo con il timer in corso</option><option value="app" ${s.mode==='app'?'selected':''}>Finché uso l’app</option></select><p id="screen-awake-help" class="small screen-awake-status" role="status" data-screen-awake-help>${message[1]}</p><button class="textbtn screen-awake-retry" data-screen-awake-retry ${['denied','released'].includes(s.status)?'':'hidden'} onclick="screenWakeRetry()">Riprova ad attivare</button><p class="small screen-awake-footnote">Puoi sempre bloccare il telefono. Passando a un’altra app la funzione si sospende. Tenere acceso lo schermo consuma più batteria.</p></section>`;};
  window.screenWakeSetEnabled=value=>screenWakeController.setEnabled(value);
  window.screenWakeSetMode=value=>screenWakeController.setMode(value);
  window.screenWakeRetry=()=>screenWakeController.retry();
  window.screenWakeTimerChanged=value=>screenWakeController.timerStatusChanged(value);
  function screenWakeRender(){const s=screenWakeController.snapshot(),message=SCREEN_WAKE_MESSAGES[s.status];document.querySelectorAll('[data-screen-awake-badge]').forEach(el=>{el.textContent=message[0];el.classList.toggle('is-active',s.active);});document.querySelectorAll('[data-screen-awake-help]').forEach(el=>{if(el.textContent!==message[1])el.textContent=message[1];});document.querySelectorAll('[data-screen-awake-retry]').forEach(el=>{el.hidden=!['denied','released'].includes(s.status);});const checkbox=document.getElementById('screen-awake-enabled');if(checkbox){checkbox.checked=s.enabled;checkbox.disabled=!s.supported;}const select=document.getElementById('screen-awake-mode');if(select){select.value=s.mode;select.disabled=!s.supported;}}
  document.addEventListener('visibilitychange',()=>screenWakeController.visibilityChanged());
  document.addEventListener('DOMContentLoaded',()=>screenWakeController.sync());
  window.addEventListener('pagehide',()=>screenWakeController.pageHidden());
  window.addEventListener('pageshow',()=>screenWakeController.pageShown());
}
