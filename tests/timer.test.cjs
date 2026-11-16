const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('dist/timer.js','utf8');
function runtime(saved){
 let now=100000;const storage=new Map(saved?[['forma-training-timer-v1',saved]]:[]);
 const ctx=vm.createContext({Date:{now:()=>now},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{hidden:false,addEventListener(){},querySelector:()=>null},window:{addEventListener(){}},setInterval(){},page:'home',$:()=>null,modal(){},go(){},esc:s=>s,heading(){}});
 vm.runInContext(source,ctx);
 return {run:s=>vm.runInContext(s,ctx),advance:ms=>now+=ms,saved:()=>storage.get('forma-training-timer-v1')};
}
test('countdown uses elapsed wall time, preserves paused time and completes once',()=>{
 const r=runtime();r.run('timerToggle()');r.advance(30000);assert.equal(r.run('timerValue()'),60000);
 r.run('timerToggle()');r.advance(120000);assert.equal(r.run('timerValue()'),60000);
 r.run('timerToggle()');r.advance(65000);r.run('timerUpdate()');assert.equal(r.run('trainingTimer.status'),'finished');assert.equal(r.run('timerValue()'),0);
 r.run('timerToggle()');assert.equal(r.run('timerValue()'),90000);
});
test('reload restores the original deadline instead of restarting the countdown',()=>{
 const r=runtime();r.run('timerToggle()');const restored=runtime(r.saved());restored.advance(45000);assert.equal(restored.run('timerValue()'),45000);
 const expired=runtime(r.saved());expired.advance(95000);expired.run('timerUpdate()');assert.equal(expired.run('trainingTimer.status'),'finished');
});
test('stopwatch retains accumulated time across pause and reload',()=>{
 const r=runtime();r.run("trainingTimer.mode='stopwatch';timerToggle()");r.advance(10000);r.run('timerToggle()');r.advance(90000);assert.equal(r.run('timerValue()'),10000);
 const restored=runtime(r.saved());assert.equal(restored.run('timerValue()'),10000);restored.run('timerToggle()');restored.advance(5000);assert.equal(restored.run('timerValue()'),15000);
});
test('an active timer is not overwritten without choosing replacement',()=>{
 const r=runtime();r.run('timerToggle()');r.advance(10000);r.run("timerConfigure({mode:'countdown',durationMs:40000,label:'Plank'})");assert.equal(r.run('trainingTimer.label'),'Timer libero');assert.equal(r.run('timerValue()'),80000);assert.equal(r.run('pendingTimerConfig.durationMs'),40000);
});
test('invalid saved timer data falls back safely',()=>{
 for(const saved of ['invalid',JSON.stringify({mode:'countdown',status:'running',durationMs:-2}),JSON.stringify({mode:'countdown',status:'running',durationMs:90000,endAt:null})]){
 const r=runtime(saved);assert.equal(r.run('trainingTimer.status'),'ready');assert.equal(r.run('timerValue()'),90000);
 }
});
