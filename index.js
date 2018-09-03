const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
var fs = require('fs');
const makeDir = require('make-dir');
var prompt = require('prompt');
var colors = require('colors/safe');

//Datum funktion.
function addzero(number){if(number <= 9){return "0" + number;}else{return number;};};
function getDate(dateannan, timeannan, milisecsave){
	if(!dateannan && !timeannan && !milisecsave){var date = new Date();}else if(!milisecsave){var annatdatum = dateannan.split('-');var annattid = timeannan.split(':');var date = new Date(annatdatum[0], annatdatum[1] - 1, annatdatum[2], annattid[0], annattid[1]);}else{var date = new Date(parseInt(milisecsave));};
	return {"datum": date.getFullYear() + '-' + addzero(date.getMonth() + 1) + '-' + addzero(date.getDate()), "tid": addzero(date.getHours()) + ':' + addzero(date.getMinutes()), "milisec": date.getTime(), "manad": date.getFullYear() + '-' + addzero(date.getMonth() + 1)};
};

var config = {
	"public": __dirname + '/public',
	"port": 9999,
	"anonym": 'Anonym ',
	"privatekey": '/notificationPrivateKey',
	"publickey": '/public/script/notificationPublicKey'
};

function rensaochsakra(vari){
	return vari.replace(/[^A-Za-z0-9\s!?\u00C5\u00C4\u00D6\u00E5\u00E4\u00F6\u002D\u0028\u0029]/g,'');
};

//Kollar IP adress för server.
function getIPAddress() {
	var interfaces = require('os').networkInterfaces();
	for (var devName in interfaces) {
		var iface = interfaces[devName];
		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i];
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
			return alias.address;
		};
	};
	return '0.0.0.0';
};
var ip = getIPAddress();
console.log('http://localhost:' + config.port);
console.log('http://' + ip + ':' + config.port);

if (fs.existsSync(__dirname + '/admin.json')) {
	var admin = JSON.parse(fs.readFileSync(__dirname + '/admin.json', 'utf8'));
}else{
	prompt.start();
	prompt.get(['adminlösenord'], function (err, result) {
		var admin = {"password": result.adminlösenord};
		fs.writeFileSync(__dirname + '/admin.json', JSON.stringify(admin, null, ' '));
		console.log(colors.green('Lösenord inställt! Kan ändras i "admin.json"'));
	});
};
if (fs.existsSync(__dirname + '/public/raids.json')) {
	var dataraids = JSON.parse(fs.readFileSync(__dirname + '/public/raids.json', 'utf8'));
}else{
	fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"date": getDate().datum, "raiddata": []}, null, ' '));
	var dataraids = {"date": getDate().datum, "raiddata": []};
};
if (fs.existsSync(__dirname + '/notificationPrivateKey.json')) {
	var privateKey = JSON.parse(fs.readFileSync(__dirname + config.privatekey + '.json', 'utf8'));
	eval(fs.readFileSync(__dirname + config.publickey + '.js')+'');
}else{
	const vapidKeys = webpush.generateVAPIDKeys();
	fs.writeFileSync(__dirname + config.privatekey + '.json', JSON.stringify(vapidKeys.privateKey, null, ' '));
	fs.writeFileSync(__dirname + config.publickey + '.js', 'var publicKey = "' + vapidKeys.publicKey + '";');
	var publicKey = vapidKeys.publicKey;
	var privateKey = vapidKeys.privateKey;
	console.log('New keys for notifications!\nPrivateKey: "' + __dirname + config.privatekey + '.json"\nPublicKey: "' + __dirname + config.publickey + '.js"');
};

function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
//https://codepen.io/jennerpalacios/full/mWWVeJ
function checkifinside(longitude, latitude){
	var geofence = {
		lund: [ [55.74521027874359,13.131354971508813],
			[55.690192632347085,13.118480368237329],
			[55.67490157435282,13.154357596020532],
			[55.67093266456603,13.18062178669436],
			[55.67335277941169,13.212722464184594],
			[55.678870081529325,13.243964834790063],
			[55.68467692734803,13.262332602124047],
			[55.69822288173381,13.275378866772485],
			[55.715728910178726,13.276408835034204],
			[55.73255051684848,13.267654104809594],
			[55.74395415003082,13.246196432690454] ],
		lth: [ [55.7155533755128, 13.201926111110879],
			[55.71303916847573, 13.203986047634316],
			[55.71079075012971, 13.204973100551797],
			[55.70827623655978, 13.206560968288613],
			[55.70663204403398, 13.208234666713906],
			[55.70527795118006, 13.20939338100834],
			[55.70522958985316, 13.211667894252969],
			[55.70602754409371, 13.215830682644082],
			[55.706849661723176, 13.22012221706791],
			[55.71485231482068, 13.222525476345254],
			[55.71545667823435, 13.229177354702188],
			[55.716181901988044, 13.232224344143106],
			[55.71920352269811, 13.230550645717813],
			[55.720122049062134, 13.2263878573267],
			[55.72019456338137, 13.21862018001957],
			[55.720146220516824, 13.211968301662637],
			[55.72002536309372, 13.207548021206094],
			[55.71722136588752, 13.203513978847695] ]
		}
		var tags = [];
		if(inside([ longitude, latitude ], geofence.lund)){
			tags.push('lund');
		};
		if(inside([ longitude, latitude ], geofence.lth)){
			tags.push('lth');
		};
		return tags;
	};

	
