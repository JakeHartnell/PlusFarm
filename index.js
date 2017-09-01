var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });

http.listen(port, function(){
  console.log('listening on *:' + port);
});

var serialport = require('serialport');
var portName = '/dev/cu.usbmodem1421';
var sp = new serialport(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: new serialport.parsers.Readline()

    // parser: new serialport.parsers.Delimiter({ delimiter: Buffer.from('EOL') })
});


sp.on('open', function(){
  // console.log('Serial Port Opend');
  // sp.on('data', function(data){
  //     console.log(data);
  // });
  let string = []
  sp.on('data', function(input) {
  	string.push(input.toString());
  	// Make sure we have a complete data entry before we parse it.
  	let regex = /uS\/cm\r\n/;
  	if(string.join("").match(regex)) {
  		console.log(string.join(""));
  		let data = string.join("");
  		let tempRegEx = /Air\sTemperature:\s(.+)\*/;
  		let humRegEx = /Humidity:\s(.+)%/;
  		let watertempRegEx = /Water\sTemperature:\s(.+)\*/;
  		let phRegEx = /pH\sLevel:\s(.+)\r\n/;
  		let conductivityRegEx = /Conductivity:\s(.+)uS/;

  		let temp = data.match(tempRegEx)[1];
  		let humidity = data.match(humRegEx)[1];
  		let water_temp = data.match(watertempRegEx)[1];
  		let pH = data.match(phRegEx)[1];
  		let conductivity = data.match(conductivityRegEx)[1];

  		console.log(temp)
  		console.log(humidity)
  		console.log(water_temp)
  		console.log(pH)
  		console.log(conductivity)
	    io.emit('temperature', temp);
	   	io.emit('humidity', humidity);
	    io.emit('water_temperature', water_temp);
	    io.emit('pH', pH);
	    io.emit('conductivity', conductivity);


		// Air Temperature: 33.70*C
		// Air Humidity: 32.00% RH
		// Water Temperature: 33.19*C
		// Luminosity: 0%
		// pH Level: 7.94
		// Conductivity: 15.12uS/cm

  	}
  	// console.log(string.join(""));
  });

});

// sp.on('data', function(input) {
//     console.log(input.toString());
//     io.emit('temperature', input.toString());
// });
