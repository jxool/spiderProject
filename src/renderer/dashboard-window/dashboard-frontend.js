import settings from 'electron-settings'
import { opnChild, sendLogin } from './login-window/ipcRendererLogin'
import sweetalert from 'sweetalert'
const opn = require('opn');

window.addEventListener('load', () => {
    alerts()
    rendererLogin()
    textDropdown()
    openChild()
    if (settings.has('alerts')) {
        if (settings.get('alerts.id_client') == settings.get('data.id_client')) {
            prefAlerts()
        } else {
            pushAlerts(0)
        }
    } else {
        pushAlerts(0)
    }

})


function alerts() {
    const btnAlert = document.getElementById('saveAlerts')
    btnAlert.addEventListener('click', () => {
        pushAlerts(1);
    })
}


function currentAlerts() {
    const conAlerts = [{ "event": "032", "name": "Exceso de velocidad", "icon": "032" },
        { "event": "030", "name": "Parada en exceso", "icon": "030", "level": "V-A-R", "ext": "png" },
        { "event": "006", "name": "Desconexión de GPS", "icon": "006" },
        { "event": "005", "name": "Puerta cerrada", "icon": "004" },
        { "event": "004", "name": "Puerta abierta", "icon": "004" },
        { "event": "003", "name": "Apagado de motor", "icon": "002" },
        { "event": "002", "name": "Encendido de motor", "icon": "002" },
        { "event": "001", "name": "Ayuda", "icon": "001" },
        { "event": "021", "name": "Grua normal", "icon": "021" },
        { "event": "022", "name": "Grua invertida", "icon": "021" }
    ];

    return conAlerts;
}

function openChild() {
    let more = document.getElementById('more')

    more.addEventListener('click', function() {

        let div = document.getElementById('list-notification')

        if (div.children.length > 1) {
            for (let index = 0; index < div.children.length; index++) {
                let li = div.childNodes[index]

                if (li.getAttribute('style')) {
                    li.removeAttribute('style')

                    let span = document.getElementById('cont')
                    span.setAttribute('style', 'display:none')
                    span.innerText = 0
                }

            }
        }
        opnChild(1)
    })
}

function textDropdown() {
    let div = document.getElementById('list-notification')

    if (div.children.length <= 0) {
        var node = document.createElement("LI")
        node.innerHTML = '<a id="more" class="dropdown-item" href="#"  >Ningun evento</a>'
        div.insertBefore(node, div.childNodes[0])
    }
}

function prefAlerts() {

    let preferences = settings.get('alerts');
    let enable = preferences.enable;
    let disable = preferences.disable;

    for (let index = 0; index < enable.length; index++) {
        if (enable[index].event != "003" && enable[index].event != "005" && enable[index].event != "022") {
            document.getElementById(enable[index].event).checked = true;
        }
    }

    for (let index = 0; index < disable.length; index++) {
        if (disable[index].event != "003" && disable[index].event != "005" && disable[index].event != "022") {
            document.getElementById(disable[index].event).checked = false;
        }
    }
}

function pushAlerts(flag) {
    let enable = [];
    let disable = [];
    let events = currentAlerts();
    // saveAlerts()

    for (let index = 0; index < events.length; index++) {
        if (events[index].event != "003" && events[index].event != "005" && events[index].event != "022") {

            if (document.getElementById(events[index].event).checked) {
                enable.push(events[index])

                events[index].event === "002" ? enable.push(events[5]) : '';
                events[index].event === "004" ? enable.push(events[3]) : '';
                events[index].event === "021" ? enable.push(events[9]) : '';
            } else {
                disable.push(events[index])
                events[index].event === "002" ? disable.push(events[5]) : '';
                events[index].event === "004" ? disable.push(events[3]) : '';
                events[index].event === "021" ? disable.push(events[9]) : '';
            }
        }
    }

    saveAlerts(enable, disable, flag);
}

function saveAlerts(x, y, z) {
    settings.delete('alerts')
    settings.set('alerts', {
        enable: x,
        disable: y,
        id_client: settings.get('data.id_client')
    })

    if (z != 0) {
        swal("Cambios guardados!", {
            buttons: false,
            className: "sweetSave",
            timer: 3000
        });
    }

}

function rendererLogin() {
    let login = document.getElementById('login');

    login.addEventListener('click', function() {

        swal({
                title: "¿Iniciar sesión con otra cuenta?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    // swal("Poof! Your imaginary file has been deleted!", {
                    //     icon: "success",
                    // });
                    settings.delete('alerts')
                    sendLogin(1)
                } else {
                    // swal("Your imaginary file is safe!");
                }
            });
    })
}