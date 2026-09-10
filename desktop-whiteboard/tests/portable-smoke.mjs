// Test the actual single-file EXE through a temporary loopback Node inspector.
// No inspector is enabled on normal launches; this file is excluded from the EXE.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const exe = fileURLToPath(new URL('../dist/portable/OurClassQuest-Whiteboard.exe',import.meta.url));
const reservation=createServer(); await new Promise(r=>reservation.listen(0,'127.0.0.1',r));
const port=reservation.address().port; await new Promise(r=>reservation.close(r));
const child=spawn(exe,[`--inspect=127.0.0.1:${port}`],{stdio:'ignore',windowsHide:true});
const exited=new Promise(resolve=>child.once('exit',(code)=>resolve(code)));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let ws, mainPid;
try {
  let target;
  for(let n=0;n<120;n++) {
    try { target=(await (await fetch(`http://127.0.0.1:${port}/json/list`)).json())[0]; if(target) break; } catch {}
    await pause(250);
  }
  assert(target,'portable inspector available');
  ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let id=0;const pending=new Map();
  ws.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){pending.get(data.id)?.(data);pending.delete(data.id);}};
  const evaluate=async expression=>{
    const key=++id;
    const response=new Promise(resolve=>pending.set(key,resolve));
    ws.send(JSON.stringify({id:key,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}));
    const result=await response;
    if(result.error||result.result.exceptionDetails) throw Error('Portable evaluation failed: '+JSON.stringify(result.error||result.result.exceptionDetails));
    return result.result.result.value;
  };
  for(let n=0;n<80;n++) {
    if(child.exitCode!==null) throw Error('Portable closed before startup; close the existing whiteboard first.');
    try {
      if(await evaluate(`process.mainModule.require('electron').BrowserWindow.getAllWindows().filter(w=>w.webContents.getURL().includes('/toolbar/')).length===1 && process.mainModule.require('electron').BrowserWindow.getAllWindows().every(w=>w.isVisible())`)) break;
    } catch { if(child.exitCode!==null) throw Error('Portable closed before startup; close the existing whiteboard first.'); }
    await pause(250);
  }
  const result=await evaluate(`(async()=>{
    const {app,BrowserWindow}=process.mainModule.require('electron');
    const control=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/toolbar/'));
    const overlay=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().includes('/overlay/'));
    const run=source=>control.webContents.executeJavaScript(source);
    const frame=()=>run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const prefs=control.webContents.getLastWebPreferences();
    const result={pid:process.pid,packaged:app.isPackaged,overlay:overlay.isVisible(),isolated:prefs.contextIsolation&&!prefs.nodeIntegration&&prefs.sandbox,resize:control.isResizable(),loopback:new URL(control.webContents.getURL()).hostname==='localhost'};
    const original=control.getBounds(); control.setBounds({...original,width:380,height:480});await frame();
    const fits="(()=>{const b=document.querySelector('[data-command=mode][data-value=interact]');const r=document.createRange();r.selectNodeContents(b);return getComputedStyle(b).whiteSpace==='nowrap'&&r.getBoundingClientRect().width<=b.clientWidth;})()";
    result.minimumLabel=await run(fits);
    const expanded=control.getBounds();await run("window.whiteboard.command('collapse')");await frame();result.compactLabel=await run(fits);
    await run("window.whiteboard.command('collapse')");await frame();result.restored=control.getBounds().width===expanded.width&&control.getBounds().height===expanded.height;
    await run("window.whiteboard.command('mode','draw')");
    await overlay.webContents.executeJavaScript("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
    await overlay.webContents.executeJavaScript("{const c=document.querySelector('canvas');c.setPointerCapture=()=>{};c.hasPointerCapture=()=>false;for(const [type,x] of [['pointerdown',100],['pointermove',180],['pointerup',200]])c.dispatchEvent(new PointerEvent(type,{pointerId:1,button:0,clientX:x,clientY:120}));}");
    const pixel="document.querySelector('canvas').getContext('2d').getImageData(Math.round(150*devicePixelRatio),Math.round(120*devicePixelRatio),1,1).data[3]";
    result.ink=(await overlay.webContents.executeJavaScript(pixel))>0;
    await run("window.whiteboard.command('clear')");await frame();result.clear=(await overlay.webContents.executeJavaScript(pixel))===0;
    await run("window.whiteboard.command('mode','interact')"); result.interact=(await run('window.whiteboard.state()')).mode==='interact';
    result.tabs=await run("document.querySelectorAll('[data-tab]').length===3");
    return result;
  })()`);
  mainPid=result.pid; delete result.pid;
  for(const [key,value] of Object.entries(result)) assert.equal(value,true,key);
  console.log('PASS portable EXE:',JSON.stringify(result));
  await evaluate(`setTimeout(()=>process.mainModule.require('electron').app.quit(),100);true`);
  ws.close();ws=null;
  assert.equal(await Promise.race([exited,pause(20000).then(()=> 'timeout')]),0,'portable launcher exits');
  let alive=true;try{process.kill(mainPid,0);}catch(error){if(error.code==='ESRCH')alive=false;else throw error;}
  assert.equal(alive,false,'packaged Electron main process exited');
  console.log('PASS portable exit / no main process remains');
} finally {ws?.close(); if(child.exitCode===null)child.kill();}
