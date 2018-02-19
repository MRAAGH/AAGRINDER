
class Chunk {
  constructor(terrain){
    this.terrain = terrain; //a 2d char array
    this.subscribers = [];
    // this.change2D = {};
  }

  setCompressed(str){
    for(let y = 0; y < 256; y++){
      for(let x = 0; x < 256; x++){
        terrain[y][x] = str[y * 256 + x];
      }
    }
  }

  getCompressed(){
    // A simple RLE to compress big areas of air and stone (NYI)
    let str = 0;
    let i = 0;
    for(let y = 0; y < 256; y++){
      for(let x = 0; x < 256; x++){
        str += terrain[y][x];
      }
    }
    return str;
  }
}

exports.Chunk = Chunk;
