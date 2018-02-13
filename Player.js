// let Inventory = require("./Inventory").Inventory;
//
// let Player = function (_player_name_md5, _client_socket) {
//   let chunkX;
//   let chunkY;
//   let subchunkX;
//   let subchunkY;
//   let client_id;
//   if (_client_socket) client_id = _client_socket.id;
//   let client_socket = _client_socket;
//   let player_name_md5 = _player_name_md5;
//   let online;
//   let fresh;
//   let reach = 5;
//   let inventory = new Inventory();
//
//   let sendTerrainUpdate = function (terrain) {
//     this.client_socket.emit("t", {
//       t: terrain,
//       cx: this.chunkX,
//       cy: this.chunkY,
//       sx: this.subchunkX,
//       sy: this.subchunkY,
//       i: this.inventory.state
//     });
//   }
//
//   let sendWelcomePackage = function (terrain) {
//     let compactified_terrain = "";
//     for (let y = 0; y < 256; y++) {
//       for (let x = 0; x < 256; x++) {
//         compactified_terrain += terrain[y][x];
//       }
//     }
//
//     this.client_socket.emit("w", {
//       t: compactified_terrain,
//       cx: this.chunkX,
//       cy: this.chunkY,
//       sx: this.subchunkX,
//       sy: this.subchunkY,
//       i: this.inventory.state
//     });
//     console.log("sent welcome");
//   }
//
//   return {
//     chunkX: chunkX,
//     chunkY: chunkY,
//     subchunkX: subchunkX,
//     subchunkY: subchunkY,
//     client_id: client_id,
//     client_socket: client_socket,
//     player_name_md5: player_name_md5,
//     online: online,
//     fresh: fresh,
//     reach: reach,
//     inventory: inventory,
//     sendTerrainUpdate: sendTerrainUpdate,
//     sendWelcomePackage: sendWelcomePackage
//   };
// };
//
// exports.Player = Player;


class Player {
  constructor(x, y, name, socket){
    this.x = x;
    this.y = y;
    this.name = name;
    this.socket = socket;
    this.subscriptions = [];
    this.chunkUpdates = [];
    this.changeObj = {};
    this.hacker = false;
    this.hackedAt = -1;
  }


}
