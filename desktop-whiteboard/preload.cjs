const {contextBridge, ipcRenderer} = require('electron');
const subscribe = (channel, callback) => {
  const listener = (_event, value) => callback(value);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
};
contextBridge.exposeInMainWorld('whiteboard', {
  state: () => ipcRenderer.invoke('board:get'),
  command: (command, value) => ipcRenderer.invoke('board:command', command, value),
  onState: callback => subscribe('board:state', callback),
  onInk: callback => subscribe('board:ink', callback),
  savedClass: () => ipcRenderer.invoke('board:class'),
  beginAuth: () => ipcRenderer.invoke('board:auth-begin'),
  endAuth: attempt => ipcRenderer.invoke('board:auth-end', attempt),
  onAuthProgress: callback => subscribe('board:auth-progress', callback),
  saveClass: classId => ipcRenderer.invoke('board:class', classId)
});
