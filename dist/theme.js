/* Set the appearance before rendering to avoid a flash of the wrong theme. */
(function(){
  const key='forma-appearance-v1';
  const system=typeof window.matchMedia==='function'?window.matchMedia('(prefers-color-scheme: dark)'):null;
  let preference='system';
  try{const saved=localStorage.getItem(key);if(['system','dark','light'].includes(saved))preference=saved;}catch{}
  function apply(){
    const resolved=preference==='system'?(system?(system.matches?'dark':'light'):'dark'):preference;
    document.documentElement.dataset.theme=resolved;
    document.documentElement.style.colorScheme=resolved;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',resolved==='dark'?'#101712':'#f5f5ef');
    document.querySelectorAll('[data-theme-picker]').forEach(select=>select.value=preference);
  }
  window.chooseTheme=function(value){
    if(!['system','dark','light'].includes(value))return;
    preference=value;try{localStorage.setItem(key,value)}catch{}apply();
  };
  if(system){if(system.addEventListener)system.addEventListener('change',apply);else if(system.addListener)system.addListener(apply);}
  document.addEventListener('DOMContentLoaded',apply);apply();
})();
