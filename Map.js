
/*
 * Map is the class holding everything about the world that needs to get saved to disk
 * and loaded from disk.
 * 
 * It also acts as an abstraction over chunks,
 * so that other classes do not need to worry about whether chunks exist or don't exist.
 * Calling the getChunk method always works.
 * If the chunk does not exist it is automatically generated on the fly.
 * 
 * A similar abstraction exists over players and can be found in PlayerData.js.
 */

const Chunk = require('./Chunk').Chunk;
const WorldGenerator = require('./generators/WorldGenerator').WorldGenerator;

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
      const reverseterrain = WorldGenerator(chunkx, chunky, this.WORLD_SEED, false);
      const terrain = [];
      for(let i = 0; i < 256; i++){
        terrain[i] = reverseterrain[255 - i];
      }
      this.chunks[chunky][chunkx] = new Chunk(terrain);
    }
    return this.chunks[chunky][chunkx];
  }

  getBlock(x, y){
    const chunkx = Math.floor(x / 256);
    const chunky = Math.floor(y / 256);
    const subchunkx = (x%256+256)%256;
    const subchunky = (y%256+256)%256;
    const chunk = this.getChunk(chunkx, chunky);
    const block = chunk.terrain[subchunky][subchunkx];
    return block;
  }

  setBlock(x, y, block){
    const chunkx = Math.floor(x / 256);
    const chunky = Math.floor(y / 256);
    const subchunkx = (x%256+256)%256;
    const subchunky = (y%256+256)%256;
    const chunk = this.getChunk(chunkx, chunky);
    chunk.terrain[subchunky][subchunkx] = block;
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

    // TODO:
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
