class Game{
  constructor(cli, guiterminal, socket, keys){
    this.socket = socket;
    this.cli = cli;
    this.player = new Player();
    this.map = new Map();
    this.syncher = new Syncher(this.map, this.player, this.socket);
    this.playerActions = new PlayerActions(this.player, this.map, this.syncher);
    this.syncher.addPlayerActionsRef(this.playerActions);
    this.guiterminal = guiterminal;
    this.gui = new Gui(guiterminal, this.map, this.player);
    this.focused = false;
    this.active = false;
    this.inChatbox = false;
    this.justFinishedChatbox = false;
    this.keys = keys;

    this.lmb = false;
    this.rmb = false;

    this.socket.on('t', data=>this.onSocketTerrainUpdate(data, socket));
    this.socket.on('chat', data=>this.onSocketChat(data, socket));

    window.addEventListener('mousemove', e=>this.handleMouse(e), false);
    window.addEventListener('mousedown', e=>this.handleMouseDown(e), false);
    window.addEventListener('mouseup', e=>this.handleMouseUp(e), false);
  }

  onSocketTerrainUpdate(data){
    console.log('update');
    console.log(data);
    this.syncher.serverEvent(data);
  }

  onSocketChat(data){
    if(this.active){
      this.cli.println(data.message);
    }
  }

  async chatboxLoop(){
    while(true){
      const typed = await this.cli.promptCommand('> ');
      if(/^ *\//.test(typed)){
        // is a command
        this.executeCommand(typed);
      }
      else{
        // is chat
        this.socket.emit('chat', {message: typed});
      }
      // stop focusing the cli
      this.inChatbox = false;
      this.cli.blur();
      this.cli.pause();
      this.justFinishedChatbox = true;
    }
  }

  executeCommand(command){
    //TODO: commands should probably do something ;)
  }

  start(){
    this.active = true;
    this.focused = true;
    this.inChatbox = false;
    this.justFinishedChatbox = false;
    this.chatboxLoop();
  }

  stop(){
    this.active = false;
    this.cli.abort();
  }

  focus(){
    // window focused
    if(this.inChatbox){
      this.cli.focus();
    }
    else{
      this.gui.focus();
    }
  }

  blur(){
    // window unfocused
    this.gui.blur();
    this.cli.blur();
  }

  gameTick(){
    // TODO: slash also enters the chatbox and types a slash

    const fullKeyStates = this.keys.getFullKeyStates();
    this.keys.clearFresh();

    if(!this.active){
      return;
    }



    if(this.inChatbox){
      if(fullKeyStates[27]){ // escape
        this.inChatbox = false;
        this.cli.blur();
        this.cli.pause();
      }
      return;
    }

    if(!this.justFinishedChatbox){
      if(fullKeyStates[13]){ // Enter
        this.inChatbox = true;
        this.cli.focus();
        this.cli.unpause();
      }
    }
    this.justFinishedChatbox = false;

    if(fullKeyStates[38] && !fullKeyStates[40]
    || fullKeyStates[75] && !fullKeyStates[74]){
      // ArrowUp without ArrowDown or k without j
      this.player.cursorUp();
    }
    if(fullKeyStates[40] && !fullKeyStates[38]
    || fullKeyStates[74] && !fullKeyStates[75]){
      // ArrowDown without ArrowUp or j without k
      this.player.cursorDown();
    }
    if(fullKeyStates[37] && !fullKeyStates[39]
    || fullKeyStates[72] && !fullKeyStates[76]){
      // ArrowLeft without ArrowRight or h without l
      this.player.cursorLeft();
    }
    if(fullKeyStates[39] && !fullKeyStates[37]
    || fullKeyStates[76] && !fullKeyStates[72]){ 
      // ArrowRight without ArrowLeft or l without h
      this.player.cursorRight();
    }
    if(fullKeyStates[87] && !fullKeyStates[83]){ // w without s
      this.playerActions.action('u', {});
    }
    if(fullKeyStates[65] && !fullKeyStates[68]){ // a without d
      this.playerActions.action('l', {});
    }
    if(fullKeyStates[83] && !fullKeyStates[87]){ // s without w
      this.playerActions.action('d', {});
    }
    if(fullKeyStates[68] && !fullKeyStates[65]){ // d without a
      this.playerActions.action('r', {});
    }
    if(fullKeyStates[8] || fullKeyStates[16] || this.lmb){ // Backspace or Shift
      this.playerActions.action('D', {
        x: this.player.cursorx,
        y: this.player.cursory,
        r: true,
      });
    }
    if(fullKeyStates[32] || this.rmb){ // Space
      this.playerActions.action('P', {
        x: this.player.cursorx,
        y: this.player.cursory,
        r: true,
      });
    }
    this.gui.display();
  }

  handleMouse(e){
    const xy = this.guiterminal.pixelToChar(e.clientX, e.clientY);
    this.player.cursorSet(xy.x, xy.y);
  }

  handleMouseDown(e){
    switch(e.buttons){
      case 1:
        this.lmb = true;
        break;
      case 2:
        this.rmb = true;
      case 3:
        this.lmb = true;
        this.rmb = true;
    }
  }

  handleMouseUp(e){
    this.lmb = false;
    this.rmb = false;
    switch(e.buttons){
      case 1:
        this.lmb = true;
        break;
      case 2:
        this.rmb = true;
      case 3:
        this.lmb = true;
        this.rmb = true;
    }
  }
}
