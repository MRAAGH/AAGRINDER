const SERVER_VERSION = "0.0.1"

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const md5 = require("md5");
const cron = require('node-cron');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var users = require('./routes/User');
app.use('/api/users', users);



const Player = require("./Player").Player;
// const Chunk = require("./Chunk").Chunk;
const Map = require("./Map").Map;
const PlayerData = require("./PlayerData").PlayerData;
const Spawn = require("./Spawn").Spawn;
const Syncher = require("./Syncher").Syncher;
const Subscribe = require("./Subscribe").Subscribe;
const PlayerActions = require("./PlayerActions").PlayerActions;
const ServerActions = require("./ServerActions").ServerActions;

process.stdin.resume();
process.stdin.setEncoding('utf8');

const port = process.env.PORT || 80;

app.get('/', function (req, res) { res.sendFile(__dirname + '/public/client.html'); });
app.get('/public/js/PlayerClient', function (req, res) { res.sendFile(__dirname + '/public/js/PlayerClient.js'); });
app.get('/public/js/client', function (req, res) { res.sendFile(__dirname + '/public/js/client.js'); });
app.get('/public/js/jquery', function (req, res) { res.sendFile(__dirname + '/public/js/jquery3.2.1.js'); });

app.get('/aa', function (req, res) {
  let u = "/aa has been accessed."
  console.log(JSON.stringify(u))
  res.json(u);
});

let LEVEL_NAME;
let WORLD_SEED;
let map;
let syncher;
let playerActions;
let serverActions;

