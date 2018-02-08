
let Inventory = function () {
  let block_codes = ["A", "B", "T", "H", "D", "+", "-", "O", "M", "G"];
  let craftable = ["T", "O", "M", "G"];
  let raw_recipes = {
    "T": [{ block: "A", amount: 5 }],
    "O": [{ block: "B", amount: 1 }],
    "M": [{ block: "+", amount: 20 }],
    "G": [{ block: "M", amount: 1 }, { block: "D", amount: 1 }]
  };
  let projection = [0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15];
  let grass_blocks = ["─", "╶", "╵", "╰", "╴", "─", "╯", "┴", "╷", "╭", "│", "├", "╮", "┬", "┤", "┼"];
  let unique_grass_blocks = ["╶", "╵", "╰", "╴", "─", "╯", "┴", "╷", "╭", "│", "├", "╮", "┬", "┤", "┼"];
  let selected = "A";
  let state;

  let iniState = function () {
    state = {};
    for (let i = 0; i < block_codes.length; i++) {
      state[block_codes[i]] = 0;
    }
  };

  let isGrassBlock = function (block) {
    if (unique_grass_blocks.indexOf(block) === -1) {
      return false;
    }
    return true;
  };

  let blockCode2block = function (block_code, relativeCheck) {
    if (block_code == "-") {
      let type_code = 0;
      let power_of_2 = 1;
      for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
          let block_here = relativeCheck(x, y);
          if (block_here != false && isGrassBlock(block_here)) type_code += power_of_2;
          power_of_2 *= 2;
        }
      }
      let grass_block = grass_blocks[projection[type_code]];
      return grass_block;
    }
    return block_code;
  }

  let block2blockCode = function (block) {
    if (isGrassBlock(block)) {
      return "-";
    }
    return block;
  }

  let blockCodeExists = function (block_code) {
    if (block_codes.indexOf(block_code) === -1) return false;
    return true;
  }

  let hasBlock = function (block_code) {
    let how_many = this.state[block_code];
    return how_many > 0;
  }

  let spendBlock = function (block_code) {
    this.state[block_code]--;
  }

  let earnBlock = function (block_code) {
    this.state[block_code]++;
  }

  let canCraft = function (block_code) {
    if (craftable.indexOf(block_code) === -1) {
      return false;
    }
    let recipe = raw_recipes[block_code];
    for (let i = 0; i < recipe.length; i++) {
      if (this.state[recipe[i].block] < recipe[i].amount) {
        return false;
      }
    }
    return true;
  }

  let craft = function (block_code) {
    let recipe = raw_recipes[block_code];
    for (let i = 0; i < recipe.length; i++) {
      this.state[recipe[i].block] -= recipe[i].amount;
    }
    this.state[block_code]++;
  }

  iniState();
  return {
    blockCode2block: blockCode2block,
    block2blockCode: block2blockCode,
    blockCodeExists: blockCodeExists,
    state: state,
    selected: selected,
    hasBlock: hasBlock,
    spendBlock: spendBlock,
    earnBlock: earnBlock,
    canCraft: canCraft,
    craft: craft
  }
}

exports.Inventory = Inventory;