var express = require('express');

var app = express();
var server = app.listen(4000, () => { //Start the server, listening on port 4000.
    console.log("Listening to requests on port 4000...");
})

var io = require('socket.io')(server); //Bind socket.io to our express server.

app.use(express.static('public')); //Send index.html page on GET /

const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM7'); //Connect serial port to port COM3. Because my Arduino Board is connected on port COM3. See yours on Arduino IDE -> Tools -> Port
const parser = port.pipe(new Readline({delimiter: '\r\n'})); //Read the line only when new line comes.
// parser.on('data', (temp) => { //Read data
//     console.log(temp);
     var today = new Date();
//     io.sockets.emit('temp', {date: today.getDate()+"-"+today.getMonth()+1+"-"+today.getFullYear(), time: (today.getHours())+":"+(today.getMinutes()), temp:temp}); //emit the datd i.e. {date, time, temp} to all the connected clients.
// });

var readData = '';  // this stores the buffer
var temp ='';
var humi ='';
var volt ='';
var power ='';

var dht11data =[]; // this array stores date and data of temp, humi.

parser.on('data', function (data) { // call back when data is received
    readData += data.toString(); // append data to buffer
 
    if (readData.lastIndexOf(':') >= 20 && readData.indexOf(':') >= 0) {
        temp = readData.substring(27,32);
        humi = readData.substring(10,14);
        volt = readData.substring(41,46);
        power = readData.substring(53);
        readData = '';
        var today = new Date();

        dht11data[0]= today.getDate()+"-"+today.getMonth()+1+"-"+today.getFullYear()
        dht11data[3]=  (today.getHours())+":"+(today.getMinutes()); // Date
        dht11data[1]=temp;  // temperature data
        dht11data[2]=humi;  // humidity data
        dht11data[4]=volt;  // volt data
        dht11data[5]=power;  // power data

        console.log(dht11data);
        io.sockets.emit('message', dht11data);  // send data to all clients 

    } else {  // error 
        console.log(readData);
    }
    
});

// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Korea, GimHae)
    // for your timezone just multiply +/-GMT by 3600000
    var datestr = new Date(time +32400000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}

io.on('connection', (socket) => {
    console.log("Someone connected."); //show a log as a new client connects.


// Socket.IO message from the browser
socket.on('serialEvent', function (data) {

    // The message received as a String
    console.log(data);

    // Sending String character by character
    for(var i=0; i<data.length; i++){
        port.write(new Buffer(data[i], 'ascii'), function(err, results) {
            // console.log('Error: ' + err);
            // console.log('Results ' + results);
        });
    }

    // Sending the terminate character
    port.write(new Buffer('\n', 'ascii'), function(err, results) {
        // console.log('err ' + err);
        // console.log('results ' + results);
    });
});
  });