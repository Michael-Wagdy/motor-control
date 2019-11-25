var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());


var server = app.listen(4000, () => { //Start the server, listening on port 4000.
    console.log("Listening to requests on port 4000...");
})

var io = require('socket.io')(server); //Bind socket.io to our express server.

app.use(express.static('public')); //Send index.html page on GET /

const SerialPort = require('serialport'); 
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort('COM6'); //Connect serial port to port COM3. Because my Arduino Board is connected on port COM3. See yours on Arduino IDE -> Tools -> Port
const parser = port.pipe(new Readline({delimiter: '\r\n'})); //Read the line only when new line comes.
     var today = new Date();


var readData = '';  // this stores the buffer
var temp ='';
var ampere ='';
var volt ='';
var power ='';

var arrayOfData =[]; // this array stores date and data of temp, ampere.

parser.on('data', function (data) { // call back when data is received
    readData += data.toString(); // append data to buffer
 
    if (readData.lastIndexOf(':') >= 20 && readData.indexOf(':') >= 0) {
        temp = readData.substring(27,32);
        ampere = readData.substring(10,14);
        volt = readData.substring(41,46);
        power = readData.substring(54);
        readData = '';
        var today = new Date();

        arrayOfData[0]= today.getDate()+"-"+today.getMonth()+"-"+today.getFullYear()
        arrayOfData[3]=  (today.getHours())+":"+(today.getMinutes()); // Date
        arrayOfData[1]=temp;  // temperature data
        arrayOfData[2]=ampere;  // ampere data
        arrayOfData[4]=volt;  // volt data
        arrayOfData[5]=power;  // power data

        console.log(arrayOfData);
      
        io.sockets.emit('message', arrayOfData);  // send data to all clients 

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

 });
 app.post('/h', function (req, res) {
    port.write("h");
})

app.post("/l", function(req,res){

    port.write("l");
});
