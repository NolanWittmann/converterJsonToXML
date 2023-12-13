const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
var fs = require('fs');
const { log } = require('console');
const xml2js = require('xml2js');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on("saveText", (event, txtVal) => {
  fs.writeFile("./written_folder/file1.txt", txtVal.toString(), (err) => {
    if (!err) {
      console.log("File written");
    }
    else {
      console.log(err);
    }
  });
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
  });
  return result;
});

ipcMain.on('read-file', (event, filePath) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Erreur de lecture du fichier', err);
      return;
    }

    const jsonData = JSON.parse(data);
    convertJsonToXml(jsonData)
      .then(xmlString => {
        writeXmlToFile(xmlString);
        mainWindow.webContents.send('write-xml', xmlString);
      })
      .catch(error => console.error('Erreur lors de la conversion en XML', error));
  });
});

async function convertJsonToXml(jsonData) {
  return new Promise((resolve, reject) => {
    const builder = new xml2js.Builder({ renderOpts: { pretty: true } });
    try {
      const xmlString = builder.buildObject(jsonData);
      resolve(xmlString);
    } catch (error) {
      reject(error);
    }
  });
}

function writeXmlToFile(xmlString) {
  fs.writeFile('./written_folder/file1.xml', xmlString, (err) => {
    if (!err) {
      console.log('File written as XML');
    } else {
      console.log(err);
    }
  });
}
