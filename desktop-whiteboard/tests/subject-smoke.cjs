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
 await command('tool','pen');await frame();
 assert.equal(b.getState().mode,'draw','choosing pen from startup activates drawing');
 assert.equal(b.overlay.isFocusable(),true);
 await command('mode','interact');await command('color','#2164df');await frame();
 assert.equal(b.getState().mode,'draw','choosing a pen color activates drawing');
 console.log('PASS startup pen selection / focusable overlay / automatic draw mode');
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
 for(const tool of ['line','triangle','rectangle','square','circle','ellipse']) {
  await command('tool',tool);await frame();
  await b.overlay.webContents.executeJavaScript(`{const c=document.querySelector('#ink');for(const [type,x,y] of [['pointerdown',100,100],['pointermove',200,160],['pointerup',300,220]])c.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:x,clientY:y}));}`);
  assert(await b.overlay.webContents.executeJavaScript(`{const c=document.querySelector('#ink');const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data; a.some((v,i)=>i%4===3&&v>0)}`),tool);
  await command('undo');await frame();
  assert.equal(await b.overlay.webContents.executeJavaScript(`{const c=document.querySelector('#ink');const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data; a.some((v,i)=>i%4===3&&v>0)}`),false,tool+' undo');
 }
 console.log('PASS six shape tools: real renderer drag / preview / one-step undo');
 require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/subject-toolbar.png'),(await b.control.webContents.capturePage()).toPNG());
 console.log('PASS Electron simulated screen: 8 backgrounds / pen / separate histories / desktop return / clear / toolbar layout');
 const expanded=b.control.getBounds();
 await command('collapse');
 await b.control.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 const icons=await b.control.webContents.executeJavaScript(`(()=>{const buttons=[...document.querySelectorAll('#compact-buttons button')],main=document.querySelector('main');return {count:buttons.length,labeled:buttons.every(b=>b.title&&b.getAttribute('aria-label')),touch:buttons.every(b=>b.getBoundingClientRect().height>=48),visible:getComputedStyle(document.querySelector('#compact-tools')).display!=='none',overflow:main.scrollWidth>main.clientWidth};})()`);
 assert.deepEqual(icons,{count:19,labeled:true,touch:true,visible:true,overflow:false});
 await b.control.webContents.executeJavaScript(`document.querySelector('#compact-buttons [data-value="circle"]').click()`);
 assert.equal(b.getState().tool,'circle');
 await b.control.webContents.executeJavaScript(`{const select=document.querySelector('#compact-background');select.value='music';select.dispatchEvent(new Event('change'));}`);
 await frame();assert.equal(b.getState().background,'music');
 require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/compact-toolbar.png'),(await b.control.webContents.capturePage()).toPNG());
 await command('toolbarLayout','bottom');
 await b.control.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 assert.equal(b.control.getBounds().width,1120);assert.equal(b.control.getBounds().y,492);
 assert.equal(await b.control.webContents.executeJavaScript(`document.querySelectorAll('.icon-group').length`),5);
 assert.equal(await b.control.webContents.executeJavaScript(`document.querySelector('main').scrollWidth<=document.querySelector('main').clientWidth`),true);
 assert.equal(await b.control.webContents.executeJavaScript(`document.querySelector('main').scrollHeight<=document.querySelector('main').clientHeight`),true);
 require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/bottom-toolbar.png'),(await b.control.webContents.capturePage()).toPNG());
 await command('toolbarLayout','side');
 console.log('PASS grouped sections / bottom toolbar position and layout / side layout toggle');
 await command('collapse');assert.deepEqual(b.control.getBounds(),expanded);
 console.log('PASS compact icons: all 19 tools / hover labels / touch sizes / circle and background actions / expanded bounds restored');
 // Simulate a slow initial IPC response arriving after a live mode change.
 await command('mode','interact');
 const {ipcMain}=require('electron');
 ipcMain.removeHandler('board:get');
 ipcMain.handle('board:get',event=>{
   const snapshot=b.getState();
   return event.sender===b.overlay.webContents ? new Promise(r=>setTimeout(()=>r(snapshot),500)) : snapshot;
 });
 await new Promise(r=>{b.overlay.webContents.once('did-finish-load',r);b.overlay.webContents.reload();});
 await command('tool','pen');await frame();
 await b.overlay.webContents.executeJavaScript('new Promise(r=>setTimeout(r,600))');
 assert.equal(await b.overlay.webContents.executeJavaScript('document.body.dataset.mode'),'draw','late initial state cannot turn drawing off');
 console.log('PASS delayed startup state cannot overwrite a live draw selection');
 clearTimeout(timeout);app.quit();
}).catch(e=>{console.error(e);clearTimeout(timeout);app.exit(1)});
