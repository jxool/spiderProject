import { ipcRenderer } from 'electron'

ipcRenderer.on('progressDow', (event, arg) => {

    let complete = Math.round(arg);
    let progress = document.getElementById('progress');

    progress.setAttribute('style', 'width:' + complete + '%')
    progress.innerHTML = complete + '%'
    progress.dataset.ariaValuenow = complete;
})