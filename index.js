const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
var fs = require('fs');
const makeDir = require('make-dir');
var prompt = require('prompt');

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
		console.log('Lösenord inställt! Kan ändras i "admin.json"');
	});
};
if (fs.existsSync(__dirname + '/public/raids.json')) {
	var dataraids = JSON.parse(fs.readFileSync(__dirname + '/public/raids.json', 'utf8')).raiddata;
}else{
	fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": []}, null, ' '));
	var dataraids = [];
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
			.catch(err => console.error(err));
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
	var name = allpokemon[i];
	allpokemon.splice(i, 1);
	return config.anonym + ' ' + name;
};

io.sockets.on('connection', function (socket, username) {
	socket.emit('loadjson', '?');
	socket.on('login', function (data){
		var datajson = JSON.parse(data);
		if(datajson.username == 'anonym'){
			datajson.username = anonymtagger();
			socket.username = datajson.username;
			var anonym = 'true';
		}else{
			socket.username = datajson.username;
			var anonym = 'false';
		};
		socket.team = datajson.team;
		socket.emit('sendinfo', {"userinfo": datajson, "anonym": anonym});
	});
	socket.on('postraid', function (data){
		data.username = socket.username;
		data.team = socket.team;
		data.kommer = [{"username": socket.username, "team": socket.team}];
		data.kommentar = [];
		data.id = randomString(10);
		data.exraid = data.exraid;
		//data.location = data.location;
		dataraids.push(data);
		fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
		socket.emit('nyraid', data);
		socket.broadcast.emit('nyraid', data);
		sendnotification(data);
	});
	socket.on('addkomment', function (data){
		data.time = getDate().tid;
		data.username = socket.username;
		data.team = socket.team;
		for (var i = dataraids.length - 1; i >= 0; i--) {
			if(dataraids[i].id == data.id){
				dataraids[i].kommentar.push(data);
				fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
				socket.emit('nykommentar', data);
				socket.broadcast.emit('nykommentar', data);
				break;
			};
		};
	});
	socket.on('addkommer', function (id){
		for (var i = dataraids.length - 1; i >= 0; i--) {
			if(dataraids[i].id == id){
				dataraids[i].kommer.push({"username": socket.username, "team": socket.team});
				fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
				socket.emit('nykommer', {"id": id, "data": dataraids[i].kommer});
				socket.broadcast.emit('nykommer', {"id": id, "data": dataraids[i].kommer});
				break;
			};
		};
	});
	socket.on('remove', function (data){
		if(data.losen == 'false'){
			for (var i = dataraids.length - 1; i >= 0; i--) {
				if(dataraids[i].id == data.id){
					if(dataraids[i].username == socket.username && dataraids[i].team == socket.team){
						dataraids.splice(i, 1);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
						socket.emit('remove', data.id);
						socket.broadcast.emit('remove', data.id);
						break;
					};
				};
			};
		}else{
			if(admin.password == data.losen){
				for (var i = dataraids.length - 1; i >= 0; i--) {
					if(dataraids[i].id == data.id){
						dataraids.splice(i, 1);
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
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
				for (var i = dataraids.length - 1; i >= 0; i--) {
					if(dataraids[i].id == data.id){
						dataraids[i].raidtid = data.time;
						dataraids[i].raidkommentar = data.text;
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
						var tosend = {"id": dataraids[i].id, "username": dataraids[i].username, "team": dataraids[i].team, "time": dataraids[i].raidtid, "text": dataraids[i].raidkommentar};
						socket.emit('edittext', tosend);
						socket.broadcast.emit('edittext', tosend);
						break;
					};
				};
			};
		}else{
			for (var i = dataraids.length - 1; i >= 0; i--) {
				if(dataraids[i].id == data.id){
					if(dataraids[i].username == socket.username && dataraids[i].team == socket.team){
						dataraids[i].raidtid = data.time;
						dataraids[i].raidkommentar = data.text;
						fs.writeFileSync(__dirname + '/public/raids.json', JSON.stringify({"raiddata": dataraids}, null, ' '));
						var tosend = {"id": dataraids[i].id, "username": dataraids[i].username, "team": dataraids[i].team, "time": dataraids[i].raidtid, "text": dataraids[i].raidkommentar};
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