var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

var serialport = require('serialport');
var portName = '/dev/serial/by-path/pci-0000:00:14.0-usb-0:2:1.0';
var sp = new serialport(portName, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: new serialport.parsers.Readline()
});


sp.on('open', function(){
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

	    io.emit('temperature', temp);
	   	io.emit('humidity', humidity);
	    io.emit('water_temperature', water_temp);
	    io.emit('pH', pH);
	    io.emit('conductivity', conductivity);

    	string = []
  	}
  });
});
