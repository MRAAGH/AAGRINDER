
class Inventory{

  constructor(){

    this.item_codes = ['B', 'A', 'T', 'H', 'D', '+', '-', 'O', 'M', 'G'];
    this.recipes = {
      'T': [{ block: 'A', amount: 5 }],
      'O': [{ block: 'B', amount: 1 }],
      'M': [{ block: '+', amount: 20 }],
      'G': [{ block: 'M', amount: 1 }, { block: 'D', amount: 1 }]
    };
    this.grassProjection = ['0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '0', '0', '2', '2', '0', '0', '2', '2', '4', '4', '6', '6', '4', '4', '6', '6', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '1', '1', '3', '3', '1', '1', '3', '3', '5', '5', '7', '7', '5', '5', '7', '7', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '8', '8', 'a', 'a', '8', '8', 'a', 'a', 'c', 'c', 'e', 'e', 'c', 'c', 'e', 'e', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f', '9', '9', 'b', 'b', '9', '9', 'b', 'b', 'd', 'd', 'f', 'f', 'd', 'd', 'f', 'f'];

    this.state = {};
    for (let i = 0; i < this.item_codes.length; i++) {
      this.state[this.item_codes[i]] = 0;
    }
  }

  isGrassBlock(block) {
    return block.substr(0,1) === '-';
  };

  item2block(item_code, relativeCheck) {
    if (item_code == '-') {
      let type_code = 0;
      let power_of_2 = 1;
      for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
          // the "-" is there because the logic is back from when the world coordinates were mirrored
          const block_here = relativeCheck(x, -y);
          if (block_here != false && this.isGrassBlock(block_here)) type_code += power_of_2;
          power_of_2 *= 2;
        }
      }
      let grass_block = '-' + this.grassProjection[type_code];
      return grass_block;
    }
    return item_code;
  };

  block2item(block) {
    return block.substr(0,1);
  };

  itemCodeExists(item_code) {
    if (this.item_codes.indexOf(item_code) === -1) return false;
    return true;
  };

  hasBlock(item_code) {
    const how_many = this.state[item_code];
    return how_many > 0;
  };
}

if(typeof exports !== 'undefined') exports.Inventory = Inventory;
