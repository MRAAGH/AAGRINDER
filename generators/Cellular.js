
let MersenneTwister = require('mersenne-twister');

let Cellular = function (_SEED, _terrain, _first_frontier, _guide_function, _spread_list, _preserve_frontier, _frontier_count, _block, _replace_block, _temp_block) {
  let generator = new MersenneTwister(_SEED);
  let terrain = _terrain;
  let H = _terrain.length;
  let first_frontier = _first_frontier;
  let guide_function = _guide_function;
  let spread_list = _spread_list;
  let preserve_frontier = _preserve_frontier;
  let frontier_count = _frontier_count;
  let block = _block;
  let replace_block = _replace_block;
  let temp_block = _temp_block;
  let frontier = [];

  let GENERATE = function () {
    firstFrontier();
    frontiers_done = 0;
    for (let frontiers_left = frontier_count - 1; frontiers_left >= 0; frontiers_left--) {
      nextFrontier(frontiers_done, frontiers_left);
      frontiers_done++;
    }
    killFrontier();
  };

  let firstFrontier = function () {
    for (let i = 0; i < first_frontier.length; i++) {
      addToFrontier(first_frontier[i].x, first_frontier[i].y);
    }
  };

  let nextFrontier = function (frontiers_done, frontiers_left) {
    let previous_frontier = frontier;
    frontier = [];
    for (let i = 0; i < previous_frontier.length; i++) {
      let x = previous_frontier[i].x;
      let y = previous_frontier[i].y;

      let checkRelative = function (relative_x, relative_y) {
        return c(x + relative_x, y + relative_y, block);
      }

      //Decide whether to create a block here:
      let chance = guide_function(checkRelative, frontiers_done, frontiers_left);
      if (generator.random() < chance) {
        //Yes!
        terrain[y][x] = block;
        for (let j = 0; j < spread_list.length; j++) {
          addToFrontier(x + spread_list[j].x, y + spread_list[j].y);
        }
      }
      else {
        if (preserve_frontier) {
          //Keep for next frontier
          frontier.push(previous_frontier[i]);
        }
        else {
          //No, abandon.
          terrain[y][x] = replace_block;
        }
      }
    }
  };

  let addToFrontier = function (x, y) {
    if (c(x, y, replace_block)) {
      terrain[y][x] = temp_block;
      frontier.push({ x: x, y: y });
    }
  };

  let killFrontier = function () {
    for (let i = 0; i < frontier.length; i++) {
      terrain[frontier[i].y][frontier[i].x] = replace_block;
    }
  };

  let c = function (x, y, searched, _default = false) {
    if (x < 0 || x > H || y < 0 || y > H) {
      return _default;
    }
    return terrain[y][x] == searched;
  };

  GENERATE();

  return {
    final_frontier: frontier
  }
}

exports.Cellular = Cellular;