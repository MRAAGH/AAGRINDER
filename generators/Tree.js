
let MersenneTwister = require('mersenne-twister');
let Cellular = require("./Cellular").Cellular;

let Tree = function (_subislandX, _subislandY, _tree_surface_size, _TREE_SEED) {
  let subislandX = _subislandX;
  let subislandY = _subislandY;
  let H = _tree_surface_size;
  let TREE_SEED = _TREE_SEED;
  let terrain;
  let leaf_terrain;

  let wood_frontier_count = 11; //aka max tree height
  let leaf_frontier_count = 4;

  let wood_guide_function = function (checkRelative, frontiers_done, frontiers_left) {
    down_left_left = checkRelative(-2, -1);
    down_left = checkRelative(-1, -1);
    down = checkRelative(0, -1);
    down_right = checkRelative(1, -1);
    down_right_right = checkRelative(2, -1);

    let neighbor_count = 0;
    if (down_left) neighbor_count++;
    if (down) neighbor_count++;
    if (down_right) neighbor_count++;

    switch (neighbor_count) {
      case 0:
        //It's a seed.
        return 1;
      case 1:
        //Which one?
        if (down) {
          //Straight down
          //Straight lines are welcome.
          //Especially at the beginning.
          if (frontiers_done < 5) {
            return 0.998;
          }
          return 0.5;
        }
        //Something else
        if ((down_left && down_left_left) || (down_right && down_right_right)) {
          //We're branching. Better continue this.
          return 0.8;
        }
        //Curves and branches are also welcome. Kind of. But not at the start.
        if (frontiers_done < 4) {
          return 0.01;
        }
        return 0.4;
      case 2:
        //Which two?
        if (!down) {
          //Left and right
          //I don't want branches joining
          return 0;
        }
        //Down and then something
        //There's already a lot of wood here so I'd rather not.
        return 0.03;
      case 3:
        //I don't want solid chunks of wood  
        return 0;
    }
    return 0; //Never executes
  };

  let leaf_guide_function = function (checkRelative, frontiers_done, frontiers_left) {
    let right = checkRelative(1, 0);
    let up = checkRelative(0, 1);
    let left = checkRelative(-1, 0);
    let down = checkRelative(0, -1);

    let neighbor_count = 0;
    if (right) neighbor_count++;
    if (up) neighbor_count++;
    if (left) neighbor_count++;
    if (down) neighbor_count++;

    if (frontiers_done < 2) {
      return 1;
    }

    switch (neighbor_count) {
      case 1:
        if (right || left) {
          //Expanding left and right is indeed desired.
          return 0.9;
        }
        //No. I don't like up and down.
        if (frontiers_left > 3) {
          return 0.02;
        }
        return 0;
      case 2:
        if (right || left) {
          //Expanding left and right is indeed desired.
          return 0.7;
        }
        //I don't know how this could happen. Let's make it 0.
        return 0;
      case 3:
        //Very rugged edge. That's not very nice. It's just a donkey.
        return 0.8;
      case 4:
        //I want no 1-block holes. That's ugly.
        return 1;
    }
    return 0; //Not that it matters. This line never executes.

  };

  let initializeTerrain = function () {
    terrain = [];
    leaf_terrain = [];
    for (let i = 0; i < H; i++) {
      terrain[i] = [];
      leaf_terrain[i] = [];
      for (let j = 0; j < H; j++) {
        terrain[i][j] = " ";
        leaf_terrain[i][j] = " ";
      }
    }
  };

  let GENERATE_TREE = function () {
    initializeTerrain();

    Cellular(
      TREE_SEED,
      terrain,
      [{ x: H / 2, y: 0 }],
      wood_guide_function,
      [
        { x: -1, y: 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ],
      false,
      wood_frontier_count,
      "H",
      " ",
      "3"
    );

    let leaf_seeds = chooseLeafSeeds();

    Cellular(
      TREE_SEED,
      leaf_terrain,
      leaf_seeds,
      leaf_guide_function,
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
      ],
      true,
      leaf_frontier_count,
      "A",
      " ",
      "4"
    );

    mergeLeavesIntoTree();
  };

  let chooseLeafSeeds = function () {
    let leaf_seeds = [];
    let limit = -1;
    //Search whole surface for tops of tree trunks:
    for (let y = H - 1; y >= 0 && y > limit; y--) {
      for (let x = 1; x < H - 1; x++) {
        if (terrain[y][x] == "H") {
          //Recognized tree trunk
          if (terrain[y + 1][x - 1] == " "
            && terrain[y + 1][x] == " "
            && terrain[y + 1][x + 1] == " ") {
            //Recognized top of tree trunk
            leaf_seeds.push({ x: x, y: y });
            //Set the leaf height limit if it hasn't been set yet:
            if (limit == -1) {
              limit = y - 5;
            }
          }
        }
      }
    }
    return leaf_seeds;
  };

  let mergeLeavesIntoTree = function () {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < H; x++) {
        if (terrain[y][x] == " ") {
          terrain[y][x] = leaf_terrain[y][x];
        }
      }
    }
  }

  let c = function (x, y, searched, _default = false) {
    if (x < 0 || x > H || y < 0 || y > H) {
      return _default;
    }
    return terrain[y][x] == searched;
  };

  let print = function () {
    let used_terrain = terrain;
    let minX = 255;
    let minY = 255;
    let maxX = 0;
    let maxY = 0;

    for (let i = H - 1; i >= 0; i--) {
      for (let j = 0; j < H; j++) {
        if (used_terrain[i][j] != " ") {
          if (i < minY) {
            minY = i;
          }
          if (i > maxY) {
            maxY = i;
          }
          if (j < minX) {
            minX = j;
          }
          if (j > maxX) {
            maxX = j;
          }
        }
      }
    }


    let stringified = "\n";
    for (let i = maxY; i >= minY; i--) {
      for (let j = minX; j <= maxX; j++) {
        stringified += used_terrain[i][j];
      }
      stringified += "\n";
    }
    console.log(stringified);
  };

  GENERATE_TREE();

  return {
    subislandX: subislandX,
    subislandY: subislandY,
    cornerSubislandX: subislandX - H / 2,
    cornerSubislandY: subislandY,
    terrain: terrain,
    print: print
  };
}

exports.Tree = Tree;