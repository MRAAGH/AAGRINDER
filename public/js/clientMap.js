
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
    let chunk = this.chunks[chunky][chunkx];
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
    let chunk = this.chunks[chunky][chunkx];
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

}
