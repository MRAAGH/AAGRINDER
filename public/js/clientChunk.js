
class Chunk {
  constructor(terrain){
    this.terrain = terrain; //a 2d char array
  }

  setCompressed(str){
    this.terrain = [];
    let offset = 0;
    for(let y = 0; y < 256; y++){
      this.terrain[y] = [];
      for(let x = 0; x < 256; x++){
        let block = str[y * 256 + x + offset];
        if(block === '-'){
          block += str[y * 256 + x + offset + 1];
          offset++;
        }
        // else if(block === 'P'){
        //   block += str.substring(y * 256 + x + offset + 1, y * 256 + x + offset + 7)
        // }
        this.terrain[y][x] = block;
      }
    }
  }
}
