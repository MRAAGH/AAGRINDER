
/*
 * Map is the class holding the world content.
 * This content is synchronized with the state on the server.
 * 
 * It also acts as an abstraction over chunks,
 * so that other classes do not need to worry about whether chunks exist or don't exist.
 * If other classes try to acces terrain that does not exist,
 * they will get air blocks (' ').
 * Note that the behavior is different than on the server,
 * as on the server the missing chunk would immediately get generated.
 */

class Map {
  constructor() {
    this.chunks = {};
  }

  getBlock(x, y){
    const chunkx = Math.floor(x / 256);
    const chunky = Math.floor(y / 256);
    const subchunkx = (x%256+256)%256;
    const subchunky = (y%256+256)%256;

    if(!this.chunks[chunky]){
      return ' ';
    }
    if(!this.chunks[chunky][chunkx]){
      return ' ';
    }
    const chunk = this.chunks[chunky][chunkx];
    const block = chunk.terrain[subchunky][subchunkx];
    return block;
  }

  setBlock(x, y, block){
    const chunkx = Math.floor(x / 256);
    const chunky = Math.floor(y / 256);
    const subchunkx = (x%256+256)%256;
    const subchunky = (y%256+256)%256;
    if(!this.chunks[chunky]){
      return;
    }
    if(!this.chunks[chunky][chunkx]){
      return;
    }
    const chunk = this.chunks[chunky][chunkx];
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
