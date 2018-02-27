
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

//   getCompressed(){
//     // A simple RLE to compress big areas of air
//     let str = '';
//     let airCounter = 0;
//     for(let y = 0; y < 256; y++){
//       for(let x = 0; x < 256; x++){
//         if(this.terrain[y][x] === ' '){
//           airCounter++;
//         }
//         else{
//           if(airCounter > 0){
//             str += ' ' + (airCounter - 1).toString(16);
//             airCounter = 0;
//           }
//           str += this.terrain[y][x];
//         }
//       }
//     }
//     if(airCounter > 0){
//       str += ' ' + (airCounter - 1).toString(16);
//       airCounter = 0;
//     }
//     return str;
//   }
}

exports.Chunk = Chunk;
