import { ipcRenderer } from 'electron'

function listeExample() {

    ipcRenderer.on('pong', (event, arg) => {
        console.log(`pong recibido - ${arg}`)
    })
}

function sendLogin(arg) {
    ipcRenderer.send('login', arg)
}

function opnChild(arg) {
    ipcRenderer.send('childWin', arg)
}



function sendWindow(arg) {

    ipcRenderer.send('new_Url', arg)
}


module.exports = {
    listeExample: listeExample,
    opnChild: opnChild,
    sendWindow: sendWindow,
    sendLogin: sendLogin
}