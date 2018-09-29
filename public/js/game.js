class Game{
  constructor(cli, guiterminal, socket, keys){
    this.socket = socket;
    this.cli = cli;
    this.player = new Player();
    this.map = new Map();
    this.syncher = new Syncher(this.map, this.player, this.socket);
    this.playerActions = new PlayerActions(this.player, this.map, this.syncher);
    this.syncher.addPlayerActionsRef(this.playerActions);
    this.gui = new Gui(guiterminal, this.map, this.player);
    this.focused = false;
    this.keys = keys;

    socket.on('t', onSocketTerrainUpdate);
    socket.on('chat', onSocketChat);
  }

  function onSocketTerrainUpdate(data){
    console.log('update');
    console.log(data);
    this.syncher.serverEvent(data);
  }

  function onSocketChat(data){
    this.cli.println(data.message);
  }

  start(){
    cli.blur();
  }

  gameTick(){
    // TODO: should check if gui is even focused
    const fullKeyStates = keys.getFullKeyStates();

    if(fullKeyStates[38] && !fullKeyStates[40]){ // ArrowUp without ArrowDown
      player.cursorUp();
    }
    if(fullKeyStates[40] && !fullKeyStates[38]){ // ArrowDown without ArrowUp
      player.cursorDown();
    }
    if(fullKeyStates[37] && !fullKeyStates[39]){ // ArrowLeft without ArrowRight
      player.cursorLeft();
    }
    if(fullKeyStates[39] && !fullKeyStates[37]){ // ArrowRight without ArrowLeft
      player.cursorRight();
    }
    if(fullKeyStates[87] && !fullKeyStates[83]){ // w without s
      playerActions.action('u', {});
    }
    if(fullKeyStates[65] && !fullKeyStates[68]){ // a without d
      playerActions.action('l', {});
    }
    if(fullKeyStates[83] && !fullKeyStates[87]){ // s without w
      playerActions.action('d', {});
    }
    if(fullKeyStates[68] && !fullKeyStates[65]){ // d without a
      playerActions.action('r', {});
    }
    if(fullKeyStates[8] || fullKeyStates[16]){ // Backspace or Shift
      playerActions.action('D', {
        x: player.cursorx,
        y: player.cursory,
        r: true,
      });
    }
    if(fullKeyStates[32]){ // Space
      playerActions.action('P', {
        x: player.cursorx,
        y: player.cursory,
        r: true,
      });
    }
  }

  this.gui.redisplay();
}

        // if(result.length > 0){
        //   if(/^ *\//.test(result)){
        //     // command
        //
        //
        //   }
        //   else{
        //     // chat
        //
        //     socket.emit('chat', {message: result});
        //   }
        //   cli.promptCommand('> ');
        // }
        // else{
        //   cli.promptCommand('> ', true); // silent, which means no autoscroll
        // }
        //
        //
        // focusGui();
