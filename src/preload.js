const { ipcRenderer } = require('electron');
const fs = require('fs');

document.addEventListener('DOMContentLoaded', () => {
    const selectFileButton = document.getElementById('selectFileButton');

    selectFileButton.addEventListener('click', () => {
        ipcRenderer.invoke('open-file-dialog').then((result) => {
            if (!result.canceled) {
                const filePath = result.filePaths[0];
                ipcRenderer.send('read-file', filePath);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    let myButton = document.getElementById("myButton");
    myButton.addEventListener('click', () => {
        let txtBox = document.getElementById('myText');
        let txtVal = txtBox.value;

        ipcRenderer.send('saveText', txtVal)
    })
})