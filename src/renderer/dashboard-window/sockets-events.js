import log from "electron-log"

var socket = io('http://localhost:3000');
var gsSocket = io('https://gstrackme.net:3603')
var geoSocket = io('http://gstrackme.net:7499')
const settings = require('electron-settings');


geoSocket.on('messages', function(response) {
    console.log(response)
})

gsSocket.on('disconnect', function() {
    console.log('desconectado')
})

/**
 * Socket de escucha desde el puerto de GSTrackme 
 */
gsSocket.on('new-event', function(response) {
    // log.info(response);
    if (response != null && response.body.event != '011') {
        // if (settings.get('data.id_client') == response.body.idClient) {
        socket.emit('recibiendo', {
                id_device: response.body.idDevice,
                nameDevice: response.body.nameDevice,
                event: response.body.event,
                duration: response.body.duration,
                date: response.body.date,
                lat: response.body.lat,
                long: response.body.long,
                nameClient: response.body.nameClient
            }, function(err) {})
            // }
    }

})

/**
 * Socket de escucha desde el servidor local para las notificaciones
 */

socket.on('connect', function() {
    settings.set('dash', {
        id: socket.id
    })
})

socket.on('enviando', function(resp) {
    var div = document.getElementById('list-notification')
    var node = document.createElement("LI")
    if (resp.data[1].state == 0) {
        node.setAttribute('style', 'background-color:#add8ff')
    }
    node.innerHTML = '<a id="aNotification" class="dropdown-item" href="#" data-lat="' + resp.data[0].lat + '" data-long="' + resp.data[0].long + '" data-icon="' + resp.data[0].icon + '">' + resp.data[0].name_device + '(' + resp.data[0].name_event + ')</a>'
    div.insertBefore(node, div.childNodes[0])
    addEvents()

})

/**
 * Función para agregar los eventos
 */
function addEvents() {
    var a = document.querySelectorAll('a.dropdown-item')[0]
    a.addEventListener('click', function() {
        let li = a.parentNode
        li.removeAttribute('style');
        let lat = a.dataset.lat
        let long = a.dataset.long
        let icon = a.dataset.icon
        openUrl(lat, long, icon)
    })
    removeLi()
}

function addCont() {
    let contNot = 0
    let div = document.getElementById('list-notification')
    if (div.children.length > 0) {
        let text = document.getElementById('more').innerHTML = 'Ver más'
        for (let index = 0; index < div.children.length; index++) {
            let li = div.childNodes[index]
            if (li.getAttribute('style')) {
                contNot++
            }

        }

        if (contNot > 0 && contNot <= 99) {
            let span = document.getElementById('cont')
            span.removeAttribute('style')
            span.innerText = contNot
        } else if (contNot > 99) {
            let span = document.getElementById('cont')
            span.removeAttribute('style')
            span.innerText = '+99'
        } else {
            let span = document.getElementById('cont')
            span.setAttribute('style', 'display:none')
            span.innerText = contNot

        }
    }

}

function openUrl(lat, long, icon) {
    addCont()
    socket.emit('urlEvent', {
        lat: lat,
        long: long,
        icon: icon
    })
}

function removeLi() {
    let ul = document.getElementById('list-notification')
    if (ul.children.length) {
        for (let index = 0; index < ul.children.length; index++) {
            let li = ul.childNodes[index]

            // index > 10 ? ul.removeChild(li) : '';
            addCont();
        }
    }
}