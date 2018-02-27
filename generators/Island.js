
let MersenneTwister = require('mersenne-twister');
let Tree = require('./Tree').Tree;
let Cellular = require('./Cellular').Cellular;

let Island = function (_globalX, _globalY, _island_surface_size, _WORLD_SEED) {
  let globalX = _globalX;
  let globalY = _globalY;
  let H = _island_surface_size;
  let WORLD_SEED = _WORLD_SEED;
  let ISLAND_LOGIC_SEED_BASE = 100;
  let terrain;
  let generator;
  let ore_generator;
  let tree_generator;

  let island_magnitude;
  let seed_padding = 40;
  let terrain_frontier_count = 14;
  let ore_frontier_count = 10;
  let ore_chance = 0.12;
  let ore_stabilizer = 0.6;
  let diamond_chance = 0.04;
  let diamond_stabilizer = 0.6;
  let island_seeds = [];

  let tree_surface_size = 32;
  let tree_chance = 0.3;
  let tree_collisions;
  let tree_count;

  let ore_ran = function () {
    return ore_generator.random();
  };

  let terrain_guide_function = function (checkRelative, frontiers_done, frontiers_left) {
    let right = checkRelative(1, 0);
    let up = checkRelative(0, 1);
    let left = checkRelative(-1, 0);
    let down = checkRelative(0, -1);

    let neighbor_count = 0;
    if (right) neighbor_count++;
    if (up) neighbor_count++;
    if (left) neighbor_count++;
    if (down) neighbor_count++;

    switch (neighbor_count) {
    case 0:
      //It's a seed.
      return 1;
    case 1:
      if (frontiers_left < 1) {
        //Last frontier
        return 0;
      }
      if (frontiers_left < 3) {
        //We are finishing up. This is no time for random spikes.
        return 0.05;
      }
      else {
        //Alright ... let's make a random spike. Maybe.
        return 0.5;
      }
    case 2:
      if (frontiers_left < 1) {
        //Last frontier
        return 0;
      }
      if ((right && left) || (up && down)) {
        //1 block wide tunnel. To hell with it. (heh, get it?)
        return 0.9;
      }
      if (frontiers_left < 2) {
        return 0.1;
      }
      else {
        return 0.6;
      }
    case 3:
      if (frontiers_left < 1) {
        //Last frontier
        return 0;
      }
      //Very rugged terrain. Better fix.
      return 0.9;
    case 4:
      //I want no 1-block holes. That's ugly.
      return 1;
    }
    return 0; //Not that it matters. This line never executes.
  };

  let ore_guide_function = function (checkRelative, frontiers_done, frontiers_left) {
    let right = checkRelative(1, 0);
    let up = checkRelative(0, 1);
    let left = checkRelative(-1, 0);
    let down = checkRelative(0, -1);

    let neighbor_count = 0;
    if (right) neighbor_count++;
    if (up) neighbor_count++;
    if (left) neighbor_count++;
    if (down) neighbor_count++;

    switch (neighbor_count) {
    case 0:
      //It's a seed.
      return 1;
    case 1:
      if (frontiers_left < 1) {
        //Last frontier
        return 0;
      }
      if (frontiers_left < 3) {
        //We are finishing up. Time for random spikes!
        return 0.6;
      }
      else {
        //Ores grow slowly.
        return 0.08;
      }
    case 2:
      if ((right && left) || (up && down)) {
        //1 block wide tunnel. To hell with it. (heh, get it?)
        return 0.9;
      }
      if (frontiers_left < 1) {
        //Last frontier
        return 0;
      }
      else {
        //Ores grow slowly.
        return 0.1;
      }
    case 3:
      //Very rugged edge. That's fine for ores.
      return 0.1;
    case 4:
      //I want no 1-block holes. That's ugly.
      return 1;
    }
    return 0; //Not that it matters. This line never executes.
  };

  let initializeTerrain = function () {
    terrain = [];
    for (let i = 0; i < H; i++) {
      terrain[i] = [];
      for (let j = 0; j < H; j++) {
        terrain[i][j] = ' ';
      }
    }
  };

  let getBlankTerrain = function (size) {
    let local_terrain = [];
    for (let i = 0; i < size; i++) {
      local_terrain[i] = [];
      for (let j = 0; j < size; j++) {
        local_terrain[i][j] = ' ';
      }
    }
    return local_terrain;
  };

  let GENERATE_ISLAND = function () {
    initializeTerrain();

    chooseIslandSeeds([globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 0]);

    let terrain_cellular = Cellular(
      [globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 1],
      terrain,
      island_seeds,
      terrain_guide_function,
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
      ],
      true,
      terrain_frontier_count,
      'B',
      ' ',
      '1'
    );

    let terrain_final_frontier = terrain_cellular.final_frontier;

    let grassify_result = grassify(terrain_final_frontier);

    let supported_grass_spots = grassify_result.supported_grass_spots;
    let grass_spots = grassify_result.grass_spots;

    let tree_layer = treeify([globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 2], supported_grass_spots);

    grassify_stage_2(grass_spots);

    mergeLayers(tree_layer, terrain);

    let ore_seeds = chooseOreSeeds([globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 3]);

    Cellular(
      [globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 4],
      terrain,
      ore_seeds,
      ore_guide_function,
      [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
      ],
      true,
      ore_frontier_count,
      '+',
      'B',
      '2'
    );

    chooseDiamonds([globalX, globalY, WORLD_SEED, ISLAND_LOGIC_SEED_BASE + 5]);
  };

  let chooseIslandSeeds = function (_SEED) {
    let gen = new MersenneTwister(_SEED);

    island_magnitude = Math.floor(gen.random() * gen.random() * 20);

    let seed_count = island_magnitude + 20;

    for (let i = 0; i < seed_count; i++) {
      let x = Math.floor(((gen.random() * 2 - 1) * (gen.random() * 2 - 1) * 0.5 + 0.5) * (H - 2 * seed_padding) + seed_padding);
      let y = Math.floor(((gen.random() * 2 - 1) * (gen.random() * 2 - 1) * 0.5 + 0.5) * (H - 2 * seed_padding) + seed_padding);
      addToIslandSeeds(x, y);
    }

    //Connect the ones close by:
    let connection_attempts = Math.floor(island_magnitude / 4 + 5);
    for (let it = 0; it < connection_attempts; it++) {
      //Find the loneliest seed:
      let loneliestI = -1;
      let loneliestJ = -1;
      let loneliestDist = -1;
      let first_L = true;
      for (let i = 0; i < island_seeds.length; i++) {
        //What's the closest seed to this one?
        let minJ = -1;
        let minDist = -1;
        let first = true;
        for (let j = 0; j < island_seeds.length; j++) {
          if (i != j) {
            //Got a pair of seeds. Measure euclidean distance squared
            let dx = island_seeds[i].x - island_seeds[j].x;
            let dy = island_seeds[i].y - island_seeds[j].y;
            let distance_squared = dx * dx + dy * dy;
            //Are we going to acknowledge this?
            if (distance_squared > 9 && distance_squared < 900) {
              if (first || distance_squared < minDist) {
                minJ = j;
                minDist = distance_squared;
                first = false;
              }
            }
          }
        }
        //Found closest seed to this one.
        //Does that make this the loneliest one?
        if (minDist > -1) { //Edge case. Skip when nothing is found
          if (first_L || minDist > loneliestDist) {
            loneliestI = i;
            loneliestJ = minJ;
            loneliestDist = minDist;
            first_L = false;
          }
        }
      }
      if (loneliestDist == -1) {
        //Nothing found, we're done, I guess
        break;
      }
      //Alright, fixing the lonely seed:
      let mid_X = Math.floor((island_seeds[loneliestI].x + island_seeds[loneliestJ].x) / 2);
      let mid_Y = Math.floor((island_seeds[loneliestI].y + island_seeds[loneliestJ].y) / 2);
      mid_X += Math.floor(Math.random() * 6 - 3);
      mid_Y += Math.floor(Math.random() * 6 - 3);
      addToIslandSeeds(mid_X, mid_Y);
    }
  };

  let chooseOreSeeds = function (_SEED) {
    let dynamic_ore_chance = ore_chance;
    let gen = new MersenneTwister(_SEED);
    let ore_seeds = [];
    for (let i = 0; i < island_seeds.length; i++) {
      if (gen.random() < dynamic_ore_chance) {
        ore_seeds.push({
          x: island_seeds[i].x,
          y: island_seeds[i].y
        });
        dynamic_ore_chance *= ore_stabilizer;
      }
    }
    return ore_seeds;
  };

  let chooseDiamonds = function (_SEED) {
    let dynamic_diamond_chance = diamond_chance;
    let gen = new MersenneTwister(_SEED);
    for (let i = 0; i < island_seeds.length; i++) {
      if (gen.random() < dynamic_diamond_chance) {
        if (terrain[island_seeds[i].y][island_seeds[i].x] == 'B') {
          terrain[island_seeds[i].y][island_seeds[i].x] = 'D';
          dynamic_diamond_chance *= diamond_stabilizer;
        }
      }
    }
  };

  let addToIslandSeeds = function (x, y) {
    for (let i = 0; i < island_seeds.length; i++) {
      if (island_seeds[i].x == x && island_seeds[i].y == y) {
        return false;
      }
    }
    island_seeds.push({ x: x, y: y });
    return true;
  };

  let grassify = function (potential_positions) {
    let grass_spots = [];
    let supported_grass_spots = [];
    for (let i = 0; i < potential_positions.length; i++) {
      let x = potential_positions[i].x;
      let y = potential_positions[i].y - 1;
      if (y > 0 && x > 0 && y < H - 1 && x < H - 1) { //We ignore those at the edge
        if (terrain[y][x] == 'B' && (terrain[y + 1][x] == ' ' || terrain[y + 1][x] == 'A')) {
          //This is a surface worth grassifying.
          supported_grass_spots.push({ x: x, y: y + 1 });
          grassPlace(grass_spots, x, y + 1);
          grassPlace(grass_spots, x + 1, y + 1);
          grassPlace(grass_spots, x - 1, y + 1);
          if (grassPlace(grass_spots, x + 1, y)) {
            grassPlace(grass_spots, x + 1, y - 1);
          }
          if (grassPlace(grass_spots, x - 1, y)) {
            grassPlace(grass_spots, x - 1, y - 1);
          }
        }
      }
    }

    return {
      supported_grass_spots: supported_grass_spots,
      grass_spots: grass_spots
    };
  };

  let grassPlace = function (grass_spots, x, y) {
    if (y > 0 && x > 0 && y < H - 1 && x < H - 1) { //We ignore those at the edge
      //Needs to be air before it is changed
      if (terrain[y][x] == ' ') {
        terrain[y][x] = 'A';
        grass_spots.push({ x: x, y: y });
      }
      return terrain[y][x] == 'A';
    }
    return false;
  };

  let grassify_stage_2 = function (grass_spots) {
    //Loop for assigning types:
    for (let i = 0; i < grass_spots.length; i++) {
      let x = grass_spots[i].x;
      let y = grass_spots[i].y;
      if (terrain[y][x] == 'A') {
        //Build code in binary:
        let type_code = 0;
        /*
        //old stuffz
        if (c(x + 1, y, "A")) type_code += 1;
        if (c(x, y + 1, "A")) type_code += 2;
        if (c(x - 1, y, "A")) type_code += 4;
        if (c(x, y - 1, "A")) type_code += 8;
        */
        if (c(x - 1, y + 1, 'A')) type_code += 1;
        if (c(x + 0, y + 1, 'A')) type_code += 2;
        if (c(x + 1, y + 1, 'A')) type_code += 4;
        if (c(x - 1, y + 0, 'A')) type_code += 8;
        if (c(x + 0, y + 0, 'A')) type_code += 16;
        if (c(x + 1, y + 0, 'A')) type_code += 32;
        if (c(x - 1, y - 1, 'A')) type_code += 64;
        if (c(x + 0, y - 1, 'A')) type_code += 128;
        if (c(x + 1, y - 1, 'A')) type_code += 256;

        grass_spots[i].type = type_code;
      }
    }

    //Apply types:
    //let grass_blocks = ["─", "─", "╵", "╰", "─", "─", "╯", "─", "│", "╭", "│", "│", "╮", "─", "│", "─"];
    //Lone grass blocks are ugly, so I sneakily turn them to B's.
    //let grass_blocks = ['B', '╶', '╵', '╰', '╴', '─', '╯', '┴', '╷', '╭', '│', '├', '╮', '┬', '┤', '┼'];
    let grass_blocks = ['B', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-a', '-b', '-c', '-d', '-e', '-f'];
    //the projection describes which block to use depending on the state of sorrounding blocks.
    let projection = [0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 9, 9, 11, 11, 9, 9, 11, 11, 13, 13, 15, 15, 13, 13, 15, 15, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 9, 9, 11, 11, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 0, 0, 2, 2, 0, 0, 2, 2, 4, 4, 6, 6, 4, 4, 6, 6, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 1, 1, 3, 3, 1, 1, 3, 3, 5, 5, 7, 7, 5, 5, 7, 7, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 12, 12, 14, 14, 12, 12, 14, 14, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10, 8, 8, 10, 10];

    for (let i = 0; i < grass_spots.length; i++) {
      let x = grass_spots[i].x;
      let y = grass_spots[i].y;
      if (terrain[y][x] == 'A') {
        let type = grass_spots[i].type;
        let grass_block = grass_blocks[projection[type]];
        terrain[y][x] = grass_block;
      }
    }
  };

  let treeify = function (_SEED, potential_positions) {
    tree_count = 0;
    tree_collisions = 0;

    let tree_layer = getBlankTerrain(H);

    let tree_generator = new MersenneTwister(_SEED);

    for (let i = 0; i < potential_positions.length; i++) {
      let x = potential_positions[i].x;
      let y = potential_positions[i].y;
      //Trees grow on grass (A)
      if (terrain[y][x] == 'A'
        && terrain[y - 1][x] == 'B') {
        //Seems like a nice spot for a tree

        if (tree_generator.random() < tree_chance) {

          let tree_seed = tree_generator.random_int();
          let the_tree = new Tree(x, y, tree_surface_size, tree_seed);

          //Try to place it:
          if (canPlaceTree(the_tree, tree_layer)) {
            placeTree(the_tree, tree_layer);
            tree_count++;
          }
          else {
            tree_collisions++;
          }
        }
      }
    }
    return tree_layer;
  };

  let canPlaceTree = function (tree, tree_layer) {
    for (let tree_y = 0; tree_y < tree_surface_size; tree_y++) {
      let island_y = tree_y + tree.cornerSubislandY;
      for (let tree_x = 0; tree_x < tree_surface_size; tree_x++) {
        let island_x = tree_x + tree.cornerSubislandX;
        if (tree.terrain[tree_y][tree_x] != ' ') {
          //Part of the tree is here. Need to check existing terrain.
          if (island_y < 0 || island_x < 0 || island_y > H - 1 || island_x > H - 1) {
            //It's outside of the island surface and therefore invalid.
            return false;
          }
          //Checks in tree layer
          if (tree_layer[island_y][island_x] != ' ') {
            //Trying to replace something in the tree layer
            return false;
          }
          if (island_y > 0 && tree_layer[island_y - 1][island_x] != ' ') {
            //Trying to touch something in the tree layer
            return false;
          }
          if (island_x > 0 && tree_layer[island_y][island_x - 1] != ' ') {
            //Trying to touch something in the tree layer
            return false;
          }
          if (island_y < H - 1 && tree_layer[island_y + 1][island_x] != ' ') {
            //Trying to touch something in the tree layer
            return false;
          }
          if (island_x < H - 1 && tree_layer[island_y][island_x + 1] != ' ') {
            //Trying to touch something in the tree layer
            return false;
          }
          //Checks in main layer:
          if (tree.terrain[tree_y][tree_x] == 'A') {
            //Leaves can only replace air.
            if (terrain[island_y][island_x] != ' ') {
              //Leaf wants to replace something other than air
              return false;
            }
          }
          else {
            //Wood may repace anything except for stone
            if (terrain[island_y][island_x] == 'B') {
              //Wood wants to replace a rock
              return false;
            }
          }
        }
      }
    }
    return true;
  };

  let placeTree = function (tree, tree_layer) {
    for (let tree_y = 0; tree_y < tree_surface_size; tree_y++) {
      let island_y = tree_y + tree.cornerSubislandY;
      for (let tree_x = 0; tree_x < tree_surface_size; tree_x++) {
        let island_x = tree_x + tree.cornerSubislandX;
        if (tree.terrain[tree_y][tree_x] != ' ') {
          //Part of the tree is here. Place.
          tree_layer[island_y][island_x] = tree.terrain[tree_y][tree_x];
        }
      }
    }
  };

  //Merge from layer1 into layer2:
  let mergeLayers = function (layer1, layer2) {
    for (let y = 0; y < layer1.length; y++) {
      for (let x = 0; x < layer1.length; x++) {
        if (layer1[y][x] != ' ') {
          //There's something here in layer 1.
          //Transfer to layer 2:
          layer2[y][x] = layer1[y][x];
        }
      }
    }
  };

  /*
    let canMergeIntoLayer = function (fresh_layer, target_layer, cornerX, cornerY) {
      let fresh_surface_size = fresh_layer.length;
      for (let fresh_y = 0; fresh_y < fresh_surface_size; fresh_y++) {
        let target_y = fresh_y + cornerY;
        for (let fresh_x = 0; fresh_x < fresh_surface_size; fresh_x++) {
          let target_x = fresh_x + cornerX;
          if (fresh.terrain[fresh_y][fresh_x] != " ") {
            //Part of the fresh layer is here. Need to check existing terrain.
            if (island_y < 0 || island_x < 0 || island_y >= H || island_x >= H) {
              //It's outside of the target layer's surface and therefore invalid.
              return false;
            }
            if (terrain[island_y][island_x] != " ") {
              //New layer wants to replace something other than air
              return false;
            }

          }
        }
      }
      return true;
    }

    let mergeIntoLayer = function (fresh_layer, target_layer, cornerX, cornerY) {
      let fresh_surface_size = fresh_layer.length;
      for (let fresh_y = 0; fresh_y < fresh_surface_size; fresh_y++) {
        let target_y = fresh_y + cornerY;
        for (let fresh_x = 0; fresh_x < fresh_surface_size; fresh_x++) {
          let target_x = fresh_x + cornerX;
          if (fresh.terrain[fresh_y][fresh_x] != " ") {
            //Part of the fresh layer is here. Place.
            terrain[target_y][target_x] = fresh.terrain[fresh_y][fresh_x];
          }
        }
      }
    }
  */

  let c = function (x, y, searched, _default = false) {
    if (x < 0 || x > H || y < 0 || y > H) {
      return _default;
    }
    return terrain[y][x] == searched;
  };

  let print = function () {
    let minX = 255;
    let minY = 255;
    let maxX = 0;
    let maxY = 0;

    for (let i = H - 1; i >= 0; i--) {
      for (let j = 0; j < H; j++) {
        if (terrain[i][j] != ' ') {
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


    let stringified = '\n';
    for (let i = maxY; i >= minY; i--) {
      for (let j = minX; j <= maxX; j++) {
        stringified += terrain[i][j];
      }
      stringified += '\n';
    }
    console.log(stringified);
  };

  GENERATE_ISLAND();

  return {
    globalX: globalX,
    globalY: globalY,
    cornerGlobalX: globalX - H / 2,
    cornerGlobalY: globalY - H / 2,
    terrain: terrain,
    tree_count: tree_count,
    tree_collisions: tree_collisions,
    print: print
  };
};

exports.Island = Island;
