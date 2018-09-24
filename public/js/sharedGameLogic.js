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
    view.setBlock(0, 0, ' ');
    view.setBlock(0-1, 0, view.player.playerBlock());
    view.movePlayerX(-1);
  },
  'r':(view, data)=>{
    view.setBlock(0, 0, ' ');
    view.setBlock(0+1, 0, view.player.playerBlock());
    view.movePlayerX(1);
  },
  'd':(view, data)=>{
    view.setBlock(0, 0, ' ');
    view.setBlock(0, 0-1, view.player.playerBlock());
    view.movePlayerY(-1);
  },
  'u':(view, data)=>{
    view.setBlock(0, 0, ' ');
    view.setBlock(0, 0+1, view.player.playerBlock());
    view.movePlayerY(1);
  },
  'D':(view, data)=>{
    let x, y;
    if(data.r){
      x = 0 + data.x;
      y = 0 + data.y;
    }
    else{
      x = data.x;
      y = data.y;
    }
    if(Math.abs(0 - x) > view.player.reach
    || Math.abs(0 - y) > view.player.reach){
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
      x = 0 + data.x;
      y = 0 + data.y;
    }
    else{
      x = data.x;
      y = data.y;
    }
    if(Math.abs(0 - x) > view.player.reach
    || Math.abs(0 - y) > view.player.reach){
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
  'p':(view, data)=>{
    // this one doesn't do anything
  }
};
