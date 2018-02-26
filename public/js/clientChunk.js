
class Chunk {
  constructor(terrain){
    this.terrain = terrain; //a 2d char array
  }

  setCompressed(str){
    this.terrain = [];
    for(let y = 0; y < 256; y++){
      this.terrain[y] = [];
      for(let x = 0; x < 256; x++){
        this.terrain[y][x] = str[y * 256 + x];
      }
    }
  }

  getCompressed(){
    // A simple RLE to compress big areas of air and stone (NYI)
    let str = '';
    let i = 0;
    for(let y = 0; y < 256; y++){
      for(let x = 0; x < 256; x++){
        str += this.terrain[y][x];
      }
    }
    return str;
  }
}
