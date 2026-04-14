const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('deskproDesktop', {
    environment: 'electron',
});
