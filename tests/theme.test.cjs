const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const source=fs.readFileSync('dist/theme.js','utf8');
function load({dark=false,saved=null,supported=true}={}){
 const root={dataset:{},style:{}},select={value:null},meta={setAttribute(k,v){this[k]=v}},media={matches:dark,addEventListener(name,fn){this.change=fn}},storage=new Map(saved?[['forma-appearance-v1',saved]]:[]);
 const ctx=vm.createContext({window:{...(supported?{matchMedia:()=>media}:{})},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{documentElement:root,querySelector:()=>meta,querySelectorAll:()=>[select],addEventListener(){}}});vm.runInContext(source,ctx);
 return {root,select,meta,storage,set:v=>ctx.window.chooseTheme(v),system:v=>{media.matches=v;media.change()}};
}
test('default theme follows changes to the phone appearance',()=>{const app=load({dark:true});assert.equal(app.root.dataset.theme,'dark');app.system(false);assert.equal(app.root.dataset.theme,'light');assert.equal(app.select.value,'system')});
test('manual selection persists and is not overwritten by the device',()=>{const app=load({dark:true});app.set('light');app.system(true);assert.equal(app.root.dataset.theme,'light');assert.equal(app.storage.get('forma-appearance-v1'),'light');assert.equal(app.meta.content,'#f5f5ef');assert.equal(load({dark:true,saved:'light'}).root.dataset.theme,'light')});
test('returning to automatic immediately applies the device theme',()=>{const app=load({dark:true,saved:'light'});app.set('system');assert.equal(app.root.dataset.theme,'dark');assert.equal(app.select.value,'system')});
test('missing system theme support falls back to dark',()=>{assert.equal(load({supported:false}).root.dataset.theme,'dark')});
