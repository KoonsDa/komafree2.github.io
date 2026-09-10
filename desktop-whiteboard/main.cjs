const {app} = require('electron');
const {createWhiteboard} = require('./windows.cjs');
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.whenReady().then(createWhiteboard).catch(error => {
    console.error('Whiteboard startup failed:', error.message);
    app.quit();
  });
  app.on('window-all-closed', () => app.quit());
}
