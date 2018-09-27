/*
This used to all be merged with index.js but now it's here.
Just turned the server into a class.
*/

const SERVER_VERSION = '0.0.1';

const Player = require('./Player').Player;
const Map = require('./Map').Map;
const PlayerData = require('./PlayerData').PlayerData;
const Spawn = require('./Spawn').Spawn;
const Syncher = require('./Syncher').Syncher;
const Subscribe = require('./Subscribe').Subscribe;
const PlayerActions = require('./PlayerActions').PlayerActions;
const ServerActions = require('./ServerActions').ServerActions;

class Server{

  constructor(levelName, worldSeed, connection){
    this.levelName = levelName;
    this.worldSeed = worldSeed;
    this.map = new Map(worldSeed);
    this.playerData = new PlayerData(connection);
    this.spawn = new Spawn(this.map);
    this.syncher = new Syncher(this.map, this.playerData);
    this.subscribe = new Subscribe(this.map);
    this.playerActions = new PlayerActions(
      this.map,
      this.syncher,
      this.subscribe,
      this.spawn,
    );

  }

  command(c){
    switch(c){
      case 'save':
        this.saveToFile();
        break;
      case 'stop':
        this.saveToFile(()=>{
          console.log('STOPPING SERVER');
          process.exit();
        })
    }
  }

  saveToFile(callback) {
    let savingString = this.map.saveToJSON();
    fs.writeFile('saves/' + this.levelName + '.txt', savingString, function (err) {
      if (err) console.log(err);
      else {
        console.log('saved map to file: saves/' + this.levelName + '.txt');
        if (callback) {
          callback();
        }
      }
    });
  }

  loadfromFile(callback) {
    // DEBUG I skipped everything with the loading
    callback();
    return;

    //Check if file exists
    if (fs.existsSync('saves/' + this.levelName + '.txt')) {
      fs.readFile('saves/' + this.levelName + '.txt', function (err, loadedString) {
        if (err) console.log(err);
        else {
          this.map.loadFromJSON(loadedString);
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

  onClientConnect(socket) {
    console.log('Client connected: ' + socket.id);
  }

  onLogin(data, socket) {
    //Username sent?
    console.log('data', data)
    if (
      typeof(data.username) !== 'string'
      || typeof(data.password) !== 'string'
    ){
      socket.emit('loginerror', {message: 'incomplete data'});
    }
    else {
      this.playerData.login(data.username, data.password, socket).then(
        result => {
          const message = {color: result.color};
          console.log(result.color);
          socket.emit('loginsuccess', message);

          this.playerActions.login(result);
        },
        err => {
          console.log(err)
          socket.emit('loginerror', {message: err});
        }
      );
    }
  }

  onClientDisconnect(data, socket) {
    console.log('Client disconnected: ' + socket.id);
    let player = this.playerData.logout(socket);
    if(player !== null){
      this.playerActions.logout(player);
    }
  }

  onChat(data, socket) {
    // Chat is completely independent from the rest of the game.
    // You just need to be logged in.

    // who speaks?
    let player = this.playerData.onlinePlayerBySocket(socket);
    if(player){
      // prepend player name
      let message = player.name + ': ' + data.message;

      console.log(message);

      for(let i = 0; i < this.playerData.onlinePlayers.length; i++){
        this.playerData.onlinePlayers[i].socket.emit('chat', {message: message});
      }
    }
  }

  onAction(data, socket) {
    console.log(data.a);
    let player = this.playerData.onlinePlayerBySocket(socket);
    if (!this.playerActions.action(player, data.a, data.d, data.i)){
      console.log("HACKS! ("+player.name+") at "+data.i)
    }
  }

  listen(http, io, port, callback){
    io.on('connection', socket=>{
      this.onClientConnect(socket);
      socket.on('login', data=>this.onLogin(data, socket));
      socket.on('disconnect', data=>this.onClientDisconnect(data, socket));
      socket.on('chat', data=>this.onChat(data, socket));
      socket.on('a', data=>this.onAction(data, socket));
    });
    http.listen(port, callback);
  }
}

exports.Server = Server;
