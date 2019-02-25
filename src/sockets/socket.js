const { io } = require('../server');
import { BrowserWindow } from 'electron';
import notifier from 'node-notifier';
import path from 'path';
import settings from 'electron-settings';
import opn from 'opn';

io.on('connection', (client) => {
    client.on('recibiendo', (data, callback) => {
        if (!data.id_device) {
            return callback({
                msg: 'Id requerido',
            })
        }

        listenSocket(data).then((response) => {
            pushEvents(response, client);
        }).catch(err => console.log(err))
    })

    client.on('urlEvent', (dataMaps) => {
        opn(`http://gstrackme.net/gstkmdev/sys/view_events.php?lt=${dataMaps.lat}&lng=${dataMaps.long}&event=${dataMaps.icon}`)
    })
});

let deleteRecord = async() => {
    if (settings.has('data.date')) {
        settings.get('data.date') != new Date().getDate() ? settings.delete('record') : ''
    }
}

let listenSocket = async(data) => {
    let x = await deleteRecord()
    let iconMap;
    let duration;
    let dataRecord;
    let res = await result();

    let alerts = await savedAlerts()

    if (settings.has('data.devices') && settings.has('alerts.enable')) {
        let dev = res.devices;
        let enable = alerts.enable;
        let id = res.id_client;
        let verify = dev.find(dev => data.id_device == dev.id_device)
        let alertVerify = enable.find(enable => {
            return data.event == enable.event;
        });
        if (verify != undefined && alertVerify != undefined) {
            // validateEvents(data, alertVerify);
            switch (data.event) {
                case '030':
                    if (data.duration >= '00:03:00') {
                        iconMap = await validateTime(data.duration, alertVerify, id);
                        duration = data.duration
                    } else {
                        throw new Error('Duración no admitida')
                    }
                    break;
                case '025':
                    iconMap = await validateTime(data.duration, alertVerify, id);
                    duration = data.duration;
                    break;
                default:
                    iconMap = alertVerify.icon;
                    duration = "";
                    break;
            }
            /**
             * el campo id es la del cliente
             */
            return dataRecord = {
                "data": [{
                    "id": id,
                    "name_client": data.nameClient,
                    "id_device": data.id_device,
                    "name_device": data.nameDevice,
                    "event": data.event,
                    "name_event": alertVerify.name,
                    "duration": duration,
                    "date": data.date,
                    "lat": data.lat,
                    "long": data.long,
                    "icon": iconMap
                }]
            };
        } else {
            throw new Error('Evento no econtrado')
        }
    } else {
        throw new Error('Configuración no encontrado')
    }
}

let pushEvents = (response, client) => {
    let body;
    if (response.data[0].duration != "") {
        body = 'Evento: ' + response.data[0].name_event + ', Duración: ' + response.data[0].duration;
    } else {
        body = 'Evento: ' + response.data[0].name_event;
    }
    //icon: path.join(__dirname, `/alarms/${response.data[0].icon}.png`),
    notifier.notify({
        title: 'Unidad: ' + response.data[0].name_device,
        message: body,
        wait: true,
        sound: true,
        icon: path.join(__dirname, `/alarms/${response.data[0].icon}.png`)
    }, function(error, data) {
        if (data === 'activate') {
            pushSave(1, response, client)
        } else if (data === 'the user clicked on the toast.') {
            pushSave(1, response, client)
        } else {
            pushSave(0, response, client)
        }

    });
}

let pushSave = (action, response, client) => {
    if (action === 1) {
        opn(`http://gstrackme.net/gstkmdev/sys/view_events.php?lt=${response.data[0].lat}&lng=${response.data[0].long}&event=${response.data[0].icon}`)
    }
    response.data.push({ "state": action })

    if (global.visible) {
        client.broadcast.emit('enviandoH', response);
    } else {
        client.emit('enviando', response);
    }

    if (settings.has('record')) {
        pushRecord(response)
    } else {
        saveRecord(response)
    }
}

let result = async() => {

    if (settings.has('data')) {
        return settings.get('data');
    } else {
        throw new Error('No existe configuracion')
    }
}

let savedAlerts = async() => {
    if (settings.has('alerts')) {
        return settings.get('alerts')
    } else {
        throw new Error('No existe configuracion')
    }
}

let pushRecord = (response) => {
    let saved = settings.get('record.historic');
    saved.push(response.data[0])
    settings.set('record', {
        historic: saved
    })
}

let saveRecord = (response) => {
    settings.set('record', {
        historic: [response.data[0]]
    })
}

let validateTime = async(time, dataMaps, id) => {
    let conf = { 'id_c': '638', 'time_x': '00:20:00' }
    let iconMap;
    if (id != conf.id_c) {
        if (time > '00:03:00' && time < '00:15:00') {
            iconMap = dataMaps.icon + 'V';
        } else if (time > '00:15:00' && time < '00:59:00') {
            iconMap = dataMaps.icon + 'A';
        } else if (time > '00:59:00') {
            iconMap = dataMaps.icon + 'R';
        }
    } else {
        if (time > conf.time_x) {
            iconMap = dataMaps.icon + 'R';

        }
    }

    return iconMap;

}