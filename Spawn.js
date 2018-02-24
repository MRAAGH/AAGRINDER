/*
A class to handle the spawn area logic
and the logic for actually spawning players
when they log in for the first time
or when they log in but their position is obstructed.
*/

// const PlayerData = require("./PlayerData").PlayerData;
// const Map = require("./Map").Map;

const PREPARE_DIST = 2;
const PREPARE_CHUNK_COUNT = (2 * PREPARE_DIST + 1) * (2 * PREPARE_DIST + 1);
const BASE_SPAWN_DISTANCE = 32;
const SPAWN_DISTANCE_STEP = 16;
const SPAWN_ATTEMPTS = 32;

class Spawn {
  constructor(map, playerData){ // WARNING unused argument
    this.map = map;
    // this.playerData = playerData;
  }

  prepareSpawnArea() {
    let hrstart = process.hrtime();
    let i = 0;
    for (let y = -PREPARE_DIST; y <= PREPARE_DIST; y++) {
      for (let x = -PREPARE_DIST; x <= PREPARE_DIST; x++) {
        let hrend = process.hrtime(hrstart);
        if (hrend[0] > 0) {
          //At least a second has passed. Time to give the admin an update.
          let percent = Math.floor(100 * i / PREPARE_CHUNK_COUNT);
          console.log("Preparing spawn area: " + percent + "%");
          hrstart = process.hrtime();
        }
        this.getChunk(x, y);
        i++;
      }
    }
  }

  choosePlayerSpawnSpot(player){
    // does the player have a position?
    if(player.x !== null && player.y !== null){
      // yes. Attempt to spawn there or up to 63 blocks above / below.
      let searchDirection = this.map.getBlock(player.x, player.y) === ' ' ? -1 : 1;
      for(let i = 0; i < 64; i++){
        if(isValidSpawnSpot(player.x, player.y + i * searchDirection)){
          console.log('sgffsdsg')
          return({x: player.x, y: player.y + i * searchDirection});
        }
      }

      // spawn the player somewhere around world spawn instead.

      let spawnDistance = BASE_SPAWN_DISTANCE;
      while(true){ // player spawning can not fail
        for(let i = 0; i < SPAWN_ATTEMPTS; i++){
          let x = Math.floor((Math.random() - 0.5) * spawnDistance);
          let y = Math.floor((Math.random() - 0.5) * spawnDistance);
          if(isValidSpawnSpot(x, y)){
            console.log('sgffsdsg2222222222')
            return({x: x, y: y});
          }
        }
        // search wider
        spawnDistance += SPAWN_DISTANCE_STEP;
      }
    }
  }

  isValidSpawnSpot(x, y){
    if(map.getBlock(x, y) !== ' ') return false;
    if(map.getBlock(x, y - 1) === ' ') return false;
    return true;
  }
}

exports.Spawn = Spawn;
