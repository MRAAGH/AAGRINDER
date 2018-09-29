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
    this.active = false;
    this.inChatbox = false;
    this.keys = keys;

    this.socket.on('t', data=>this.onSocketTerrainUpdate(data, socket));
    this.socket.on('chat', data=>this.onSocketChat(data, socket));
  }

  onSocketTerrainUpdate(data){
    console.log('update');
    console.log(data);
    this.syncher.serverEvent(data);
  }

  onSocketChat(data){
    if(this.enabled){
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
    }
  }

  executeCommand(command){
    //TODO: commands should probably do something ;)
  }

  start(){
    this.active = true;
    this.focused = true;
    this.inChatbox = false;
    this.chatboxLoop();
  }

  stop(){
    this.active = false;
    this.cli.abort();
  }

  focus(){
    // window focused
    if(this.inChatbox){
      this.chatbox.focus();
    }
    else{
      this.gui.focus();
    }
  }

  blur(){
    // window unfocused
    this.gui.blur();
    this.chatbox.blur();
  }

  gameTick(){
    // TODO: enter enters the chatbox, and slash too

    if(!this.active){
      return;
    }
    if(this.inChatbox){
      return;
    }

    const fullKeyStates = this.keys.getFullKeyStates();
    this.keys.clearFresh();

    if(fullKeyStates[38] && !fullKeyStates[40]){ // ArrowUp without ArrowDown
      this.player.cursorUp();
    }
    if(fullKeyStates[40] && !fullKeyStates[38]){ // ArrowDown without ArrowUp
      this.player.cursorDown();
    }
    if(fullKeyStates[37] && !fullKeyStates[39]){ // ArrowLeft without ArrowRight
      this.player.cursorLeft();
    }
    if(fullKeyStates[39] && !fullKeyStates[37]){ // ArrowRight without ArrowLeft
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
    if(fullKeyStates[8] || fullKeyStates[16]){ // Backspace or Shift
      this.playerActions.action('D', {
        x: this.player.cursorx,
        y: this.player.cursory,
        r: true,
      });
    }
    if(fullKeyStates[32]){ // Space
      this.playerActions.action('P', {
        x: this.player.cursorx,
        y: this.player.cursory,
        r: true,
      });
    }
    this.gui.display();
  }
}
