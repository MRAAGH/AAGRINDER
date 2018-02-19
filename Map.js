
// let Player = require("./Player").Player;
// let Chunk = require("./Chunk").Chunk;
// let WorldGenerator = require('./WorldGenerator').WorldGenerator;
//
// let Map = function (_WORLD_SEED) {
//   let players = [];
//   let chunks = [];
//   let chunk_linear_list = [];
//   let WORLD_SEED = _WORLD_SEED;
//
//   let getMyChunk = function (player) {
//     return getChunk(player.chunkX, player.chunkY);
//   };
//
//   let getChunk = function (x, y, silent) {
//     //console.log("GC " + x + ", " + y);
//     if (chunks[y] != undefined && chunks[y][x] != undefined) {
//       return chunks[y][x];
//     }
//     //Chunk not found. Generate it.
//     let fresh_terrain = WorldGenerator(x, y, WORLD_SEED, silent);
//     let fresh_chunk = new Chunk(x, y, fresh_terrain, getChunk);
//     if (chunks[y] == undefined) {
//       chunks[y] = [];
//     }
//     chunks[y][x] = fresh_chunk;
//     chunk_linear_list.push(fresh_chunk);
//     return fresh_chunk;
//   };
//
//   let loadFromJSON = function (JSON_string) {
//
//     let loaded_object = JSON.parse(JSON_string);
//
//     let loaded_players = loaded_object.players;
//     let loaded_chunks = loaded_object.chunks;
//
//     //console.log("Loading players ...");
//     let hrstart = process.hrtime();
//
//     for (let i = 0; i < loaded_players.length; i++) {
//
//       let hrend = process.hrtime(hrstart);
//       if (hrend[0] > 0) {
//         //At least second has passed. Time to give the user an update.
//         let percent = Math.floor(100 * i / loaded_players.length);
//         console.log("Loading players: " + percent + "%");
//         hrstart = process.hrtime();
//       }
//
//       let adding_player = new Player(loaded_players[i].player_name_md5, null);
//       adding_player.chunkX = loaded_players[i].chunkX;
//       adding_player.chunkY = loaded_players[i].chunkY;
//       adding_player.subchunkX = loaded_players[i].subchunkX;
//       adding_player.subchunkY = loaded_players[i].subchunkY;
//       adding_player.inventory.state = loaded_players[i].inventory_state;
//       adding_player.inventory.selected = loaded_players[i].inventory_selected;
//       adding_player.reach = loaded_players[i].reach;
//       adding_player.online = false;
//       adding_player.fresh = false;
//
//       players.push(adding_player);
//     }
//
//     console.log(loaded_players.length + " players loaded!");
//     //console.log("Loading chunks ...");
//
//     hrstart = process.hrtime();
//
//     for (let i = 0; i < loaded_chunks.length; i++) {
//
//       let hrend = process.hrtime(hrstart);
//       if (hrend[0] > 0) {
//         //At least second has passed. Time to give the user an update.
//         let percent = Math.floor(100 * i / loaded_chunks.length);
//         console.log("Loading chunks: " + percent + "%");
//         hrstart = process.hrtime();
//       }
//
//       let uncompactified_terrain = [];
//       for (let y = 0; y < 256; y++) {
//         uncompactified_terrain[y] = [];
//         for (let x = 0; x < 256; x++) {
//           uncompactified_terrain[y][x] = loaded_chunks[i].terrain.charAt(256 * y + x);
//         }
//       }
//
//       //console.log("loaded chunk: " + loaded_chunks[i].x + ", " + loaded_chunks[i].y);
//
//       let adding_chunk = new Chunk(
//         loaded_chunks[i].x,
//         loaded_chunks[i].y,
//         uncompactified_terrain,
//         getChunk
//       );
//       adding_chunk.plant_list = loaded_chunks[i].plant_list;
//
//       if (chunks[loaded_chunks[i].y] == undefined) {
//         chunks[loaded_chunks[i].y] = [];
//       }
//       chunks[loaded_chunks[i].y][loaded_chunks[i].x] = adding_chunk;
//       chunk_linear_list.push(adding_chunk);
//     }
//
//     console.log(loaded_chunks.length + " chunks loaded!");
//   };
//
//   let saveToJSON = function () {
//
//     let saving_object = {
//       players: [],
//       chunks: []
//     };
//
//     //Save players
//     for (let i = 0; i < players.length; i++) {
//       let saving_player = {
//         chunkX: players[i].chunkX,
//         chunkY: players[i].chunkY,
//         subchunkX: players[i].subchunkX,
//         subchunkY: players[i].subchunkY,
//         player_name_md5: players[i].player_name_md5,
//         inventory_state: players[i].inventory.state,
//         inventory_selected: players[i].inventory.selected,
//         reach: players[i].reach
//       };
//       saving_object.players.push(saving_player);
//     }
//
//     //Save chunks
//     for (let i = 0; i < chunk_linear_list.length; i++) {
//       let terrain_without_players = chunk_linear_list[i].getTerrainWithoutPlayers();
//       let compactified_terrain = "";
//       for (let y = 0; y < 256; y++) {
//         for (let x = 0; x < 256; x++) {
//           compactified_terrain += terrain_without_players[y][x];
//         }
//       }
//       let saving_chunk = {
//         x: chunk_linear_list[i].x,
//         y: chunk_linear_list[i].y,
//         terrain: compactified_terrain,
//         plant_list: chunk_linear_list[i].plant_list
//       };
//       saving_object.chunks.push(saving_chunk);
//     }
//
//     //To JSON string and return:
//     let saving_JSON_string = JSON.stringify(saving_object);
//     return saving_JSON_string;
//   };
//
//   let prepareSpawnArea = function (callback) {
//     let prepare_dist = 2;
//     let chunk_count = (2 * prepare_dist + 1) * (2 * prepare_dist + 1);
//     hrstart = process.hrtime();
//     let i = 0;
//     for (let y = -prepare_dist; y <= prepare_dist; y++) {
//       for (let x = -prepare_dist; x <= prepare_dist; x++) {
//         let hrend = process.hrtime(hrstart);
//         if (hrend[0] > 0) {
//           //At least second has passed. Time to give the user an update.
//           let percent = Math.floor(100 * i / chunk_count);
//           console.log("Preparing spawn area: " + percent + "%");
//           hrstart = process.hrtime();
//         }
//         getChunk(x, y, true);
//         i++;
//       }
//     }
//     callback();
//   };
//
//   let join = function (_player_name_md5, _client_socket) {
//     let joined_player_index = playerIndexByName(_player_name_md5);
//     let joined_player
//     if (joined_player_index == -1) {
//       //New player
//       joined_player = new Player(_player_name_md5, _client_socket);
//       joined_player.fresh = true;
//       players.push(joined_player);
//     }
//     else {
//       joined_player = players[joined_player_index];
//       if (joined_player.online) {
//         //Thou shall not pass
//         console.log("Rejected double login for " + _client_socket.id);
//         return false;
//       }
//       else {
//         //Nothing special, just a regular login
//         joined_player.client_socket = _client_socket;
//         joined_player.client_id = _client_socket.id;
//       }
//     }
//
//     //Check if the player needs to be spawned:
//     if (joined_player.fresh) {
//       //Didn't spawn yet.
//       spawnPlayer(joined_player);
//       joined_player.fresh = false;
//     }
//     let my_chunk = getMyChunk(joined_player);
//     if (!my_chunk.isValidSpawnSpot(joined_player.subchunkX, joined_player.subchunkY)) {
//       //Not a fresh player but he is in a weird spot. Spawn anyway.
//       spawnPlayer(joined_player);
//       my_chunk = getMyChunk(joined_player);
//     }
//
//     //Add him to the chunk:
//     my_chunk.playerIn(joined_player);
//     joined_player.online = true;
//     console.log("Player joined: " + _client_socket.id);
//
//     joined_player.sendWelcomePackage(my_chunk.terrain);
//
//     return joined_player;
//   };
//
//   let leave = function (_client_id) {
//     let leaving_player_index = playerIndexByClientId(_client_id);
//     if (leaving_player_index == -1) {
//       return false;
//     }
//     let leaving_player = players[leaving_player_index];
//     leaving_player.online = false;
//     getMyChunk(leaving_player).playerOut(leaving_player.client_id);
//     console.log("Player left: " + _client_id);
//     return true;
//   };
//
//   let spawnPlayer = function (spawning_player) {
//     //console.log("spawning player now.")
//
//     //Try to spawn in 0, 0:
//     let spawn_chunk_X = 0;
//     let spawn_chunk_Y = 0;
//     let spawn_point = getSpawnPositionInChunk(0, 0);
//     if (!spawn_point.ok) {
//       //Couldn't find a spot ... search wider then.
//       let allowed_chunk_distance = 1;
//       let give_up_counter = 3
//       while (!spawn_point.ok) {
//         console.log("failed to spawn player in " + spawn_chunk_X + ", " + spawn_chunk_Y);
//
//         if (give_up_counter == 0) {
//           //search WIDER!!!
//           allowed_chunk_distance++;
//           give_up_counter = allowed_chunk_distance * 3;
//         }
//         give_up_counter--;
//
//         //Choose a chunk:
//         spawn_chunk_X = Math.floor(Math.random() * (2 * allowed_chunk_distance + 1) - allowed_chunk_distance);
//         spawn_chunk_Y = Math.floor(Math.random() * (2 * allowed_chunk_distance + 1) - allowed_chunk_distance);
//         //Try this one:
//         spawn_point = getSpawnPositionInChunk(spawn_chunk_X, spawn_chunk_Y);
//       }
//     }
//     spawning_player.chunkX = spawn_chunk_X;
//     spawning_player.chunkY = spawn_chunk_Y;
//     spawning_player.subchunkX = spawn_point.x;
//     spawning_player.subchunkY = spawn_point.y;
//     spawning_player.fresh = false;
//     let my_chunk = getChunk(spawning_player.chunkX, spawning_player.chunkY);
//   };
//
//   let getSpawnPositionInChunk = function (chunkX, chunkY) {
//     let spawn_chunk = getChunk(chunkX, chunkY);
//     //Attempt to find a valid spawn a bunch of times:
//     for (let i = 0; i < 256; i++) {
//       let spawnX = Math.floor(Math.random() * 256);
//       let spawnY = Math.floor(Math.random() * 256);
//       if (spawn_chunk.isValidSpawnSpot(spawnX, spawnY)) {
//         //Found it!
//         return { ok: true, x: spawnX, y: spawnY };
//       }
//     }
//     //Could not find a spot.
//     return { ok: false, x: -1, y: -1 };
//   };
//
//   let playerIndexByName = function (hashed_name) {
//     let i;
//     for (i = 0; i < players.length; i++) {
//       if (players[i].player_name_md5 == hashed_name) {
//         return i;
//       }
//     };
//     return -1;
//   };
//
//   let playerIndexByClientId = function (client_id) {
//     let i;
//     for (i = 0; i < players.length; i++) {
//       if (players[i].client_id == client_id) {
//         return i;
//       }
//     };
//     return -1;
//   };
//
//   let onlinePlayerByClientId = function (client_id) {
//     let i;
//     for (i = 0; i < players.length; i++) {
//       if (players[i].client_id == client_id) {
//         if (!players[i].online) {
//           return -1;
//         }
//         return i;
//       }
//     };
//     return -1;
//   };
//
//
//   return {
//     players: players,
//     getMyChunk: getMyChunk,
//     getChunk: getChunk,
//     loadFromJSON: loadFromJSON,
//     saveToJSON: saveToJSON,
//     join: join,
//     leave: leave,
//     onlinePlayerByClientId: onlinePlayerByClientId,
//     prepareSpawnArea: prepareSpawnArea
//   };
// };


