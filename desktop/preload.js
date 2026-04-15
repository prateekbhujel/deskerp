const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('deskerpDesktop', {
    environment: 'electron',
});
