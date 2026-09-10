const {app, screen} = require('electron');
const assert = require('node:assert/strict');
const {createWhiteboard} = require('../windows.cjs');
const errors=[];
app.on('web-contents-created', (_event,wc) => {
  wc.on('console-message', event => { if(event.level==='error') errors.push(event.message); });
  wc.on('preload-error', (_event,_path,error)=>errors.push(error.message));
});
const timeout=setTimeout(()=>{console.error('Electron smoke timeout');app.exit(1);},30000);
app.whenReady().then(async()=>{
  const board=await createWhiteboard();
  const detected=screen.getAllDisplays();
  console.log('Detected monitors:',JSON.stringify(detected.map(d=>({id:d.id,bounds:d.bounds,workArea:d.workArea,scaleFactor:d.scaleFactor,label:d.label||''}))));
  const originalControl=board.control.getBounds();
  for(const target of detected) {
    await board.control.webContents.executeJavaScript(`window.whiteboard.command('display',${target.id})`);
    await board.overlay.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    assert.deepEqual(board.overlay.getBounds(),target.bounds);
    assert.deepEqual(board.control.getBounds(),originalControl,'monitor selection leaves control in place');
    const canvas=await board.overlay.webContents.executeJavaScript(`({width:innerWidth,height:innerHeight,ratio:devicePixelRatio,pixels:document.querySelector('canvas').width})`);
    assert.equal(canvas.width,target.bounds.width);assert.equal(canvas.height,target.bounds.height);
    assert.equal(canvas.ratio,target.scaleFactor);assert.equal(canvas.pixels,Math.round(canvas.width*canvas.ratio));
    console.log('PASS actual monitor',target.id,'overlay bounds / control fixed / canvas DPI');
  }
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('display',${screen.getPrimaryDisplay().id})`);
  assert.equal(await board.control.webContents.executeJavaScript('document.querySelector("#monitor-picker").hidden'),detected.length<2);
  // UI fixture only: confirms options/selection for multiple attached displays.
  board.control.webContents.send('board:state',{...board.getState(),displayId:2,displays:[
    {id:1,label:''},{id:2,label:'전자칠판'},{id:3,label:'추가 모니터'}]});
  await board.control.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const picker=await board.control.webContents.executeJavaScript(`({hidden:document.querySelector('#monitor-picker').hidden,count:document.querySelector('#monitors').options.length,value:document.querySelector('#monitors').value,overflow:document.querySelector('main').scrollWidth>document.querySelector('main').clientWidth})`);
  assert.deepEqual(picker,{hidden:false,count:3,value:'2',overflow:false});
  board.control.webContents.send('board:state',board.getState());
  assert.equal(board.control.isResizable(),true);
  const work=screen.getPrimaryDisplay().workArea, initial=board.control.getBounds();
  assert(initial.height<=work.height-16); assert(initial.width<=work.width-16);
  assert.equal(initial.height,Math.min(920,work.height-16));
  for(const window of [board.control,board.overlay]) {
    const prefs=window.webContents.getLastWebPreferences();
    assert.equal(prefs.nodeIntegration,false);assert.equal(prefs.contextIsolation,true);assert.equal(prefs.sandbox,true);
    assert.equal(await window.webContents.executeJavaScript('typeof window.whiteboard.command'), 'function');
    assert.equal(await window.webContents.executeJavaScript('typeof window.require'), 'undefined');
  }
  const bounds=board.overlay.getBounds();assert.equal(bounds.width,screen.getPrimaryDisplay().bounds.width);assert.equal(bounds.height,screen.getPrimaryDisplay().bounds.height);
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('mode','draw')`);
  assert.equal(board.getState().mode,'draw');
  await board.overlay.webContents.executeJavaScript(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  await board.overlay.webContents.executeJavaScript(`{
    const canvas=document.querySelector('canvas');
    // Synthetic pointer events cannot capture a native pointer. Disable capture
    // only in this test realm, while exercising the real renderer event handlers.
    canvas.setPointerCapture=()=>{}; canvas.hasPointerCapture=()=>false;
    for (const [type,x] of [['pointerdown',100],['pointermove',200],['pointerup',250]]) canvas.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:x,clientY:120}));
  }`);
  const alpha=await board.overlay.webContents.executeJavaScript(`{const c=document.querySelector('canvas');c.getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]}`);
  assert(alpha>0,'pen drew pixels');
  // Renderer surface switch preserves original pixels; no second physical monitor is implied.
  board.overlay.webContents.send('board:state',{...board.getState(),displayId:-999,displayRevision:999});
  await board.overlay.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  assert.equal(await board.overlay.webContents.executeJavaScript(`{const c=document.querySelector('canvas');c.getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]}`),0);
  board.overlay.webContents.send('board:state',board.getState());
  await board.overlay.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  assert((await board.overlay.webContents.executeJavaScript(`{const c=document.querySelector('canvas');c.getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]}`))>0);
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('clear')`);
  await board.overlay.webContents.executeJavaScript(`new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  const cleared=await board.overlay.webContents.executeJavaScript(`{const c=document.querySelector('canvas');c.getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]}`);
  assert.equal(cleared,0);
  // Emulated Chromium DPI plus the main-process display-metrics notification
  // exercises real canvas pixels even when CSS dimensions stay unchanged.
  // This is not a claim of testing physical dual-monitor touch calibration.
  board.overlay.webContents.debugger.attach('1.3');
  for(const ratio of [1.25,1.5]) {
    await board.overlay.webContents.debugger.sendCommand('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:ratio,mobile:false});
    board.overlay.webContents.send('board:state',{...board.getState(),displayRevision:2000+ratio*100});
    await board.overlay.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const geometry=await board.overlay.webContents.executeJavaScript(`({ratio:devicePixelRatio,width:document.querySelector('canvas').width,height:document.querySelector('canvas').height})`);
    assert.deepEqual(geometry,{ratio,width:1280*ratio,height:720*ratio});
    await board.overlay.webContents.executeJavaScript(`{const c=document.querySelector('canvas');for(const [type,x] of [['pointerdown',100],['pointermove',200],['pointerup',250]])c.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:x,clientY:120}));}`);
    assert((await board.overlay.webContents.executeJavaScript(`document.querySelector('canvas').getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]`))>0);
    await board.control.webContents.executeJavaScript(`window.whiteboard.command('clear')`);
    console.log('PASS emulated renderer DPI',ratio,'canvas size / pen coordinates');
  }
  await board.overlay.webContents.debugger.sendCommand('Emulation.clearDeviceMetricsOverride');
  board.overlay.webContents.debugger.detach();
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('mode','interact')`);assert.equal(board.getState().mode,'interact');
  for (const color of ['#111111','#d52b38','#2164df']) {
    await board.control.webContents.executeJavaScript(`window.whiteboard.command('color', '${color}')`);
    assert.equal(board.getState().color,color);
  }
  for (const width of [3,6,10]) {
    await board.control.webContents.executeJavaScript(`window.whiteboard.command('width', ${width})`);
    assert.equal(board.getState().width,width);
  }
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('tool','eraser')`);
  assert.equal(board.getState().tool,'eraser');
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('undo')`);
  board.control.setBounds({x:work.x+20,y:work.y+8,width:500,height:Math.min(800,work.height-16)});
  const expanded=board.control.getBounds();
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('collapse')`);
  assert.equal(board.getState().collapsed,true);
  const oneLine = `(() => {const b=document.querySelector('[data-command="mode"][data-value="interact"]'); const r=document.createRange(); r.selectNodeContents(b); return getComputedStyle(b).whiteSpace==='nowrap' && r.getBoundingClientRect().width<=b.clientWidth && b.scrollWidth<=b.clientWidth;})()`;
  assert.equal(await board.control.webContents.executeJavaScript(oneLine),true,'compact label stays on one line');
  await board.control.webContents.executeJavaScript(`window.whiteboard.command('collapse')`);
  assert.equal(board.getState().collapsed,false);
  assert.deepEqual(board.control.getBounds(),expanded,'restore expanded size and position');
  board.control.setSize(380,480);
  await board.control.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  assert.equal(await board.control.webContents.executeJavaScript(oneLine),true,'minimum width label fits');
  assert.equal(await board.control.webContents.executeJavaScript('document.querySelector("main").scrollWidth <= document.querySelector("main").clientWidth'),true);
  // Layout-only fixture: no Firebase account and no operational data writes.
  board.control.setMaximumSize(1920,1080); board.control.setSize(420,920);
  await board.control.webContents.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await board.control.webContents.executeJavaScript(`{
    document.querySelector('#login').hidden=true;document.querySelector('#logout').hidden=false;
    document.querySelector('#teacher').textContent='선생님 로그인됨';document.querySelector('#class-label').hidden=false;
    document.querySelector('#connection').textContent='2026-09-10 · 학급 현황 연결됨';
    document.querySelector('#class-content').innerHTML='<article class="card"><strong>테스트 모둠</strong><div class="score">10점</div><div class="actions"><button>-1</button><button>+1</button></div></article>';
  }`);
  const layout = await board.control.webContents.executeJavaScript(`({bottom:document.querySelector('.actions').getBoundingClientRect().bottom,viewport:innerHeight})`);
  console.log('Group layout:',JSON.stringify(layout));
  require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/control-size-smoke.png'),(await board.control.webContents.capturePage()).toPNG());
  assert(layout.bottom<=layout.viewport,'first group score buttons visible without scrolling at default height');
  // Reuse the real renderer template; fixture data never reaches Firebase.
  const toolbarSource=require('node:fs').readFileSync(require('node:path').join(__dirname,'../toolbar/toolbar.js'),'utf8');
  const template=toolbarSource.match(/return `(<article class="card group-card">.*?)`;/)[1];
  const makeCard=new Function('group','score','disabled','escape','return `'+template+'`;');
  const groupNames=['수학','콜라','LUCKY','민트초코','브로콜리','폴라레티'];
  const cards=groupNames.map((name,index)=>makeCard({id:'fixture-'+index,name},index===1?0:38,false,String)).join('');
  const measure=()=>board.control.webContents.executeJavaScript(`(()=>{const cards=[...document.querySelectorAll('.group-card')],main=document.querySelector('main');return {heights:cards.map(c=>c.getBoundingClientRect().height),buttonHeights:[...document.querySelectorAll('.group-card button')].map(b=>b.getBoundingClientRect().height),bottom:cards.at(-1).getBoundingClientRect().bottom,scroll:main.scrollHeight-main.clientHeight,overflow:main.scrollWidth>main.clientWidth,zeroDisabled:cards[1].querySelector('[data-delta="-1"]').disabled,plusEnabled:!cards[1].querySelector('[data-delta="1"]').disabled};})()`);
  await board.control.webContents.executeJavaScript(`document.querySelector('#class-content').innerHTML=${JSON.stringify(cards)}`);
  const compactLayout=await measure();
  assert(compactLayout.heights.every(h=>h>=60&&h<=75));
  assert(compactLayout.buttonHeights.every(h=>h>=48));assert(!compactLayout.overflow);
  assert(compactLayout.zeroDisabled&&compactLayout.plusEnabled);
  console.log('Six groups 420x920:',JSON.stringify(compactLayout));
  require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/groups-420.png'),(await board.control.webContents.capturePage()).toPNG());
  await board.control.webContents.executeJavaScript(`document.querySelectorAll('.group-card').forEach(c=>c.classList.remove('group-card'))`);
  const oldLayout=await board.control.webContents.executeJavaScript(`({height:document.querySelector('.card').getBoundingClientRect().height,scroll:document.querySelector('main').scrollHeight-document.querySelector('main').clientHeight})`);
  console.log('Previous six-card layout:',JSON.stringify(oldLayout));assert(compactLayout.scroll<oldLayout.scroll/2);
  await board.control.webContents.executeJavaScript(`document.querySelector('#class-content').innerHTML=${JSON.stringify(cards)}`);
  for(const width of [380,320]) {
    board.control.setMinimumSize(320,480);board.control.setSize(width,920);
    await board.control.webContents.executeJavaScript('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const narrow=await measure();assert(!narrow.overflow);assert(narrow.buttonHeights.every(h=>h>=48));
    assert(narrow.heights.every(h=>h<115));
    console.log('Six groups width '+width+':',JSON.stringify(narrow));
    require('node:fs').writeFileSync(require('node:path').join(__dirname,'../dist/groups-'+width+'.png'),(await board.control.webContents.capturePage()).toPNG());
  }
  await new Promise(resolve => { board.control.webContents.once('did-finish-load',resolve); board.control.webContents.reload(); });
  for(const height of [768,1080]) {
    board.control.setSize(420,height-24);
    assert.equal(await board.control.webContents.executeJavaScript('document.documentElement.scrollWidth <= innerWidth'),true);
  }
  assert.equal(await board.control.webContents.executeJavaScript(`document.querySelector('#login').textContent`),'교사 로그인');
  assert.deepEqual(errors,[]);
  console.log('PASS Electron startup / isolated preload / primary display / pen pixels / clear / modes / 768-1080 layout / no renderer errors');
  clearTimeout(timeout); await board.control.webContents.executeJavaScript(`window.whiteboard.command('quit')`);
}).catch(error=>{console.error(error);clearTimeout(timeout);app.exit(1);});