console.log('Malmö: ' + checkifinside(55.600374, 13.092303));
console.log('Lund inte LTH: ' + checkifinside(55.717065, 13.185326));
console.log('Sjön sjön: ' + checkifinside(55.710625, 13.209400));


const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

function maxthirty(text){
	var tosend = '';
	for (var i = 0; i < text.length; i++){
		var tosend = tosend + text[i]
		if(i == 26){
			var tosend = tosend + '...';
			var i = 99999999999999;
		};
	};
	return tosend;
};
if (fs.existsSync(__dirname + '/subscribers.json')) {
	var subscribers = JSON.parse(fs.readFileSync(__dirname + '/subscribers.json', 'utf8')).data;
}else{
	fs.writeFileSync(__dirname + '/subscribers.json', JSON.stringify({"data": []}, null, ' '));
	var subscribers = [];
};
function sendnotification(data){
	var notiText = data.raidtid + ': ' + data.raidkommentar;
	const payload = JSON.stringify({ title: maxthirty(data.gymnamn), text: maxthirty(notiText), icon: data.icon});
	for (var i = subscribers.length - 1; i >= 0; i--) {
		webpush
			.sendNotification(subscribers[i].subscription, payload)
			.catch(err => console.log(colors.red('Subscriber nr: ' + i + ' are unsuscribed.')));
	};
};
app.use(bodyParser.json());
webpush.setVapidDetails(
	"https://www.raidlund.tk/",
	publicKey,
	privateKey
);
app.post("/subscribe", (req, res) => {
	var data = req.body;
	var todo = 'true';
	for (var i = subscribers.length - 1; i >= 0; i--) {if(subscribers[i].subscription.keys.p256dh == data.subscription.keys.p256dh){var todo = 'false';};};
	if(todo == 'true'){
		subscribers.push(data);
		fs.writeFileSync(__dirname + '/subscribers.json', JSON.stringify({"data": subscribers}, null, ' '));
	};
	res.status(201).json({});
});
app.use(express.static(path.join(__dirname, "public")));

function randomString(length){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	};
	return text;
};
function loadpage(filePath, extname, response, contentType){
	fs.readFile(config.public + '/' + filePath, function(error, content) {
		if (error) {
			if(error.code == 'ENOENT'){
				fs.readFile('./404.html', function(error, content) {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				});
			}
			else {
				response.writeHead(500);
				response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
				response.end(); 
			}
		}
		else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	});
};
var allpokemon = JSON.parse(fs.readFileSync(__dirname + '/public/script/pokenames.json', 'utf8')).allpokemon;
function anonymtagger(){
	if(allpokemon.length === 0){
		allpokemon = JSON.parse(fs.readFileSync(__dirname + '/public/script/pokenames.json', 'utf8')).allpokemon;
	}
	var i = Math.floor(Math.random() * allpokemon.length);
	var name = rensaochsakra(allpokemon[i]);
	allpokemon.splice(i, 1);
	return config.anonym + ' ' + name;
};

