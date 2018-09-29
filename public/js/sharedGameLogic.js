/*
High-level description of the game logic triggered by clients
that also applies to the server.

The abstraction here is the view, allowing the same interface
on the client and on the server.
The view is part of the Syncher and makes sure changes do not
interfere with client-server synchronization.

This same file is used by both the server and the client.
*/

sharedActionFunctions = {
  'l':(view, data)=>{
    view.setBlock(view.player.x, view.player.y, ' ');
    view.setBlock(view.player.x-1, view.player.y, view.player.playerBlock());
    view.movePlayerX(-1);
  },
  'r':(view, data)=>{
    view.setBlock(view.player.x, view.player.y, ' ');
    view.setBlock(view.player.x+1, view.player.y, view.player.playerBlock());
    view.movePlayerX(1);
  },
  'd':(view, data)=>{
    view.setBlock(view.player.x, view.player.y, ' ');
    view.setBlock(view.player.x, view.player.y-1, view.player.playerBlock());
    view.movePlayerY(-1);
  },
  'u':(view, data)=>{
    view.setBlock(view.player.x, view.player.y, ' ');
    view.setBlock(view.player.x, view.player.y+1, view.player.playerBlock());
    view.movePlayerY(1);
  },
  'D':(view, data)=>{
    let x, y;
    if(data.r){
      x = view.player.x + data.x;
      y = view.player.y + data.y;
    }
    else{
      x = data.x;
      y = data.y;
    }
    if(Math.abs(view.player.x - x) > view.player.reach
    || Math.abs(view.player.y - y) > view.player.reach){
      // should not be able to reach!
      console.log('dlel')
      view.reject();
      return;
    }
    // must be a diggable block
    const dug = view.getBlock(x, y);
    if(dug === ' ' || dug.substr(0, 1) === 'P'){
      console.log('doof')
      view.reject();
      return;
    }
    // ok dig it
    view.setBlock(x, y, ' ');
    // TODO: should probably add it to the inventory ;)
  },
  'P':(view, data)=>{
    let x, y;
    if(data.r){
      x = view.player.x + data.x;
      y = view.player.y + data.y;
    }
    else{
      x = data.x;
      y = data.y;
    }
    if(Math.abs(view.player.x - x) > view.player.reach
    || Math.abs(view.player.y - y) > view.player.reach){
      console.log('plel')
      // should not be able to reach!
      view.reject();
      return;
    }
    // must be an empty space
    const space = view.getBlock(x, y);
    if(space !== ' '){
      console.log('poof')
      view.reject();
      return;
    }
    // ok place here
    view.setBlock(x, y, 'B');
    // TODO: should probably add it to the inventory ;)
  },
};
