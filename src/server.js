'use strict'

import axios from 'axios'
import { autoUpdater } from "electron-updater"
import log from "electron-log"
import crypto from 'crypto'
import { app, BrowserWindow, ipcMain, ipcRenderer, Tray, powerSaveBlocker } from 'electron';
import settings from 'electron-settings'
import express from 'express'
import devtools from './devtools'
import http from 'http'
import os from 'os'
import path from 'path'
import socketIO from 'socket.io'

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
// /**
//  * Función para actualizar la app
//  */
// require('update-electron-app')({
//     repo: 'jxool/spiderProject',
//     updateInterval: '1 hour'
// })

/**
 * Función para configurar para el web server
 */
const apps = express()
let server = http.createServer(apps);

const publicPath = path.resolve(__dirname, './renderer');
const port = process.env.PORT || 3000;

apps.use(express.static(publicPath));

module.exports.io = socketIO(server);

require('./sockets/socket');


server.listen(port, (err) => {

    if (err) throw new Error(err);

});


/**
 * Configuración que abre la app al iniciar el O.S
 */
const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'gstrackme.exe')
app.setLoginItemSettings({
    openAtLogin: true,
    path: updateExe
})

global.win
global.child
global.tray
global.visible = false
    /**
     * Configuracion del entorno de desarrollo
     */


if (process.env.NODE_ENV === 'development') {
    devtools()
    console.log('development')
}

/**
 * Configuración para que la app siga en proceso
 */
const id = powerSaveBlocker.start('prevent-display-sleep')

powerSaveBlocker.stop(id)

let conf = dataUser()



/**
 * Configuramos autopudate
 */

// autoUpdater.on('checking-for-update', () => {
//     log.info(text);
// })

// autoUpdater.on('update-available', (info) => {
//     autoDownload = true
//     log.info('Actualizacion disponible');
// })

// autoUpdater.on('update-not-available', (info) => {
//     log.info('Actualizacion no disponible');
// })

// autoUpdater.on('error', (err) => {
//     log.info('Error in auto-updater. ' + err);
// })

/**
 * Configuracion de la ventana nativa del O.S
 */
app.on('ready', () => {

    autoUpdater.checkForUpdates();

    //Instancea de la ventana
    global.win = new BrowserWindow({
        width: parseInt(conf[0].minWidth),
        heigth: parseInt(conf[0].minHeight),
        backgroundColor: '#2e2c29',
        center: true,
        movable: true,
        autoHideMenuBar: true,
        maximizable: false,
        //frame: false,quita los botones de cerrar
        minWidth: parseInt(conf[0].minWidth),
        minHeight: parseInt(conf[0].minHeight),
        maxWidth: parseInt(conf[0].minWidth),
        maxHeight: parseInt(conf[0].minHeight),
        title: "GSTrackme",
        closable: false,
        show: conf[0].show,
        skipTaskbar: true,
        icon: path.join(__dirname, 'assets', 'images', 'icons', 'icon.png')
    })

    //Renderiza contenido a app
    global.win.loadURL(`file://${__dirname}/renderer/${conf[0].file}.html`)

    //Abre la vetana
    if (app.isReady()) {
        global.win.once('ready-to-show', () => {
            global.win.show();
            global.win.focus();
            app.focus()
        })
    }

    //Creamos icono
    let icon
    if (os.platform() == 'win32') {
        icon = path.join(__dirname, 'assets', 'images', 'icons', 'icon.ico')
    } else {
        icon = path.join(__dirname, 'assets', 'images', 'icons', 'icon.png')
    }
    global.tray = new Tray(icon)
    global.tray.setToolTip('GSTrackme')
    global.tray.on('click', () => {
        global.win.isVisible() ? global.win.hide() : global.win.show()
    })

    //Evento de cierre
    global.win.on('closed', () => {
        global.win = null
        app.quit()
    })
})

ipcMain.on('new_Url', (event, arg) => {
    global.win.loadURL(`file://${__dirname}/renderer/dashboard.html`)
    global.win.once('ready-to-show', () => {
        global.win.show();
        global.win.focus();
        app.focus()
    })

    event.sender.send('pong', new Date())
    global.win.setMinimumSize(520, 633)
    global.win.setMaximumSize(520, 633)
    global.win.setSize(520, 633)
})

ipcMain.on('login', (event, arg) => {
    global.child
    global.win.loadURL(`file://${__dirname}/renderer/index.html`)
    global.win.once('ready-to-show', () => {
        global.win.show();
        global.win.focus();
        app.focus()
    })

    global.win.setMinimumSize(850, 600)
    global.win.setMaximumSize(850, 600)
    global.win.setSize(850, 600)
})

ipcMain.on('childWin', (event, arg) => {
    global.child = new BrowserWindow({
        parent: global.win,
        modal: true,
        show: false,
        backgroundColor: '#2e2c29',
        center: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'assets', 'images', 'icons', 'icon.png')
    })
    global.child.loadURL(`file://${__dirname}/renderer/history.html`)
    global.child.once('ready-to-show', () => {
        global.child.show()

        global.visible = true
    })

    global.child.on('closed', () => {
        global.child = null

        global.visible = false
    })
})




/**
 * Funcion para determinar si existe datos y definir la confg. de l ventana
 */

function settingsExist() {
    let dirSettings = settings.file()
    if (dirSettings != "") {

        if (settings.has('data.username') && settings.has('data.password')) {
            return true
        } else {
            return false
        }
    }
}

function dataUser() {
    let conf = []

    let go = settingsExist()
    if (go) {
        conAxios(settings.get('data.username'), settings.get('data.password'));

        conf = [{
            "minWidth": "520",
            "minHeight": "633",
            "file": "dashboard",
            "show": false
        }]
    } else {
        conf = [{
            "minWidth": "850",
            "minHeight": "600",
            "file": "index",
            "show": true
        }]
    }

    return conf
}

/**
 * Función para conectarse a la api de inicio de sesión
 */
function conAxios(email, password) {
    const decipher = crypto.createDecipher('aes192', 'spiderProject2018')
    let decrypted = decipher.update(password, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    axios.post('http://gstrackme.net:3601/api/v1/users/login', {
            username: email,
            password: decrypted
        })
        .then(function(response) {
            if (settings.has('data.date')) {
                settings.get('data.date') != new Date().getDate() ? settings.delete('record') : ''
            }
            const info = response.data.data

            settings.set('data', {
                email: info.email,
                id_user: info.id_user,
                language: info.language,
                name: info.name,
                username: info.username,
                devices: info.devices,
                id_client: info.id_client,
                date: new Date().getDate(),
                password: password
            })
        })
        .catch(function(error) {
            console.log(error);
        });
}