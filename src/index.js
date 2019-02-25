'use strict'
import { app, BrowserWindow, ipcMain } from 'electron';
import devtools from './devtools'

//Variable global para la apertura de a ventana
global.win


start();
if (process.env.NODE_ENV === 'development') {
    devtools()
}

app.on('before-quit', () => {
    console.log('Saliendo....');
})

app.on('ready', () => {
    // const apps = express()
    // let server = http.createServer(apps);

    // const publicPath = path.resolve(__dirname, './renderer');
    // const port = process.env.PORT || 3000;

    // apps.use(express.static(publicPath));

    // module.exports.io = socketIO(server);

    // server.listen(port, (err) => {

    //     if (err) throw new Error(err);

    //     console.log(`Servidor corriendo en puerto ${ port }`);

    // });

    //Instancea de la ventana
    global.win = new BrowserWindow({
        width: 850,
        heigth: 600,
        backgroundColor: '#2e2c29',
        center: true,
        movable: true,
        autoHideMenuBar: true,
        //frame: false,quita los botones de cerrar
        minWidth: 850,
        minHeight: 600,
        maxWidth: 850,
        maxHeight: 600,
        title: "GS Trackme",
        show: true,
        titleBarStyle: 'hidden'
    })

    //Abre la vetana
    global.win.show();

    //Evento de cierre
    global.win.on('closed', () => {
        global.win = null
        app.quit()
    })

    //Renderiza contenido a app
    global.win.loadURL(`file://${__dirname}/renderer/index.html`)

})

ipcMain.on('new_Url', (event, arg) => {
    console.log(`se recicbio - ${arg}`)

    event.sender.send('pong', new Date())
    global.win.setMinimumSize(530, 700)
    global.win.setMaximumSize(530, 700)
    global.win.setSize(530, 700)
    global.win.loadURL(`file://${__dirname}/renderer/dashboard.html`)
})