process.stdin.on('data', function (text) {
  if (text.trim() === 'save') {
    saveToFile();
  }
  if (text.trim() === 'stop') {
    saveToFile(() => {
      console.log("STOPPING SERVER");
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
  fs.writeFile("saves/" + LEVEL_NAME + ".txt", savingString, function (err) {
    if (err) console.log(err);
    else {
      console.log('saved map to file: saves/' + LEVEL_NAME + ".txt");
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
  if (fs.existsSync("saves/" + LEVEL_NAME + ".txt")) {
    fs.readFile("saves/" + LEVEL_NAME + ".txt", function (err, loadedString) {
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
  console.log("Loading properties");
  //Check if file exists
  if (fs.existsSync("server.properties")) {
    fs.readFile("server.properties", function (err, loadedString) {
      if (err) console.log(err);
      else {
        let loaded_properties = JSON.parse(loadedString);
        let bad_file_format = false;
        if (loaded_properties.level_name == undefined) {
          loaded_properties.level_name = "world";
          bad_file_format = true;
        }
        if (loaded_properties.seed == undefined) {
          loaded_properties.seed = Math.floor(Math.random() * 65536);
          bad_file_format = true;
        }
        if (bad_file_format) {
          let corrected_properties_string = JSON.stringify(loaded_properties);
          fs.writeFile("server.properties", corrected_properties_string, function (err) {
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
      level_name: "world",
      seed: Math.floor(Math.random() * 65536)
    };
    let corrected_properties_string = JSON.stringify(loaded_properties);
    fs.writeFile("server.properties", corrected_properties_string, function (err) {
      if (err) console.log(err);
      else {
        callback(loaded_properties);
      }
    });
  }
}

io.on('connection', function (socket) {
  onClientConnect(socket);
  socket.on("login", onLogin);
  socket.on("disconnect", onClientDisconnect);
  // socket.on("m", onMovePlayer);
  // socket.on("d", onDig);
  // socket.on("p", onPlace);
  // socket.on("i", onInteract);
  // socket.on("select", onSelect);
  // socket.on("craft", onCraft);
});

function onClientConnect(socket) {
  console.log("Client connected: " + socket.id);
};

function onLogin(data) {
  //Username sent?
  if (data.username) {
    map.login(data.username, this);
    // let the_player_who_joined = map.join(username, this);
    // if (!the_player_who_joined) {
    //   //Failed login.
    //   return false;
    // }
  }
};

function onClientDisconnect() {
  console.log("Client disconnected: " + this.id);
  map.logout(this);
};

// function onMovePlayer(data) {
//   console.log("movement sensors gone off");
//   let moving_player_index = map.onlinePlayerByClientId(this.id);
//   //console.log("Index is " + moving_player_index);
//   if (moving_player_index > -1 && data.dir > -1) {
//     let my_chunk = map.getMyChunk(map.players[moving_player_index]);
//     my_chunk.playerMove(this.id, data.dir);
//   }
// };

// function onDig(data) {
//   //console.log("dig sensors gone off");
//   let digging_player_index = map.onlinePlayerByClientId(this.id);
//   if (digging_player_index > -1 && data.x != undefined && data.y != undefined) {
//     let my_chunk = map.getMyChunk(map.players[digging_player_index]);
//     my_chunk.playerDig(this.id, data.x, data.y);
//   }
// };
//
// function onPlace(data) {
//   //console.log("place sensors gone off");
//   let digging_player_index = map.onlinePlayerByClientId(this.id);
//   if (digging_player_index > -1 && data.x != undefined && data.y != undefined) {
//     let my_chunk = map.getMyChunk(map.players[digging_player_index]);
//     my_chunk.playerPlace(this.id, data.x, data.y);
//   }
// };
//
// function onInteract(data) {
//   console.log("interact sensors gone off");
//   let interacting_player_index = map.onlinePlayerByClientId(this.id);
//   if (interacting_player_index > -1 && data.x != undefined && data.y != undefined) {
//     let my_chunk = map.getMyChunk(map.players[interacting_player_index]);
//     my_chunk.playerInteract(this.id, data.x, data.y);
//   }
// };
//
// function onSelect(data) {
//   //console.log("select sensors gone off");
//   let selecting_player_index = map.onlinePlayerByClientId(this.id);
//   if (selecting_player_index > -1 && data.what) {
//     let my_chunk = map.getMyChunk(map.players[selecting_player_index]);
//     my_chunk.playerSelect(this.id, data.what);
//   }
// };
//
// function onCraft(data) {
//   //console.log("craft sensors gone off");
//   let crafting_player_index = map.onlinePlayerByClientId(this.id);
//   if (crafting_player_index > -1 && data.what) {
//     let my_chunk = map.getMyChunk(map.players[crafting_player_index]);
//     my_chunk.playerCraft(this.id, data.what);
//   }
// };

//*
//Load map from file and then open server for players
// console.log("Starting aagrinder server version " + SERVER_VERSION);
// let hrstart_server_load = process.hrtime();
// loadServerProperties((props) => {
//   LEVEL_NAME = props.level_name;
//   WORLD_SEED = props.seed;
//   map = new Map(WORLD_SEED);
//   console.log("Preparing level \"" + LEVEL_NAME + "\"")
//   loadfromFile(() => {
//     map.prepareSpawnArea(() => {
//       http.listen(port, function () {
//         let hrend_server_load = process.hrtime(hrstart_server_load);
//         console.log("Done (" + hrend_server_load[0] + "," + Math.floor(hrend_server_load[1] / 1000000) + "s)!");
//         console.log('AAGRINDER server listening on *:' + port);
//       });
//     });
//   });
// });

console.log("Starting aagrinder server version " + SERVER_VERSION);
let hrstart_server_load = process.hrtime();
loadServerProperties((props) => {
  LEVEL_NAME = props.level_name;
  WORLD_SEED = props.seed;
  map = new Map(WORLD_SEED);
  playerData = new PlayerData();
  let syncher = new Syncher(map);
  let subscribe = new Subscribe(map);
  playerActions = new PlayerActions(map.getBlock, syncher, Subscribe.resubscribe);
  //
  playerActions.login('maze', null);
  // console.log('gonna tp')
  // playerActions.teleport('maze', 3, 128);
  // console.log('gonna tp')
  // playerActions.teleport('maze', 254, 2);
  // playerActions.players.splice(0, 1);



  console.log("Preparing level \"" + LEVEL_NAME + "\"")
  loadfromFile(() => {
    map.prepareSpawnArea(() => {
      http.listen(port, function () {
        let hrend_server_load = process.hrtime(hrstart_server_load);
        console.log("Done (" + hrend_server_load[0] + "," + Math.floor(hrend_server_load[1] / 1000000) + "s)!");
        console.log('AAGRINDER server listening on *:' + port);
      });
    });
  });
});

//*/

/*********************************************************/
/***                     TEST AREA                     ***/
/*********************************************************/

/*
//  FIXED ISLANDS
let Island = require("./Island").Island;
let i_s_s = 192;
console.log("---");
let a = new Island(57, 77, i_s_s, 5);
a.print();
console.log("---");
let b = new Island(34, 17, i_s_s, 5);
b.print();
console.log("---");
let c = new Island(92, 44, i_s_s, 5);
c.print();
console.log("---");
let d = new Island(34, 12, i_s_s, 5);
d.print();
console.log("---");
//*/

/*
//  RANDOM ISLANDS
let Island = require("./Island").Island;
let i_s_s = 192;
console.log("---");
let a = new Island(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), i_s_s, 5);
a.print();
console.log("---");
let b = new Island(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), i_s_s, 5);
b.print();
console.log("---");
let c = new Island(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), i_s_s, 5);
c.print();
console.log("---");
let d = new Island(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), i_s_s, 5);
d.print();
console.log("---");
//*/


/*
//  FIXED TREES
let Tree = require("./Tree").Tree;
console.log("---");
let a = new Tree(0, 0, 32, 5);
a.print();
console.log("---");
let b = new Tree(0, 0, 32, 500);
b.print();
console.log("---");
let c = new Tree(0, 0, 32, 50);
c.print();
console.log("---");
let d = new Tree(0, 0, 32, 666);
d.print();
console.log("---");
let e = new Tree(0, 0, 32, 143);
e.print();
console.log("---");
//*/

/*
//  RANDOM TREES
let Tree = require("./Tree").Tree;
console.log("---");
let a = new Tree(0, 0, 32, Math.floor(Math.random() * 1000));
a.print();
console.log("---");
let b = new Tree(0, 0, 32, Math.floor(Math.random() * 1000));
b.print();
console.log("---");
let c = new Tree(0, 0, 32, Math.floor(Math.random() * 1000));
c.print();
console.log("---");
let d = new Tree(0, 0, 32, Math.floor(Math.random() * 1000));
d.print();
console.log("---");
//*/

/*
let a = [];
a[0] = "aaa";
let b = [];
b[0] = a[0];
b[0] = b[0].substr(0, 1) + "new_content" + b[0].substr(1 + "new_content".length);
console.log(a[0]);
//*/

/*
function recursio(i) {
  console.log(i);
  if (i > 3) {
    throw "bad";
  }
  recursio(i + 1);
}

try {
  recursio(0);
}
catch (err) {
  console.log(err);
}
//*/

/*
//Test undefined
let a;
console.log("a " + a);
let b = [];
//b[3] = 3;
console.log("b[3] " + b[3]);
console.log((b[3] ? "Y" : "N"));
console.log((!b[3] ? "Y" : "N"));

//*/

/*
//Test negative index
let ggg = [];
ggg[2] = 3;
ggg[0] = 3;
ggg[-1] = 3;
console.log(JSON.stringify(ggg));
//*/

/*
//Benchmark random
let MersenneTwister = require('mersenne-twister');
let hrstart = process.hrtime();
let twister = new MersenneTwister(Math.floor(Math.random() * 65536));
for (let i = 0; i < 10000000; i++) {
  let a = twister.random_int() % 256;
}
let hrend = process.hrtime(hrstart);
let hrstart2 = process.hrtime();
for (let i = 0; i < 10000000; i++) {
  let a = Math.floor(Math.random() * 256);
}
let hrend2 = process.hrtime(hrstart2);
let hrend = process.hrtime(hrstart);
let hrstart3 = process.hrtime();
let aa = Math.floor(Math.random() * 65536);
let aab = Math.floor(Math.random() * 256);
let aabb = Math.floor(Math.random() * 256);
for (let i = 0; i < 10000000; i++) {
  aa *= aab;
  aa += aabb;
  let a = aa;
}
let hrend3 = process.hrtime(hrstart2);
console.info("twister: %ds %dms\nmath.random: %ds %dms\npure math: %ds %dms",
  hrend[0], hrend[1] / 1000000, hrend2[0], hrend2[1] / 1000000, hrend3[0], hrend3[1] / 1000000
)
//*/

/*
//Mersenne Twister API testing
let MersenneTwister = require('mersenne-twister');
for (let i = 0; i < 2; i++) {
  let result = new MersenneTwister([i, 100]).random_int();
  console.log(result);
}
//*/
