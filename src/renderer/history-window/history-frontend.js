import axios from 'axios'
import settings from 'electron-settings'
import opn from 'opn';
var socket = io('http://localhost:3000');
window.addEventListener('load', function() {
    document.getElementById('loader').setAttribute('style', 'display:block')
    dataFinal()
        .then(function(res) {
            setTimeout(function() { document.getElementById('loader').removeAttribute('style'); }, 2000);

            let table = $('#table_id').DataTable({
                responsive: true,
                fixedHeader: true,
                select: true,
                language: {
                    "url": "https://cdn.datatables.net/plug-ins/1.10.15/i18n/Spanish.json"
                },
                order: [
                    [3, "desc"]
                ],
                data: res,
                columns: [
                    { data: 'name_device' },
                    { data: 'address' },
                    { data: 'name_event' },
                    { data: 'date' }
                ]
            })

            table.on('select', function(e, dt, type, indexes) {
                let rowData = table.rows(indexes).data().toArray();
                opn(`http://gstrackme.net/gstkmdev/sys/view_events.php?lt=${rowData[0].lat}&lng=${rowData[0].long}&event=${rowData[0].icon}`)
                    // console.log(rowData[0].lat + '/' + rowData[0].long + '/' + rowData[0].icon)
            })

            socket.on('enviandoH', function(resp) {
                let data = resp.data[0];
                geoLocation(resp.data[0].lat, resp.data[0].long)
                    .then(function(dir) {
                        let dataAdd = {
                            'address': dir.address,
                            'date': data.date,
                            'duration': data.duration,
                            'event': data.event,
                            'icon': data.icon,
                            'id': data.id,
                            'id_device': data.id_device,
                            'lat': data.lat,
                            'long': data.long,
                            'name_client': data.name_client,
                            'name_device': data.name_device,
                            'name_event': data.name_event
                        }

                        table.row.add(dataAdd).draw();
                    })
                    .catch(function(err) {

                    })
            })

        })
        .catch(function() {

        })
})

function dataRecord() {
    if (settings.has('record') && settings.has('data')) {
        //Obtenemos los datos JSON
        let record = settings.get('record.historic')
        let data = settings.get('data')

        //Filtramos el historico por cliente
        let result = record.filter(records => records.id == data.id_client);
        //Filtramos los dispositivos del usuario y obtener el historicos de los dispositivos
        let devices = data.devices.map(device => {
            let x = result.filter(y => y.id_device == device.id_device)
            if (x.length !== 0) {
                return x
            }
        });

        //Filtramos los arrays que no tienen contenido
        let newRecord = devices.filter(newx => newx != undefined)

        return newRecord
    }
}

async function objectData() {
    let record = dataRecord();
    let data = []
    record.forEach(index => {
        index.forEach(object => {
            data.push(object)
        })
    });

    return data
}

async function dataFinal() {
    let data = await objectData()
    let dataPush = []
    for (let index = 0; index < data.length; index++) {
        let dir = await geoLocation(data[index].lat, data[index].long)

        dataPush.push({
            'address': dir.address,
            'date': data[index].date,
            'duration': data[index].duration,
            'event': data[index].event,
            'icon': data[index].icon,
            'id': data[index].id,
            'id_device': data[index].id_device,
            'lat': data[index].lat,
            'long': data[index].long,
            'name_client': data[index].name_client,
            'name_device': data[index].name_device,
            'name_event': data[index].name_event
        })

    }

    return dataPush
}

let geoLocation = async(lat, long) => {
    let res = await axios.get('http://sisprovisa.com:3500/api/geolocalization/address', {
        params: {
            'latitude': lat,
            'longitude': long
        }
    })


    return Promise.resolve({
        "address": res.data.address
    })
}