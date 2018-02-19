/*
A class to handle the spawn area logic
and the logic for actually spawning players
when they log in for the first time
or when they log in but their position is obstructed.
*/

const PlayerData = require("./PlayerData").PlayerData;
const Map = require("./Map").Map;

class Spawn {
  constructor(map, playerData){
    this.map = map;
    this.playerData = playerData;
  }

  prepareSpawnArea() {
    const prepare_dist = 2;
    let chunk_count = (2 * prepare_dist + 1) * (2 * prepare_dist + 1);
    let hrstart = process.hrtime();
    let i = 0;
    for (let y = -prepare_dist; y <= prepare_dist; y++) {
      for (let x = -prepare_dist; x <= prepare_dist; x++) {
        let hrend = process.hrtime(hrstart);
        if (hrend[0] > 0) {
          //At least a second has passed. Time to give the admin an update.
          let percent = Math.floor(100 * i / chunk_count);
          console.log("Preparing spawn area: " + percent + "%");
          hrstart = process.hrtime();
        }
        this.getChunk(x, y);
        i++;
      }
    }
  }
}

exports.Spawn = Spawn;
