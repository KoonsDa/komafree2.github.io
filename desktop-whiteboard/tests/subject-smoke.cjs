// Headless renderer verification with a simulated screen, not hardware calibration.
const {app,screen}=require('electron');
const assert=require('node:assert/strict');
const {createWhiteboard}=require('../windows.cjs');
const timeout=setTimeout(()=>app.exit(1),20000);
app.whenReady().then(async()=>{
 const display={id:1,label:'Test',bounds:{x:0,y:0,width:1280,height:720},workArea:{x:0,y:0,width:1280,height:720},scaleFactor:1};
 screen.getPrimaryDisplay=()=>display;screen.getAllDisplays=()=>[display];screen.getDisplayMatching=()=>display;
 const b=await createWhiteboard();
 const command=(k,v)=>b.control.webContents.executeJavaScript(`window.whiteboard.command(${JSON.stringify(k)},${JSON.stringify(v)})`);
 const frame=()=>b.overlay.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 for(const background of ['grid','dots','music','english','korean','white','black','desktop']){
  await command('background',background);await frame();
  const a=await b.overlay.webContents.executeJavaScript(`document.querySelector('#background').getContext('2d').getImageData(10,10,1,1).data[3]`);
  assert.equal(a,background==='desktop'?0:255);
 }
 await command('background','grid');await frame();
 await b.overlay.webContents.executeJavaScript(`{const c=document.querySelector('#ink');c.setPointerCapture=()=>{};c.hasPointerCapture=()=>false;for(const [type,x] of [['pointerdown',100],['pointermove',200],['pointerup',250]])c.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:x,clientY:120}));}`);
 const alpha=()=>b.overlay.webContents.executeJavaScript(`document.querySelector('#ink').getContext('2d').getImageData(150,120,1,1).data[3]`);
 assert(await alpha()>0);await command('background','music');await frame();assert.equal(await alpha(),0);
 await command('background','grid');await frame();assert(await alpha()>0);
 await command('mode','interact');await frame();
 assert.equal(await b.overlay.webContents.executeJavaScript(`getComputedStyle(document.querySelector('#background')).visibility`),'hidden');
 assert.equal(await b.overlay.webContents.executeJavaScript(`getComputedStyle(document.querySelector('#ink')).visibility`),'hidden');
 await command('mode','draw');await frame();assert(await alpha()>0);
 await command('clear');await frame();assert.equal(await alpha(),0);
 assert.equal(await b.control.webContents.executeJavaScript(`document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth`),true);
 require('node:fs').writeFileSync('/workspace/scratch/0351f1cde376/subject-toolbar.png',(await b.control.webContents.capturePage()).toPNG());
 console.log('PASS Electron simulated screen: 8 backgrounds / pen / separate histories / desktop return / clear / toolbar layout');
 clearTimeout(timeout);app.quit();
}).catch(e=>{console.error(e);clearTimeout(timeout);app.exit(1)});
