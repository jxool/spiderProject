import axios from 'axios'
import crypto from 'crypto'
import settings from 'electron-settings'
import { listeExample, sendWindow } from './login-window/ipcRendererLogin'
import opn from 'opn'

window.addEventListener('load', function() {
    listeExample()
    linkGS()
    linkYoutube()
    linkLinkedin()
    linkFB()
    Auth()
    if (settings.has('data')) {
        document.getElementById('email').value = settings.get('data.username')
        deleteRecord()
    }
})

function Auth() {
    const btnAuth = document.getElementById('btnAuth')
    btnAuth.addEventListener('click', function() {
        const email = document.getElementById('email').value
        const password = document.getElementById('pwd').value;

        if (email != "") {
            if (password != "") {
                axios.post('http://gstrackme.net:3601/api/v1/users/login', {
                        username: email,
                        password: password
                    })
                    .then(function(response) {
                        preferences(response, password);
                    })
                    .catch(function(error) {
                        $('#user').popover('hide')
                        $('#pass').popover('hide')
                        $('#ax').popover('show')
                        setTimeout(function() {
                                $('#ax').popover('hide')
                            }, 3000)
                            //console.log(error);
                    });
            } else {
                $('#user').popover('hide')
                $('#pass').popover('show')
                $('#ax').popover('hide')
                setTimeout(function() {
                    $('#pass').popover('hide')
                }, 3000)
            }
        } else {
            $('#user').popover('show')
            $('#pass').popover('hide')
            $('#ax').popover('hide')
            setTimeout(function() {
                $('#user').popover('hide')
            }, 3000)
        }
    })
}

function deleteRecord() {
    if (settings.has('data.date')) {
        settings.get('data.date') != new Date().getDate() ? settings.delete('record') : ''
    }
}

function preferences(resp, pass) {
    const info = resp.data.data

    const cipher = crypto.createCipher('aes192', 'spiderProject2018')
    let encrypted = cipher.update(pass, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    settings.set('data', {
        email: info.email,
        id_user: info.id_user,
        language: info.language,
        name: info.name,
        username: info.username,
        devices: info.devices,
        id_client: info.id_client,
        date: new Date().getDate(),
        password: encrypted
    })

    sendWindow(1)
}

function linkGS() {
    var gs = document.getElementById('gs')

    gs.addEventListener('click', function() {
        var link = gs.dataset.link

        opn(link)
    })
}

function linkYoutube() {
    var tube = document.getElementById('tube')

    tube.addEventListener('click', function() {
        var link = tube.dataset.link

        opn(link)
    })
}

function linkLinkedin() {
    var lkin = document.getElementById('lkin')

    lkin.addEventListener('click', function() {
        var link = lkin.dataset.link

        opn(link)
    })
}

function linkFB() {
    var fb = document.getElementById('fb')

    fb.addEventListener('click', function() {
        var link = fb.dataset.link

        opn(link)
    })
}