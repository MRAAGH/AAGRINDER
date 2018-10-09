/*
 * Data holder class for terrain chunks.
 * Each block is a string of one or more characters.
 * The "compressed" format is nothing more than a serialized
 * representation of the contained strings.
 */

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
    let str = '';
    for(let y = 0; y < 256; y++){
      for(let x = 0; x < 256; x++){
        str += this.terrain[y][x];
      }
    }
    return str;
  }
}

exports.Chunk = Chunk;
