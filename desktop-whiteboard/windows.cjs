const {app, BrowserWindow, ipcMain, screen, globalShortcut, session} = require('electron');
const {createServer} = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {defaults, minimum, compact, fitBounds} = require('./control-bounds.cjs');
const {createDisplaySelection} = require('./display-selection.cjs');

const initialState = {mode: 'interact', tool: 'pen', color: '#111111', width: 6, collapsed: false};
const colors = ['#111111', '#d52b38', '#2164df'];
const csp = "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self'; img-src 'self' data:; connect-src 'self' https://*.googleapis.com https://our-class-quest.firebaseapp.com https://asia-northeast3-our-class-quest.cloudfunctions.net; frame-src https://our-class-quest.firebaseapp.com https://apis.google.com; object-src 'none'; base-uri 'none'; form-action 'none'";

async function createWhiteboard() {
  let state = {...initialState};
  let closing = false;
  const partition = `whiteboard-${process.pid}`; // No persist: prefix: cookies/tokens stay in memory.
  const memorySession = session.fromPartition(partition);
  memorySession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  memorySession.setPermissionCheckHandler(() => false);
  // A loopback HTTP origin lets the existing Firebase popup perform its normal
  // origin checks. No origin spoofing, OAuth proxy, or authorization-domain edit.
  const assets = new Map();
  for (const folder of ['overlay', 'toolbar']) {
    for (const name of ['index.html', `${folder}.js`, `${folder}.css`]) {
      assets.set(`/${folder}/${name}`, await fs.readFile(path.join(__dirname, 'dist', folder, name)));
    }
  }
  let origin;
  const server = createServer((req, res) => {
    if (!origin || req.headers.host !== new URL(origin).host || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(403); res.end(); return;
    }
    const pathname = new URL(req.url, origin).pathname;
    const body = assets.get(pathname);
    if (!body) { res.writeHead(404); res.end(); return; }
    const type = pathname.endsWith('.html') ? 'text/html' : pathname.endsWith('.js') ? 'text/javascript' : 'text/css';
    res.writeHead(200, {'Content-Type': `${type}; charset=utf-8`, 'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store'});
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = `http://localhost:${server.address().port}`;
  const prefs = {preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true,
    nodeIntegration: false, sandbox: true, webSecurity: true, partition};
  const display = screen.getPrimaryDisplay();
  const overlay = new BrowserWindow({...display.bounds, title: '우리반 퀘스트 · 필기 화면',
    transparent: true, backgroundColor: '#00000000', frame: false, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, movable: false, hasShadow: false, show: false,
    focusable: false, fullscreen: false, thickFrame: false, webPreferences: prefs});
  const initialBounds = fitBounds({...defaults, x: display.workArea.x + display.workArea.width - defaults.width - 8, y: display.workArea.y + 8}, display.workArea);
  const control = new BrowserWindow({...initialBounds,
    minWidth: Math.min(minimum.width, initialBounds.width), minHeight: Math.min(minimum.height, initialBounds.height),
    title: '우리반 퀘스트 · 전자칠판', frame: false, thickFrame: true, alwaysOnTop: true, resizable: true,
    backgroundColor: '#f6f7fb', show: false, webPreferences: prefs});
  overlay.setAlwaysOnTop(true, 'floating');
  control.setAlwaysOnTop(true, 'screen-saver');
  overlay.setIgnoreMouseEvents(true, {forward: true});
  const windows = [overlay, control];
  const trusted = event => windows.some(w => !w.isDestroyed() && event.sender === w.webContents &&
    event.senderFrame === w.webContents.mainFrame && event.senderFrame.url.startsWith(origin + '/'));
  const fromControl = event => trusted(event) && event.sender === control.webContents;
  const broadcast = () => windows.forEach(w => !w.isDestroyed() && w.webContents.send('board:state', state));
  const displaySelection = createDisplaySelection(screen, overlay, selection => {
    Object.assign(state, selection); broadcast();
  });
  let expandedBounds = {...initialBounds}, placingControl = false;
  const placeControl = () => {
    placingControl = true;
    const area = screen.getDisplayMatching(control.getBounds()).workArea;
    const limits = state.collapsed ? compact : minimum;
    control.setResizable(!state.collapsed);
    control.setMinimumSize(Math.min(limits.width, area.width - 16), Math.min(limits.height, area.height - 16));
    control.setMaximumSize(area.width - 16, area.height - 16);
    const target = state.collapsed ? {...control.getBounds(), ...compact} : expandedBounds;
    const bounds = fitBounds(target, area);
    control.setBounds(bounds);
    if (!state.collapsed) expandedBounds = bounds;
    placingControl = false;
  };
  const rememberBounds = () => { if (!placingControl && !state.collapsed) expandedBounds = control.getBounds(); };
  control.on('resize', rememberBounds);
  control.on('move', rememberBounds);
  function setMode(mode) {
    state.mode = mode;
    overlay.setIgnoreMouseEvents(mode === 'interact', {forward: true});
    overlay.setFocusable(mode === 'draw');
    // ESC is registered only while drawing, so it does not consume other apps' ESC.
    globalShortcut.unregister('Escape');
    if (mode === 'draw') globalShortcut.register('Escape', () => setMode('interact'));
    broadcast();
  }
  ipcMain.handle('board:get', event => { if (!trusted(event)) throw Error('Untrusted window'); return state; });
  ipcMain.handle('board:command', (event, command, value) => {
    if (!trusted(event)) throw Error('Untrusted window');
    if (command === 'escape') { setMode('interact'); return; }
    if (!fromControl(event)) throw Error('Control window required');
    if (command === 'mode' && ['draw', 'interact'].includes(value)) setMode(value);
    else if (command === 'display') displaySelection.select(value);
    else if (command === 'tool' && ['pen', 'eraser'].includes(value)) { state.tool = value; broadcast(); }
    else if (command === 'color' && colors.includes(value)) { state.color = value; state.tool = 'pen'; broadcast(); }
    else if (command === 'width' && [3, 6, 10].includes(value)) { state.width = value; broadcast(); }
    else if (['undo', 'clear'].includes(command)) overlay.webContents.send('board:ink', command);
    else if (command === 'collapse') { state.collapsed = !state.collapsed; placeControl(); broadcast(); }
    else if (command === 'quit') app.quit();
    else throw Error('Invalid command');
  });
  const settingsPath = path.join(app.getPath('userData'), 'whiteboard-class.json');
  ipcMain.handle('board:class', async (event, classId) => {
    if (!fromControl(event)) throw Error('Control window required');
    if (classId === undefined) {
      try { const saved = JSON.parse(await fs.readFile(settingsPath, 'utf8')); return typeof saved.classId === 'string' ? saved.classId : ''; }
      catch { return ''; }
    }
    if (typeof classId !== 'string' || classId.length > 1500 || classId.includes('/')) throw Error('Invalid class id');
    await fs.mkdir(path.dirname(settingsPath), {recursive: true});
    await fs.writeFile(settingsPath, JSON.stringify({classId}), 'utf8');
  });
  const authURL = value => {
    try { const url = new URL(value); return url.protocol === 'https:' &&
      (url.hostname === 'accounts.google.com' || (url.hostname === 'our-class-quest.firebaseapp.com' && url.pathname.startsWith('/__/auth/'))); }
    catch { return false; }
  };
  let authAttempt = 0, authPopup = null, authActive = false;
  const authProgress = (stage, code) => {
    if (!app.isPackaged) console.info(`[AUTH] ${stage}${code ? ` ${code}` : ''}`);
    if (!control.isDestroyed()) control.webContents.send('board:auth-progress', {attempt: authAttempt, stage, code});
  };
  const closeAuth = () => {
    authActive = false;
    const popup = authPopup; authPopup = null;
    if (popup && !popup.isDestroyed()) popup.close();
  };
  ipcMain.handle('board:auth-begin', event => {
    if (!fromControl(event)) throw Error('Control window required');
    closeAuth(); authActive = true;
    return ++authAttempt;
  });
  ipcMain.handle('board:auth-end', (event, attempt) => {
    if (!fromControl(event)) throw Error('Control window required');
    if (attempt === authAttempt) closeAuth();
  });
  control.webContents.on('console-message', event => {
    // Do not forward arbitrary renderer messages: SDK errors can contain credentials.
    if (!app.isPackaged && /^\[AUTH\] [A-Z_]+(?: (?:[a-z-]+\/)?[a-z-]+)?$/.test(event.message)) console.info(event.message);
    if (!app.isPackaged && /^\[CHECK\] (?:firebaseCurrentUserExists|firebaseIdTokenAvailable|authFirestoreSameApp|authFunctionsSameApp|classDocumentReadable|classExists|classOwnerExists|classOwnerMatchesCurrentUser)=(?:true|false)$/.test(event.message)) console.info(event.message);
    if (authActive && event.level === 'error') authProgress('RENDERER_CONSOLE_ERROR');
  });
  control.webContents.on('render-process-gone', () => closeAuth());
  for (const win of windows) {
    win.webContents.on('will-navigate', (event, url) => { if (!url.startsWith(origin + '/')) event.preventDefault(); });
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    win.webContents.setWindowOpenHandler(({url}) => {
      if (win !== control || !authActive || authPopup || !authURL(url)) {
        if (win === control && authActive) authProgress('POPUP_BLOCKED', 'auth/popup-blocked');
        return {action: 'deny'};
      }
      setMode('interact');
      return {action: 'allow', overrideBrowserWindowOptions: {title: '교사 Google 로그인', autoHideMenuBar: true,
        alwaysOnTop: true, webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true,
          webSecurity: true, partition, preload: undefined}}};
    });
    win.webContents.on('did-create-window', popup => {
      authPopup = popup;
      const attempt = authAttempt;
      authProgress('POPUP_OPENED');
      popup.setAlwaysOnTop(true, 'screen-saver');
      const check = (event, url) => {
        if (!authURL(url)) {
          event.preventDefault();
          authProgress('CALLBACK_NAVIGATION_BLOCKED', 'auth/navigation-blocked');
        }
      };
      popup.webContents.on('will-navigate', check);
      popup.webContents.on('will-redirect', check);
      popup.webContents.setWindowOpenHandler(() => ({action: 'deny'}));
      popup.webContents.on('did-navigate', (_event, url) => {
        const parsed = new URL(url);
        authProgress(parsed.hostname === 'accounts.google.com' ? 'GOOGLE_AUTH_PROGRESS' : 'FIREBASE_HANDLER_LOADED');
      });
      popup.webContents.on('did-fail-load', (_event, code, _description, _url, mainFrame) => {
        if (mainFrame && code !== -3) authProgress('POPUP_LOAD_FAILED', 'auth/network-request-failed');
      });
      popup.webContents.on('render-process-gone', () => authProgress('POPUP_PROCESS_GONE', 'auth/internal-error'));
      popup.webContents.on('console-message', event => {
        if (event.level === 'error') authProgress('POPUP_CONSOLE_ERROR');
      });
      popup.on('closed', () => {
        if (attempt !== authAttempt || authPopup !== popup) return;
        authPopup = null;
        // Firebase's resolver handles close after its grace period for an in-flight result.
        authProgress('POPUP_CLOSED');
      });
    });
    win.on('closed', () => { if (!closing) app.quit(); });
  }
  const resize = () => { placeControl(); };
  screen.on('display-added', resize);
  screen.on('display-metrics-changed', resize);
  screen.on('display-removed', resize);
  const cleanup = () => {
    closing = true;
    closeAuth();
    globalShortcut.unregisterAll();
    displaySelection.dispose();
    server.close(); server.closeAllConnections();
    screen.removeListener('display-metrics-changed', resize);
    screen.removeListener('display-added', resize);
    screen.removeListener('display-removed', resize);
    for (const channel of ['board:get', 'board:command', 'board:class', 'board:auth-begin', 'board:auth-end']) ipcMain.removeHandler(channel);
  };
  app.once('before-quit', cleanup);
  await Promise.all([overlay.loadURL(origin + '/overlay/index.html'), control.loadURL(origin + '/toolbar/index.html')]);
  placeControl(); overlay.showInactive(); control.show();
  return {overlay, control, origin, getState: () => ({...state})};
}

module.exports = {createWhiteboard};