/*
Map is the class holding everything about the world that needs to get saved to disk
and loaded from disk.

It also acts as an abstraction over chunks,
so that other classes do not need to worry about whether chunks exist or don't exist.
Calling the getChunk method always works.
If the chunk does not exist it is automatically generated on the fly.
*/

const Chunk = require("./Chunk").Chunk;
const WorldGenerator = require('./WorldGenerator').WorldGenerator;

class Map {
  constructor(WORLD_SEED) {
    this.WORLD_SEED = WORLD_SEED;
    this.chunks = {};
    this.players = [];
    this.knownPlayers = [];
  }

  getChunk(chunkx, chunky){
    if(!this.chunks[chunky]){
      this.chunks[chunky] = {};
    }
    if(!this.chunks[chunky][chunkx]){
      // Chunk does not exist. Generate it.
      let terrain = [];
      for(let i = 0; i < 256; i++){
        terrain[i] = []
        for(let j = 0; j < 256; j++){
          terrain[i][j] = ' ';
        }
      }
      this.chunks[chunky][chunkx] = new Chunk(terrain);
    }
    return this.chunks[chunky][chunkx];
  }

  getBlock(x, y){
    let chunkx = Math.floor(x / 256);
    let chunky = Math.floor(y / 256);
    let subchunkx = (x%256+256)%256;
    let subchunky = (y%256+256)%256;
    let chunk = this.getChunk(chunkx, chunky);
    let block = chunk[subchunky][subchunkx];
    return block;
  }

  setBlock(x, y, block){
    let chunkx = Math.floor(x / 256);
    let chunky = Math.floor(y / 256);
    let subchunkx = (x%256+256)%256;
    let subchunky = (y%256+256)%256;
    let chunk = this.getChunk(chunkx, chunky);
    chunk[subchunky][subchunkx] = block;
  }

  onlinePlayerByName(playerName){
    for(let i = 0; i < this.players.length; i++){
      if(this.players[i].name == playerName){
        return this.players[i];
      }
    }
    console.log('Player name not found: ' + playerName);
    return null;
  }

  // all players, including those who are offline
  // and also those who have never visited this map
  getPlayerByName(playerName){
    for(let i = 0; i < this.knownPlayers.length; i++){
      if(this.knownPlayers[i].name == playerName){
        return this.knownPlayers[i];
      }
    }

    // check the database

  }

  playerBySocketId(socketId){
    for(let i = 0; i < this.players.length; i++){
      if(this.players[i].socket.id == socketId){
        return this.players[i];
      }
    }
    console.log('Player socket not found: ' + socketId);
    return null;
  }

}

exports.Map = Map;
