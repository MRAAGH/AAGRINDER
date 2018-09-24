const SERVER_VERSION = '0.0.1';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const md5 = require('md5');
const cron = require('node-cron');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// const mongoose = require('bluebird').promisifyAll(require('mongoose'));
// const mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

// mongoose.connect('mongodb://localhost:27017/aagrinder', {useMongoClient: true});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));

app.use('/api/users', require('./routes/User'));



const Player = require('./Player').Player;
// const Chunk = require("./Chunk").Chunk;
const Map = require('./Map').Map;
const PlayerData = require('./PlayerData').PlayerData;
const Spawn = require('./Spawn').Spawn;
const Syncher = require('./Syncher').Syncher;
const Subscribe = require('./Subscribe').Subscribe;
const PlayerActions = require('./PlayerActions').PlayerActions;
const ServerActions = require('./ServerActions').ServerActions;

process.stdin.resume();
process.stdin.setEncoding('utf8');

const port = process.env.PORT || 8080;

//app.get('/', function (req, res) { res.sendFile(__dirname + '/public/client.html'); });
app.use(express.static(__dirname + '/public'));
// app.get('/public/js/PlayerClient', function (req, res) { res.sendFile(__dirname + '/public/js/PlayerClient.js'); });
// app.get('/public/js/client', function (req, res) { res.sendFile(__dirname + '/public/js/client.js'); });
// app.get('/public/js/jquery', function (req, res) { res.sendFile(__dirname + '/public/js/jquery3.2.1.js'); });

app.get('/aa', function (req, res) {
  let u = '/aa has been accessed.';
  console.log(JSON.stringify(u));
  res.json(u);
});

let LEVEL_NAME;
let WORLD_SEED;
let map;
let playerData;
let spawn;
let syncher;
let playerActions;
let serverActions;

process.stdin.on('data', function (text) {
  if (text.trim() === 'save') {
    saveToFile();
  }
  if (text.trim() === 'stop') {
    saveToFile(() => {
      console.log('STOPPING SERVER');
      process.exit();
    });
  }

});

//add autosave option to server.properties
/*
cron.schedule('0 * * * *', function () {
saveToFile();
});
cron.schedule('10 * * * *', function () {
saveToFile();
});
cron.schedule('20 * * * *', function () {
saveToFile();
});
cron.schedule('30 * * * *', function () {
saveToFile();
});
cron.schedule('40 * * * *', function () {
saveToFile();
});
cron.schedule('50 * * * *', function () {
saveToFile();
});*/

function saveToFile(callback) {
  let savingString = map.saveToJSON();
  fs.writeFile('saves/' + LEVEL_NAME + '.txt', savingString, function (err) {
    if (err) console.log(err);
    else {
      console.log('saved map to file: saves/' + LEVEL_NAME + '.txt');
      if (callback) {
        callback();
      }
    }
  });
}

function loadfromFile(callback) {
  // DEBUG I skipped everything with the loading
  callback();
  return;

  //Check if file exists
  if (fs.existsSync('saves/' + LEVEL_NAME + '.txt')) {
    fs.readFile('saves/' + LEVEL_NAME + '.txt', function (err, loadedString) {
      if (err) console.log(err);
      else {
        map.loadFromJSON(loadedString);
        if (callback) {
          callback();
        }
      }
    });
  }
  else {
    if (callback) {
      callback();
    }
  }
}

