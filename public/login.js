/*
 * The login screen.
 * When the player logs in, a Game object is created.
 * When the player logs out, the Game object is disabled.
 *
 * This class also contains the logic for the registration "program".
 */

class Login{
  constructor(cli, guiterminal, socket, keys){
    this.cli = cli;
    this.guiterminal = guiterminal;
    this.keys = keys;
    this.inGame = false;
    this.socket = socket;
    this.socket.on('connect', data=>this.onSocketConnect(data, socket));
    this.socket.on('disconnect', data=>this.onSocketDisconnect(data, socket));
    this.socket.on('loginsuccess', data=>this.onSocketLoginSuccess(data, socket));
    this.socket.on('loginerror', data=>this.onSocketLoginError(data, socket));
  }

  onSocketConnect(data){
    this.welcome();
    this.login();
  }

  onSocketDisconnect(data){
    this.cli.abort();
    this.cli.println('disconnected.');
    this.inGame = false;
    this.gameStop();
  }

  onSocketLoginSuccess(data){
    console.log('login');
    console.log(data);
    this.cli.println('login successful');
    this.inGame = true;
    this.gameStart();
  }

  gameStart(){
    this.game = new Game(this.cli, this.guiterminal, this.socket, this.keys);
    this.game.active = true;
    this.gameTickInterval = setInterval(()=>this.game.gameTick(), 100);
  }

  gameStop(){

    if(this.gameTickInterval){
      clearInterval(this.gameTickInterval);
    }
    if(this.game){
      this.game.active = false;
      this.cli.abort();
    }
  }

  handleKeyDown(keyCode){
    if(this.game){
      this.game.handleKeyDown(keyCode);
    }
  }

  onSocketLoginError(data){
    this.cli.println(data.message);
    this.login();
  }

  focus(){
    // window focused
    if(this.inGame){
      this.game.focus();
    }
    else{
      this.cli.focus();
    }
  }

  blur(){
    // window unfocused
    this.cli.blur();
    if(this.game){
      this.game.blur();
    }
  }

  async login(){
    this.cli.abort(); // cancel existing prompt if one was open. This is more important.
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
    this.socket.emit('login', {
      username: loginName,
      password: loginPassword,
    });
  }

  welcome(){
    this.cli.println('');
    this.cli.println('');
    this.cli.println('AAGRINDER');
    this.cli.println('Welcome!');
    this.cli.println('try /register');
    this.cli.println('');
  }

  async cookies(){
    const agree = await this.cli.prompt('This site uses cookies for user session. agree? (y/n) ');
    if(agree[0] === 'y' || agree[0] === 'Y'){
      return true;
    }
    else{
      return false;
    }
  }

  async register(){
    const cookiesAgree = await this.cookies();
    if(!cookiesAgree){
      this.cli.println('cancelled.');
      return;
    }
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
