// Wrapper for bigterminal.
// Adds a static and editable part to the dynamic line.
// Adds edit controls
// Adds command history
// Adds a mode with asterisks only (for passwords)

class Cli {
  constructor(bigterminal){
    this.bigterminal = bigterminal;
    this.static = '';
    this.editable = '';
    this.enabled = false; // whether we are allowing the user to type and cursor blinking
    this.focused = true; // another condition for cursor blinking
    this.asterisks = false; // whether we are hiding the typed characters
    this.isCommand = false; // whether we are adding it to command history
    this.commandBackup = '';
    this.history = [];
    this.historyPos = 0;
    this.editPos = 0;
    this.cursorOn = false;
    this.pendingGetlineCallback = undefined;
  }

  println(line){
    this.bigterminal.println(line);
  }

  focus(){
    this.focused = true;
    this.cursorOn = false;
    this.display(true);
  }

  blur(){
    this.focused = false;
    this.cursorOn = false;
    this.display(true);
  }

  blink(){
    if (this.cursorOn){
      this.cursorOn = false;
      this.display(true); //silent
    }
    else{
      // only blink if enabled:
      if(this.enabled && this.focused){
        this.cursorOn = true;
        this.display(true); // silent
      }
    }
  }

  // prompt, aka enable
  async prompt(content, allowEmpty = false){ // prompt the user to input something (and display static content)
    this.static = content;
    this.editable = '';
    this.enabled = true;
    this.isCommand = false;
    this.asterisks = false;
    this.editPos = 0;
    this.display();
    if(allowEmpty){
      return await this.getLine();
    }
    else{
      return await this.getNonemptyLine();
    }
  }

  async promptCommand(content, silent){ // gets added to command history
    this.static = content;
    this.editable = '';
    this.enabled = false; // command prompt does not automatically enable. TODO: there is probably a better solution for this rather than hardcoding it in here.
    this.isCommand = true;
    this.asterisks = false;
    this.editPos = 0;
    if(!silent) this.display();
    return await this.getNonemptyLine();
  }

  async promptPassword(content){ // not visible on screen
    this.static = content;
    this.editable = '';
    this.enabled = true;
    this.isCommand = false;
    this.asterisks = true;
    this.editPos = 0;
    this.display();
    return await this.getNonemptyLine();
  }

  toAsterisks(line){
    let ast = '';
    for(let i = 0; i < line.length; i++){
      ast += '*';
    }
    return ast;
  }

  display(silent){
    let displayedEditable = this.asterisks ? this.toAsterisks(this.editable) : this.editable;

    if(this.cursorOn){
      let left = displayedEditable.slice(0, this.editPos);
      let right = displayedEditable.slice(this.editPos + 1, displayedEditable.length);
      displayedEditable = left + '█' + right;
    }

    this.bigterminal.modify(this.static + displayedEditable, silent);
  }

  // commit, aka apply and disable
  commit(){ // turn the currently typed text into a "command"
    let wasCommited = this.editable;
    if(this.asterisks){
      // hide them
      this.editable = '';
    }

    if(this.isCommand){
      // add to command history (if it makes sense)
      if(this.editable !== ''){
        if(this.history.length === 0 || this.editable !== this.history[this.history.length - 1]){
          // it's no dupe.
          // then it makes sense to add this to history.
          this.history.push(this.editable);
        }
      }
    }
    else{
      // not a command. Let's display it on screen I guess
      this.cursorOn = false;
      this.display();
      this.bigterminal.commit();
    }

    // jump to the end of history
    this.historyPos = this.history.length;

    if(!(this.isCommand && this.editable === '')){
      this.static = '';
      this.editable = '';
      this.display();
    }
    this.enabled = false;
    this.isCommand = false;
    this.asterisks = false;
    return wasCommited;
  }

  handleKey(key){
    if(!this.enabled){
      return false;
    }
    if(key.length !== 1){

      // It is not a simple key, such as 'A' or '~'

      switch(key){
      case 'Backspace':
        this.backspace();
        break;

      case 'PageUp':
        this.bigterminal.scrollUp();
        break;

      case 'PageDown':
        this.bigterminal.scrollDown();
        break;

      case 'Home':
        this.home();
        break;

      case 'End':
        this.end();
        // this.bigterminal.scrollToEnd();
        break;

      case 'ArrowUp':
        this.up();
        break;

      case 'ArrowDown':
        this.down();
        break;

      case 'ArrowLeft':
        this.left();
        break;

      case 'ArrowRight':
        this.right();
        break;

      case 'Enter':
        let result = this.commit();
        if(this.pendingGetlineCallback){
          this.pendingGetlineCallback(true, result);
        }
        return result;
      default:
        console.log('ignored key: ' + key);
      }
      // whatever it was, it is not going to be typed.
      return false;
    }
    // type this:
    let left = this.editable.slice(0, this.editPos);
    let right = this.editable.slice(this.editPos, this.editable.length);
    this.editable = left + key + right;
    this.editPos++;
    this.cursorOn = true;
    this.display();
    return false;
  }

  backspace(){
    if(this.editPos > 0){
      let left = this.editable.slice(0, this.editPos - 1);
      let right = this.editable.slice(this.editPos, this.editable.length);
      this.editable = left + right;
      this.editPos--;
      this.cursorOn = true;
      this.display();
    }
  }

  left(){
    if(this.editPos > 0){
      this.editPos--;
      this.cursorOn = true;
      this.display();
    }
  }

  right(){
    if(this.editPos < this.editable.length){
      this.editPos++;
      this.cursorOn = true;
      this.display();
    }
  }

  home(){
    this.editPos = 0;
    this.cursorOn = true;
    this.display();
  }

  end(){
    this.editPos = this.editable.length;
    this.cursorOn = true;
    this.display();
  }

  up(){
    if(!this.isCommand){
      // history makes no sense atm
      return;
    }
    if(this.historyPos === 0){
      // nothing is up
      return;
    }
    if(this.historyPos === this.history.length){
      // we are at the current command. Back it up.
      this.commandBackup = this.editable;
    }
    this.historyPos--;
    this.editable = this.history[this.historyPos];
    this.editPos = this.editable.length;
    this.display();
  }

  down(){
    if(!this.isCommand){
      // history makes no sense atm
      return;
    }
    if(this.historyPos === this.history.length){
      // nothing is down
      return;
    }
    this.historyPos++;
    if(this.historyPos == this.history.length){
      // this is the current command
      this.editable = this.commandBackup;
    }
    else{
      this.editable = this.history[this.historyPos];
    }
    this.editPos = this.editable.length;
    this.display();
  }

  getLine(){
    return new Promise((resolve,reject)=>{
      // prepare the callback:
      this.pendingGetlineCallback = (ok, line)=>{
        if(ok){
          return resolve(line);
        }
        else{
          return reject();
        }
      };
    });
  }

  async getNonemptyLine(){
    var line;
    do{
      this.enabled = true;
      line = await this.getLine();
    }while(line.length === 0);
    return line;
  }

  abort(){
    if(this.pendingGetlineCallback){
      this.pendingGetlineCallback(false, '');
    }
    this.enabled = false;
  }
}
