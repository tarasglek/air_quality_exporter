const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
var http = require('http');

console.log(process.argv)
const serialPort = process.argv[2]
const port = process.argv[3]
const path = process.argv[2]
console.log(process.argv)
const serial = new SerialPort(serialPort, { baudRate: 115200 })

const parser = new InterByteTimeout({interval:100})
serial.pipe(parser)

let packet = ""
parser.on('data', line => {packet = line})
// start the data streamaa
serial.write('{"fun":"05","flag":"1"}\n')

var server = http.createServer(function (request, response) {
    let obj = {}
    try {
        obj = JSON.parse(packet)
    } catch(e) {
        return
    }
    response.write(`#TYPE air_quality_sensor_value GAUGE\n`);
    for (let metric of Object.keys(obj)) {
        response.write(`air_quality_sensor_value{name="${metric}"} ${parseInt(obj[metric])}\n`);
    }
    // respond
    response.end();
});
server.listen(port);
console.log('Server running at http://127.0.0.1:' + port);