function loadServerProperties(callback) {
  console.log('Loading properties');
  //Check if file exists
  if (fs.existsSync('server.properties')) {
    fs.readFile('server.properties', function (err, loadedString) {
      if (err) console.log(err);
      else {
        let loaded_properties = JSON.parse(loadedString);
        let bad_file_format = false;
        if (loaded_properties.level_name == undefined) {
          loaded_properties.level_name = 'world';
          bad_file_format = true;
        }
        if (loaded_properties.seed == undefined) {
          loaded_properties.seed = Math.floor(Math.random() * 65536);
          bad_file_format = true;
        }
        if (loaded_properties.database_username == undefined) {
          loaded_properties.database_host = 'localhost';
          bad_file_format = true;
        }
        if (loaded_properties.database_username == undefined) {
          loaded_properties.database_username = 'root';
          bad_file_format = true;
        }
        if (loaded_properties.database_password == undefined) {
          loaded_properties.database_password = '';
          bad_file_format = true;
        }
        if (loaded_properties.database_name == undefined) {
          loaded_properties.database_name = 'aagrinder';
          bad_file_format = true;
        }
        if (bad_file_format) {
          let corrected_properties_string = JSON.stringify(loaded_properties);
          fs.writeFile('server.properties', corrected_properties_string, function (err) {
            if (err) console.log(err);
            else {
              callback(loaded_properties);
            }
          });
        }
        else {
          callback(loaded_properties);
        }
      }
    });
  }
  else {
    loaded_properties = {
      level_name: 'world',
      seed: Math.floor(Math.random() * 65536),
      database_host: 'localhost',
      database_username: 'root',
      database_password: '',
      database_name: 'aagrinder'
    };
    let corrected_properties_string = JSON.stringify(loaded_properties);
    fs.writeFile('server.properties', corrected_properties_string, function (err) {
      if (err) console.log(err);
      else {
        callback(loaded_properties);
      }
    });
  }
}

io.on('connection', function (socket) {
  onClientConnect(socket);
  socket.on('login', onLogin);
  socket.on('disconnect', onClientDisconnect);
  socket.on('chat', onChat);
  socket.on('a', onAction);
});

function onClientConnect(socket) {
  console.log('Client connected: ' + socket.id);
}

function onLogin(data) {
  //Username sent?
  if (
    typeof(data.username) !== 'string'
    || typeof(data.password) !== 'string'
  ){
    this.emit('loginerror', {message: 'incomplete data'});
  }
  else {
    playerData.login(data.username, data.password, this).then(
      result => {
        const message = {color: result.color};
        console.log(result.color);
        this.emit('loginsuccess', message);

        playerActions.login(result);

        syncher.sendUpdatesToClients();
      },
      err => {
        this.emit('loginerror', {message: err});
      }
    );
  }
}

function onClientDisconnect() {
  console.log('Client disconnected: ' + this.id);
  let player = playerData.logout(this);
  if(player !== null){
    playerActions.logout(player);
  }
}

function onChat(data) {
  // who speaks?
  let player = playerData.onlinePlayerBySocket(this);
  if(player){
    // prepend player name
    let message = player.name + ': ' + data.message;

    console.log(message);

    for(let i = 0; i < playerData.onlinePlayers.length; i++){
      playerData.onlinePlayers[i].socket.emit('chat', {message: message});
    }
  }
}

function onAction(data) {
  console.log(data.a);
  let player = playerData.onlinePlayerBySocket(this);
  if (!playerActions.action(player, data.a, data.d)){
    console.log("HACKS! ("+player.name+") at "+data.i)
    player.socket.emit('h', {'i': data.i});
  }
}

console.log('Starting aagrinder server version ' + SERVER_VERSION);
let hrstart_server_load = process.hrtime();
loadServerProperties((props) => {
  // now we have database authentication things
  // the connection is a global variable atm
  connection = mysql.createConnection({
    host     : props.database_host,
    user     : props.database_username,
    password : props.database_password,
    database : props.database_name
  });
  connection.query(`
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(20) NOT NULL,
  password varchar(70) NOT NULL,
  color char(6) NOT NULL DEFAULT 'ffffff',
  PRIMARY KEY (id),
  UNIQUE KEY (name)
)
    `,()=>{
      LEVEL_NAME = props.level_name;
      WORLD_SEED = props.seed;
      map = new Map(WORLD_SEED);
      playerData = playerData = new PlayerData();
      spawn = new Spawn(map);
      syncher = new Syncher(map, playerData);
      let subscribe = new Subscribe(map);
      playerActions = new PlayerActions(
        map,
        syncher,
        subscribe,
        spawn
      );

      console.log('Preparing level "' + LEVEL_NAME + '"');
      loadfromFile(() => {
        // map.prepareSpawnArea(() => {
        http.listen(port, function () {
          let hrend_server_load = process.hrtime(hrstart_server_load);
          console.log('Done (' + hrend_server_load[0] + '.' + Math.floor(hrend_server_load[1] / 1000000) + 's)!');
          console.log('AAGRINDER server listening on *:' + port);
        });
        // });
      })
  });
});
