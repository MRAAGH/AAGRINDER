class Chatbox{
  constructor(cli, socket){
    this.cli = cli;
    this.socket = socket;
    this.socket.on('chat', data=>this.onSocketChat(data, socket));
    this.enabled = false;
  }

  onSocketChat(data){
    if(this.enabled){
      this.cli.println(data.message);
    }
  }

  focus(){
    this.cli.focus();
  }

  blur(){
    this.cli.blur();
  }

  enable(){
    this.enabled = true;
    // TODO: do the prompt
  }

  disable(){
    this.enabled = false;
    // TODO: disable prompt
  }
}