io.sockets.on('connection', function (socket, username) {
	socket.emit('loadjson', '?');
	setInterval(function(){
		if(dataraids.date == getDate().datum){}else{
			fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"date": getDate().datum, "raiddata": []}, null, ' '));
			dataraids = {"date": getDate().datum, "raiddata": []};
			socket.emit('loadjson', '?');
		};
	}, 3600000);
	socket.on('login', function (data){
		var datajson = JSON.parse(data);
		if(datajson.username == 'anonym'){
			datajson.username = anonymtagger();
			socket.username = datajson.username;
			var anonym = 'true';
		}else{
			socket.username = rensaochsakra(datajson.username);
			var anonym = 'false';
		};
		socket.team = rensaochsakra(datajson.team);
		socket.emit('sendinfo', {"userinfo": datajson, "anonym": anonym});
	});
	socket.on('postraid', function (data){
		data.username = socket.username;
		data.team = socket.team;
		data.kommer = [{"username": socket.username, "team": socket.team, "antal": 1}];
		data.kommentar = [];
		data.id = randomString(10);
		data.raidkommentar = rensaochsakra(data.raidkommentar);
		dataraids.raiddata.push(data);
		fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
		socket.emit('nyraid', data);
		socket.broadcast.emit('nyraid', data);
		sendnotification(data);
	});
	socket.on('addkomment', function (data){
		data.kommentar = rensaochsakra(data.kommentar);
		data.time = getDate().tid;
		data.username = socket.username;
		data.team = socket.team;
		for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
			if(dataraids.raiddata[i].id == data.id){
				dataraids.raiddata[i].kommentar.push(data);
				fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
				socket.emit('nykommentar', data);
				socket.broadcast.emit('nykommentar', data);
				break;
			};
		};
	});
	socket.on('addkommer', function (data){
		for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
			if(dataraids.raiddata[i].id == data.id){

				var exist = 'false';
				//for (var a = dataraids.raiddata[i].kommer.length - 1; a >= 0; a--) {
				for (var a = 0; a < dataraids.raiddata[i].kommer.length; a++){
					if(dataraids.raiddata[i].kommer[a].username == socket.username){
						var exist = a;
					};
				};
				if(exist == 'false'){
					if(data.todo == '+'){
						dataraids.raiddata[i].kommer.push({"username": socket.username, "team": socket.team, "antal": 1});
					};
				}else{
					if(data.todo == '-'){
						if(dataraids.raiddata[i].kommer[exist].antal <= 1){
							dataraids.raiddata[i].kommer.splice(exist, 1);
						}else{
							dataraids.raiddata[i].kommer[exist].antal = dataraids.raiddata[i].kommer[exist].antal - 1;
						};
					}else{
						dataraids.raiddata[i].kommer[exist].antal = dataraids.raiddata[i].kommer[exist].antal + 1;
					};
				};
				fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
				socket.emit('nykommer', {"id": data.id, "data": dataraids.raiddata[i].kommer});
				socket.broadcast.emit('nykommer', {"id": data.id, "data": dataraids.raiddata[i].kommer});
				break;
			};
		};
	});
	socket.on('remove', function (data){
		if(data.losen == 'false'){
			for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
				if(dataraids.raiddata[i].id == data.id){
					if(dataraids.raiddata[i].username == socket.username && dataraids.raiddata[i].team == socket.team){
						dataraids.raiddata.splice(i, 1);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
						socket.emit('remove', data.id);
						socket.broadcast.emit('remove', data.id);
						break;
					};
				};
			};
		}else{
			if(admin.password == data.losen){
				for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
					if(dataraids.raiddata[i].id == data.id){
						dataraids.raiddata.splice(i, 1);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
						socket.emit('remove', data.id);
						socket.broadcast.emit('remove', data.id);
						break;
					};
				};
			};
		};
	});
	socket.on('edittext', function (data){
		if(data.admin == 'true'){
			if(socket.admin == 'true'){
				for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
					if(dataraids.raiddata[i].id == data.id){
						dataraids.raiddata[i].raidtid = data.time;
						dataraids.raiddata[i].raidkommentar = rensaochsakra(data.text);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
						var tosend = {"id": dataraids.raiddata[i].id, "username": dataraids.raiddata[i].username, "team": dataraids.raiddata[i].team, "time": dataraids.raiddata[i].raidtid, "text": rensaochsakra(dataraids.raiddata[i].raidkommentar)};
						socket.emit('edittext', tosend);
						socket.broadcast.emit('edittext', tosend);
						break;
					};
				};
			};
		}else{
			for (var i = dataraids.raiddata.length - 1; i >= 0; i--) {
				if(dataraids.raiddata[i].id == data.id){
					if(dataraids.raiddata[i].username == socket.username && dataraids.raiddata[i].team == socket.team){
						dataraids.raiddata[i].raidtid = data.time;
						dataraids.raiddata[i].raidkommentar = rensaochsakra(data.text);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify(dataraids, null, ' '));
						var tosend = {"id": dataraids.raiddata[i].id, "username": dataraids.raiddata[i].username, "team": dataraids.raiddata[i].team, "time": dataraids.raiddata[i].raidtid, "text": rensaochsakra(dataraids.raiddata[i].raidkommentar)};
						socket.emit('edittext', tosend);
						socket.broadcast.emit('edittext', tosend);
						break;
					};
				};
			};
		};
	});
	socket.on('isadmin', function (data){
		if(admin.password == data.losen){
			socket.admin = 'true';
			socket.emit('isadmin', {"todo": "true", "id": data.id});
		}else{
			socket.admin = 'false';
			socket.emit('isadmin', {"todo": "false"});
		};
	});
});
server.listen(config.port);