

let Flying = function (
  _centralizedBlockAt,
  _centralizedSetBlock,
  _online_chunk_players,
  _plant_list,
  _removePlantAt,
  _interactX,
  _interactY,
  _interacting_player
) {

  let blocks_per_engine = 20;

  let centralizedBlockAt = _centralizedBlockAt;
  let centralizedSetBlock = _centralizedSetBlock;
  let online_chunk_players = _online_chunk_players;
  let plant_list = _plant_list;
  let removePlantAt = _removePlantAt;
  let interactX = _interactX;
  let interactY = _interactY;
  let interacting_player = _interacting_player;

  let clicked_block = centralizedBlockAt(interactX, interactY);
  if (clicked_block != "O") {
    return false;
  }

  let geometry_engine = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
  let geometry_engine_wiring = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
  let geometry_wiring = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }];
  let geometry_segment = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];

  let wiring_temp_layer = []; //wires are marked here to ignore loops in DFS
  let engine_temp_layer = []; //engines are marked here or several reasons. They are marked with the cluster index.

  let engine_clusters = [];

  let engine_cluster = function (_source_engine, _direction, _id) {
    let source_engine = _source_engine;
    let engine_count = 0;
    let direction = _direction;
    let id = _id;

    return {
      source_engine: source_engine,
      engine_count: engine_count,
      direction: direction,
      id: id,
      discover_segment: discover_segment
    }
  }


  //DISCOVER WIRING

  let engineDFS = function (x, y, cluster) {
    if (engine_temp_layer[y] == undefined) {
      engine_temp_layer[y] = [];
    }
    engine_temp_layer[y][x] = cluster.id; //Mark as visited and part of this cluster
    cluster.engine_count++;
    for (let direction = 0; direction < geometry_engine.length; direction++) {
      let other_x = x + geometry_engine[direction].x;
      let other_y = y + geometry_engine[direction].y;
      //Is there another engine next to this one?
      if ((engine_temp_layer[other_y] == undefined || engine_temp_layer[other_y][other_x] == undefined)
        && centralizedBlockAt(other_x, other_y) == "M") {
        engineDFS(other_x, other_y, cluster);
      }
    }
  };
  let wiringDFS = function (x, y) {
    if (wiring_temp_layer[y] == undefined) {
      wiring_temp_layer[y] = [];
    }
    wiring_temp_layer[y][x] = true; //Mark as visited
    //Adjacent engines:
    for (let direction = 0; direction < geometry_engine_wiring.length; direction++) {
      let other_x = x + geometry_engine_wiring[direction].x;
      let other_y = y + geometry_engine_wiring[direction].y;
      let block_there = centralizedBlockAt(other_x, other_y);
      //Test for engine:
      if (block_there == "M") {
        //is it already part of a cluster?
        if (engine_temp_layer[other_y] != undefined && engine_temp_layer[other_y][other_x] != undefined) {
          if (engine_clusters[engine_temp_layer[other_y][other_x]].direction != direction) {
            //Wrong direction. One cluster can't go in several directions at once!
            throw "bad_cluster";
          }
          //Otherwise, do nothing. Powering the same cluster in several places is allowed, but useless.
        }
        else {
          //No, this is a new engine. Let's make a cluster.
          let the_cluster = new engine_cluster({ x: other_x, y: other_y }, direction, engine_clusters.length);
          engineDFS(other_x, other_y, the_cluster);
          engine_clusters.push(the_cluster);
        }
      }
    }
    //Spread to adjacent wires:
    for (let direction = 0; direction < geometry_wiring.length; direction++) {
      let other_x = x + geometry_wiring[direction].x;
      let other_y = y + geometry_wiring[direction].y;
      let block_there = centralizedBlockAt(other_x, other_y);
      if ((wiring_temp_layer[other_y] == undefined || wiring_temp_layer[other_y][other_x] == undefined)
        && block_there == "+") {
        wiringDFS(other_x, other_y);
      }
    }
  };
  try {
    wiringDFS(interactX, interactY);
  }
  catch (err) {
    //console.log(err);
    return false;
  }
  //wiringDFS was successful.
  if (engine_clusters.length < 1) {
    return false; //No engines found.
  }


  //DISCOVER SEGMENTS

  let discover_segment = function (the_engine_cluster) {

    let source_engine = the_engine_cluster.source_engine;
    let engine_count = the_engine_cluster.engine_count;
    let direction = the_engine_cluster.direction;
    let flight_direction = the_engine_cluster.direction;
    let id = the_engine_cluster.id;

    //console.log("source_engine " + source_engine + " engine_count " + direction + " direction " + id + " id");
    let block_limit = blocks_per_engine * engine_count;
    //console.log("block_limit " + block_limit + " blocks_per_engine " + blocks_per_engine + " engine_count " + engine_count)
    let segment_temp_layer = [];
    let minX = source_engine.x;
    let minY = source_engine.y;
    let maxX = source_engine.x;
    let maxY = source_engine.y;
    let block_count = 0;
    let moving_plants = [];
    let moving_players = [];
    let moving_grinders = [];

    let segmentDFS = function (x, y) {
      //console.log("SEG DFS");
      let mah_block = centralizedBlockAt(x, y);
      if (segment_temp_layer[y] == undefined) {
        segment_temp_layer[y] = [];
      }
      segment_temp_layer[y][x] = mah_block;
      block_count++;
      if (block_count > block_limit) {
        throw "block_limit_exceeded";
      }
      if (mah_block == "T") {
        moving_plants.push({ x: x, y: y });
      }
      else if (mah_block == "P") {
        moving_players.push({ x: x, y: y });
      }
      else if (mah_block == "G") {
        moving_grinders.push({ x: x, y: y });
      }
      //Spread to adjacent blocks:
      for (let direction = 0; direction < geometry_segment.length; direction++) {
        let other_x = x + geometry_segment[direction].x;
        let other_y = y + geometry_segment[direction].y;
        let other_block = centralizedBlockAt(other_x, other_y);

        if ((segment_temp_layer[other_y] == undefined || segment_temp_layer[other_y][other_x] == undefined)
          && other_block != " ") {
          if (direction != flight_direction
            && mah_block == "+" && other_block == "+") {
            //Not spreading from wire to wire onless it's in the flight direction
            //console.log("BAD SPREAD")
            continue;
          }
          if (other_block == "M"
            && engine_temp_layer[other_y] != undefined
            && engine_temp_layer[other_y][other_x] != id) {
            //Activating two connected engine clusters at once is not allowed. Yet. Not sure what it'd do.
            throw "clusters_linked";
          }
          else {
            //console.log("GONE "+direction+"!");
            //OPTIMIZE: no need for checking all directions
            if (other_x > maxX) {
              maxX = other_x;
            }
            if (other_y > maxY) {
              maxY = other_y;
            }
            if (other_x < minX) {
              minX = other_x;
            }
            if (other_y < minY) {
              minY = other_y;
            }
            segmentDFS(other_x, other_y);
          }
        }
      }
    };

    try {
      segmentDFS(source_engine.x, source_engine.y);
    }
    catch (err) {
      //console.log(err);
      return { ok: false };
    }

    //console.log(minX + " " + maxX + " " + minY + " " + maxY + " " + block_count);
    //segmentDFS was successful.

    let can_move = function () {
      let mod_x = geometry_segment[direction].x;
      let mod_y = geometry_segment[direction].y;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (segment_temp_layer[y] != undefined && segment_temp_layer[y][x] != undefined) {
            //alright there's a moving block here
            if (segment_temp_layer[y + mod_y] == undefined || segment_temp_layer[y + mod_y][x + mod_x] == undefined) {
              //and there's NOT another moving block in front of it
              if (centralizedBlockAt(x + mod_x, y + mod_y) != " ") {
                //But there is a nonmoving block instead! Can't move! Abort!
                return false;
              }
            }
          }
        }
      }
      return true;
    };

    let apply_movement = function () {
      let mod_x = geometry_segment[direction].x;
      let mod_y = geometry_segment[direction].y;
      let left_mod_x = geometry_segment[(direction + 1) % 4].x;
      let left_mod_y = geometry_segment[(direction + 1) % 4].y;
      let right_mod_x = geometry_segment[(direction + 3) % 4].x;
      let right_mod_y = geometry_segment[(direction + 3) % 4].y;


      //Plant movement:
      for (let i = 0; i < moving_plants.length; i++) {
        for (let j = 0; j < plant_list.length; j++) {
          if (plant_list[j].x == moving_plants[i].x && plant_list[j].y == moving_plants[i].y) {
            plant_list[j].x += mod_x;
            plant_list[j].y += mod_y;//WARN: going beyond chunk is not handled
          }
        }
      }

      //Player movement:
      for (let i = 0; i < moving_players.length; i++) {
        for (let j = 0; j < online_chunk_players.length; j++) {
          if (online_chunk_players[j].subchunkX == moving_players[i].x && online_chunk_players[j].subchunkY == moving_players[i].y) {
            online_chunk_players[j].subchunkX += mod_x;
            online_chunk_players[j].subchunkY += mod_y;//WARN: going beyond chunk is not handled
          }
        }
      }

      let collect = function (x, y) {
        //Can't dig part of machine:
        if (segment_temp_layer[y] != undefined && segment_temp_layer[y][x] != undefined) {
          return;
        }
        let mah_block = centralizedBlockAt(x, y);
        //Can't dig air:
        if (mah_block == " ") {
          return;
        }
        //Can't dig player:
        if (mah_block == "P") {
          return;
        }
        //Can't dig bellow player:
        if (centralizedBlockAt(x, y - 1) == "P") {
          return;
        }
        //Alright, dig.
        centralizedSetBlock(x, y, " ");
        //And collect.
        let block_code = interacting_player.inventory.block2blockCode(mah_block);
        interacting_player.inventory.earnBlock(block_code);
        //Also, plant stuff
        if (mah_block == "T") {
          removePlantAt(x, y);
        }
      }

      //Grinder movement:
      for (let i = 0; i < moving_grinders.length; i++) {
        let x = moving_grinders[i].x;
        let y = moving_grinders[i].y;
        //Front
        collect(x + mod_x + mod_x, y + mod_y + mod_y);
        //Left
        collect(x + mod_x + left_mod_x, y + mod_y + left_mod_y);
        //Right
        collect(x + mod_x + right_mod_x, y + mod_y + right_mod_y);
      }

      //Destroy flying machine:
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          //console.log("Testing " + x + ", " + y);
          if (segment_temp_layer[y] != undefined && segment_temp_layer[y][x] != undefined) {
            //console.log("destroying!");
            centralizedSetBlock(x, y, " ");
          }
        }
      }

      //Rebuild flying machine:
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (segment_temp_layer[y] != undefined && segment_temp_layer[y][x] != undefined) {
            centralizedSetBlock(x + mod_x, y + mod_y, segment_temp_layer[y][x]);
          }
        }
      }
    };

    return {
      ok: true,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      block_count: block_count,
      moving_plants: moving_plants,
      moving_players: moving_players,
      moving_grinders: moving_grinders,
      can_move: can_move,
      apply_movement: apply_movement,
      direction: direction
    }
  };

  let segments = [];
  for (let cluster_index = 0; cluster_index < engine_clusters.length; cluster_index++) {
    //console.log(JSON.stringify(engine_clusters[cluster_index]));
    let the_segment = discover_segment(engine_clusters[cluster_index]);
    if (!the_segment.ok) return false;
    segments.push(the_segment);
  }


  //APPLY MOVEMENT (if possible)

  for (let segment_index = 0; segment_index < segments.length; segment_index++) {
    //check if movement is possible
    //(can be blocked by another flying machine or wire-wire link at the front)
    if (segments[segment_index].can_move()) {
      //move
      segments[segment_index].apply_movement();
    }
  }

  //console.log("dun");
  return true;
}

exports.Flying = Flying;