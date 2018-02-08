//The generator is stateless.
//It is a projection from chunk coordinates and world seed to terrain.

let MersenneTwister = require('mersenne-twister');
let Island = require("./Island").Island;

let WorldGenerator = function (_chunkX, _chunkY, _WORLD_SEED, silent) {
  //console.log("generator called for " + _chunkX + ", " + _chunkY);
  let chunkGlobalX = _chunkX * 256;
  let chunkGlobalY = _chunkY * 256;
  let WORLD_SEED = _WORLD_SEED;

  let island_rarity = 1;
  let island_surface_size = 192;
  let island_spot_search_step = 256;
  let spawn_distance_beyond_chunk = island_surface_size * 3 / 2;
  let draw_distance_beyond_chunk = island_surface_size * 2;
  let layer_size = 256 + 2 * draw_distance_beyond_chunk;
  let layer_global_cornerX = chunkGlobalX - draw_distance_beyond_chunk;
  let layer_global_cornerY = chunkGlobalY - draw_distance_beyond_chunk;

  let getBlankTerrain = function (size) {
    let local_terrain = [];
    for (let i = 0; i < size; i++) {
      local_terrain[i] = [];
      for (let j = 0; j < size; j++) {
        local_terrain[i][j] = " ";
      }
    }
    return local_terrain;
  }

  let getIslandPositions = function () {
    let minX = chunkGlobalX - spawn_distance_beyond_chunk;
    let minY = chunkGlobalY - spawn_distance_beyond_chunk;
    let maxX = chunkGlobalX + 256 + spawn_distance_beyond_chunk;
    let maxY = chunkGlobalY + 256 + spawn_distance_beyond_chunk;

    let chosen_positions = [];
    for (let y = minY; y < maxY; y += island_spot_search_step) {
      for (let x = minX; x < maxX; x += island_spot_search_step) {
        let raaan = new MersenneTwister([x, y, WORLD_SEED, 0]).random_int();
        let mod = raaan % island_rarity;
        if (mod == 0) {
          //This position is chosen.
          //But we will still nudge it slightly.
          //The tests only cover every (island_spot_search_step^2)th block
          //so we need to choose one of the (island_spot_search_step^2) that belong here.
          let raaan2 = new MersenneTwister([x, y, WORLD_SEED, 1]).random_int();
          let mod2 = raaan2 % (island_spot_search_step * island_spot_search_step);
          //console.log("mod2: " + mod2);
          let offsetX = Math.floor(mod2 / island_spot_search_step);
          let offsetY = mod2 % island_spot_search_step;
          let chosenX = x + offsetX;
          let chosenY = y + offsetY;
          if (chosenX < chunkGlobalX + 256 + spawn_distance_beyond_chunk && chosenY < chunkGlobalY + 256 + spawn_distance_beyond_chunk) {
            //console.log("Chose position " + chosenX + ", " + chosenY);
            //console.log("(source was " + x + ", " + y + ")");
            chosen_positions.push({ x: chosenX, y: chosenY });
          }
        }
      }
    }

    //console.log("Chose " + chosen_positions.length + " positions in total");
    return chosen_positions;
  }

  let getIsland = function (globalX, globalY) {
    //console.log("Creating island at " + (globalX - chunkGlobalX + draw_distance_beyond_chunk) + ", " + (globalY - chunkGlobalY + draw_distance_beyond_chunk) + " in the draw area");
    //console.log("Creating island at " + (globalX) + ", " + (globalY));
    let new_island = new Island(globalX, globalY, island_surface_size, WORLD_SEED);
    //console.log("Generated this island: " + JSON.stringify(new_island));
    return new_island;
  }
  /*
  (allpositions = []) && false
  
  allpositions.push({x:chosenX,y:chosenY})&&false
  
  (() => {
    try {
      let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
      for (let i = 0; i < allpositions.length; i++) {
        let p = allpositions[i];
        if (p.x < minx) {
          minx = p.x;
        }
        if (p.y < miny) {
          miny = p.y;
        }
        if (p.x > maxx) {
          maxx = p.x;
        }
        if (p.y > maxy) {
          maxy = p.y;
        }
      }
      let cols = 20;
      maxx++;
      maxy++;

      for (let i = 0; i < cols; i++) {
        let str = "";
        for (let j = 0; j < cols; j++) {
          let c = 0;
          let xl = minx + (maxx - minx) * j / cols;
          let yl = miny + (maxy - miny) * i / cols;
          let xu = minx + (maxx - minx) * (j + 1) / cols;
          let yu = miny + (maxy - miny) * (i + 1) / cols;
          for (let k = 0; k < allpositions.length; k++) {
            let p = allpositions[k];
            if (p.x >= xl && p.x < xu && p.y >= yl && p.y < yu) {
              c++;
            }
          }
          str += (c > 0 ? "X" : ".");
        }
        console.log(str);
      }
      console.log("\n\n");
    } catch (e) { console.log("BREAKPOINT ERROR: " + e) }
  })() || true
* /
  
  
  
  
  
  
  
  
    /*
    let placeIslandToNewLayer = function (island) {
      let new_layer = getBlankTerrain(layer_size);
   
      let minX = island.cornerGlobalX - layer_global_cornerX;
      let minY = island.cornerGlobalY - layer_global_cornerY;
   
      //console.log("minX " + minX + " minY " + minY + " cornerGlobalX " + island.cornerGlobalX + " cornerGlobalY " + island.cornerGlobalY + " chunkGlobalX " + chunkGlobalX + " chunkGlobalY " + chunkGlobalY);
      //console.log("layer_global_cornerX " + layer_global_cornerX + " layer_global_cornerY " + layer_global_cornerY + " draw_distance_beyond_chunk " + draw_distance_beyond_chunk);
   
      for (let y = 0; y < island_surface_size; y++) {
        for (let x = 0; x < island_surface_size; x++) {
          //console.log("Will change layer at " + (minX + x) + ", " + (minY + y));
          new_layer[minY + y][minX + x] = island.terrain[island_surface_size - y - 1][x];
        }
      }
   
      return new_layer;
    }*/

  //Merge from layer1 into layer2:
  /*
  let mergeLayers = function (layer1, layer2) {
    for (let y = 0; y < layer_size; y++) {
      for (let x = 0; x < layer_size; x++) {
        if (layer1[y][x] != " ") {
          //There's something here in layer 1.
          //Transfer to layer 2:
          layer2[y][x] = layer1[y][x];
        }
      }
    }
  }*/

  let checkIslandOverlap = function (island1, island2) {
    //How much overlap is there?
    let overlapX = island_surface_size - Math.abs(island1.cornerGlobalX - island2.cornerGlobalX);
    let overlapY = island_surface_size - Math.abs(island1.cornerGlobalY - island2.cornerGlobalY);

    //console.log("OVERLAP IS " + overlapX + ", " + overlapY);

    if (overlapX < 1 || overlapY < 1) {
      return false;
    }

    //Set local coordinates:
    let origin1x, origin2x, origin1y, origin2y;
    if (island1.cornerGlobalX < island2.cornerGlobalX) {
      origin1x = island_surface_size - overlapX;
      origin2x = 0;
    }
    else {
      origin1x = 0;
      origin2x = island_surface_size - overlapX;
    }
    if (island1.cornerGlobalY < island2.cornerGlobalY) {
      origin1y = island_surface_size - overlapY;
      origin2y = 0;
    }
    else {
      origin1y = 0;
      origin2y = island_surface_size - overlapY;
    }

    //console.log("origin1x " + origin1x + ", origin2x " + origin2x + ", origin1y " + origin1y + ", origin2y " + origin2y);

    //Check for collisions within the overlap:
    for (let y = 0; y < overlapY; y++) {
      for (let x = 0; x < overlapX; x++) {
        //Now, keep in mind the y coordinate is reversed in the island
        //console.log("island1: " + (island_surface_size - y - origin1y - 1) + ", " + (x + origin1x));
        if (island1.terrain[island_surface_size - y - origin1y - 1][x + origin1x] != " ") {
          //There's something here in island 1.
          //console.log("island2: " + (island_surface_size - y - origin2y - 2) + ", " + (x + origin2x));
          if (island2.terrain[island_surface_size - y - origin2y - 1][x + origin2x] != " ") {
            //There's also something here in island 2!
            //Abort abort abort
            return true;
          }
        }
      }
    }
    return false;
  }

  let addIslandToLayer = function (island, layer) {
    let minX = island.cornerGlobalX - layer_global_cornerX;
    let minY = island.cornerGlobalY - layer_global_cornerY;

    //console.log("minX " + minX + " minY " + minY + " cornerGlobalX " + island.cornerGlobalX + " cornerGlobalY " + island.cornerGlobalY + " chunkGlobalX " + chunkGlobalX + " chunkGlobalY " + chunkGlobalY);
    //console.log("layer_global_cornerX " + layer_global_cornerX + " layer_global_cornerY " + layer_global_cornerY + " draw_distance_beyond_chunk " + draw_distance_beyond_chunk);

    for (let y = 0; y < island_surface_size; y++) {
      for (let x = 0; x < island_surface_size; x++) {
        //console.log("Will change layer at " + (minX + x) + ", " + (minY + y));
        let block = island.terrain[island_surface_size - y - 1][x];
        if (block != " ") {
          layer[minY + y][minX + x] = island.terrain[island_surface_size - y - 1][x];
        }
      }
    }
  }

  let extractChunkTerrain = function (layer) {
    // We generated a lot more than just this chunk. Though, only this chunk is reliable. Crop it out:
    let chunk_terrain = [];
    for (let y = 0; y < 256; y++) {
      chunk_terrain[y] = [];
      for (let x = 0; x < 256; x++) {
        chunk_terrain[y][x] = layer[y + draw_distance_beyond_chunk][x + draw_distance_beyond_chunk];
      }
    }
    return chunk_terrain;
  }

  let hrstart = process.hrtime();

  let islands = [];
  let tree_count = 0;
  let tree_collisions = 0;
  let island_positions = getIslandPositions();
  for (let i = 0; i < island_positions.length; i++) {
    let islandGlobalX = island_positions[i].x;
    let islandGlobalY = island_positions[i].y;
    let island_here = getIsland(islandGlobalX, islandGlobalY);
    tree_count += island_here.tree_count;
    tree_collisions += island_here.tree_collisions;
    islands.push(island_here);
  }
  //find all collisions
  let whos_bad = [];
  for (let i = 0; i < islands.length - 1; i++) {
    whos_bad[i] = false;
  }
  for (let i = 0; i < islands.length - 1; i++) {
    for (let j = i + 1; j < islands.length; j++) {
      if (checkIslandOverlap(islands[i], islands[j])) {
        //There was a collision. Both are bad.
        whos_bad[i] = true;
        whos_bad[j] = true;
      }
    }
  }

  let final_layer = getBlankTerrain(layer_size);
  let bad_counter = 0;

  //Merege all non-bad islands:
  for (let i = 0; i < islands.length - 1; i++) {
    if (!whos_bad[i]) {
      //console.log("about to add island " + i);
      addIslandToLayer(islands[i], final_layer);
    }
    else {
      bad_counter++;
    }
  }

  let extracted_chunk_terrain = extractChunkTerrain(final_layer);

  let hrend = process.hrtime(hrstart);
  if (silent == false || silent == undefined) {
    console.info("generated chunk %d, %d [%ds %dms, %d islands, %d island collisions, %d trees, %d tree collisions]",
      _chunkX,
      _chunkY,
      hrend[0], hrend[1] / 1000000,
      (islands.length - bad_counter),
      bad_counter,
      tree_count,
      tree_collisions
    );
  }
  return extracted_chunk_terrain;
};

exports.WorldGenerator = WorldGenerator;
