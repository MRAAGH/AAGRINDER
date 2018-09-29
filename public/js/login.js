class Login{
  constructor(cli, game){
    this.cli = cli;
    this.game = game;
    this.socket = io();
    this.socket.on('connect', this.onSocketConnect);
    this.socket.on('disconnect', this.onSocketDisconnect);
    this.socket.on('loginsuccess', this.onSocketLoginSuccess);
    this.socket.on('loginerror', this.onSocketLoginError);
  }

  onSocketConnect(data){
    login();
  }

  function onSocketDisconnect(data){
    this.cli.abort();
    this.cli.println('disconnected.');
  }

  function onSocketLoginSuccess(data){
    // TODO: all of the following should be inside game.js/Game/start()
    console.log('login');
    console.log(data);
    this.cli.println('login successful');
    this.cli.promptCommand('> ');
    console.log(data)
    this.game.player.color = data.color; // TODO: this should be in terrain updates anyway to begin with
    this.game.start();
  }

  function onSocketLoginError(data){
    bigterminal.println(data.message);
  }

  async login(){

    welcome();
    let nameChosen = false;
    let loginName;
    while(!nameChosen){
      loginName = await this.cli.prompt('login: ');
      if(loginName === '/r' || loginName === '/register'){
        await this.register();
        continue;
      }
      const responseName = await this.ajaxVerifyUsername(loginName);
      // result must be "Username taken"
      if(responseName.message !== "Username taken"){
        this.cli.println("user \""+loginName+"\" does not exist")
        continue;
      }
      nameChosen = true;
    }
    const loginPassword = await this.cli.promptPassword('password for '+loginName+': ');

    // try to login
    socket.emit('login', {
      username: loginName,
      password: loginPassword,
    });





  }

  welcome(){
    bigterminal.println('');
    bigterminal.println('');
    bigterminal.println('AAGRINDER');
    bigterminal.println('Welcome!');
    bigterminal.println('try /register');
    bigterminal.println('');
  }

  async register(){
    const registerName = await this.cli.prompt('new name: ');
    const responseName = await this.ajaxVerifyUsername(registerName);
    console.log(responseName);
    if(!responseName.success){
      this.cli.println(responseName.message);
      return;
    }
    const registerPassword = await this.cli.promptPassword('choose password: ');
    const registerPassword2 = await this.cli.promptPassword('repeat password: ');
    if(registerPassword !== registerPassword2){
      this.cli.println('passwords do not match.');
      return;
    }
    const rawColor = await this.cli.prompt('what is your favorite color? ');
    const registerColor = parseColor(rawColor);
    if(rawColor !== registerColor){
      const rawOk = await this.cli.prompt('recognized as '+registerColor+'. Is this okay? (yes) ', true);
      const registerOk = rawOk === '' || rawOk[0] === 'y' || rawOk[0] == 'Y';
      if(!registerOk){
        this.cli.println('cancelled.');
        return;
      }
    }
    this.cli.println('requesting new user');
    const response = await this.ajaxRegister(registerName, registerPassword, registerColor);
    console.log(response);
    this.cli.println(response.message);
  }

  async ajaxVerifyUsername(name){
    const rawdata = {
      name: name,
    };
    const url = '/api/users/checkname';
    return this.ajax(rawdata, url);
  }

  async ajaxRegister(name, password, color){
    const rawdata = {
      name: name,
      password: password,
      color: color,
    };
    const url = '/api/users/register';
    return this.ajax(rawdata, url);
  }

  async ajax(rawdata, url){
    let data = '';
    for(const property of Object.getOwnPropertyNames(rawdata)){
      data += '&'+property+'='+encodeURIComponent(rawdata[property]);
    }
    data = data.substring(1);

    let response;

    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      processData: false,
      success: msg=>response = msg,
      async: false,
    });

    return response;

  }


}
