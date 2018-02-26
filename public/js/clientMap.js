
/*
Map is the class holding the world content.
This content is synchronized with the state on the server.

It also acts as an abstraction over chunks,
so that other classes do not need to worry about whether chunks exist or don't exist.
If other classes try to acces terrain that does not exist,
they will get air blocks (' ').
*/

class Map {
  constructor() {
    this.chunks = {};
  }

  // getChunk(chunkx, chunky){
  //   if(!this.chunks[chunky]){
  //     this.chunks[chunky] = {};
  //   }
  //   if(!this.chunks[chunky][chunkx]){
  //     // Chunk does not exist. Generate it.
  //     let terrain = [];
  //     for(let i = 0; i < 256; i++){
  //       terrain[i] = []
  //       for(let j = 0; j < 256; j++){
  //         terrain[i][j] = ' ';
  //       }
  //     }
  //     this.chunks[chunky][chunkx] = new Chunk(terrain);
  //   }
  //   return this.chunks[chunky][chunkx];
  // }

  getBlock(x, y){
    let chunkx = Math.floor(x / 256);
    let chunky = Math.floor(y / 256);
    let subchunkx = (x%256+256)%256;
    let subchunky = (y%256+256)%256;
    if(!this.chunks[chunky]){
      return ' ';
    }
    if(!this.chunks[chunky][chunkx]){
      return ' ';
    }
    let chunk = chunks[chunky][chunkx];
    let block = chunk.terrain[subchunky][subchunkx];
    return block;
  }

  setBlock(x, y, block){
    let chunkx = Math.floor(x / 256);
    let chunky = Math.floor(y / 256);
    let subchunkx = (x%256+256)%256;
    let subchunky = (y%256+256)%256;
    if(!this.chunks[chunky]){
      return;
    }
    if(!this.chunks[chunky][chunkx]){
      return;
    }
    let chunk = chunks[chunky][chunkx];
    chunk.terrain[subchunky][subchunkx] = block;
  }

  loadChunk(chunkx, chunky, data){
    if(!this.chunks[chunky]){
      this.chunks[chunky] = {};
    }
    if(!this.chunks[chunky][chunkx]){
      this.chunks[chunky][chunkx] = new Chunk();
    }
    this.chunks[chunky][chunkx].setCompressed(data);
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
