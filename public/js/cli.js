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
    this.asterisks = false; // whether we are hiding the typed characters
    this.history = [];
    this.historyPos = 0;
    this.editPos = 0;
    this.cursorOn = false;
  }

  blink(){
    if (this.cursorOn){
      this.cursorOn = false;
      this.display();
    }
    else{
      // only blink if enabled:
      if(this.enabled){
        this.cursorOn = true;
        this.display();
      }
    }
  }

  // prompt, aka enable
  prompt(content){ // prompt the user to input something (and display static content)
    this.static = content;
    this.editable = '';
    this.enabled = true;
    this.editPos = 0;
    this.display();
  }

  promptPassword(content){
    this.static = content;
    this.editable = '';
    this.enabled = true;
    this.asterisks = true;
    this.editPos = 0;
    this.display();
  }

  toAsterisks(line){
    let ast = '';
    for(let i = 0; i < line.length; i++){
      ast += '*';
    }
    return ast;
  }

  display(){
    let displayedEditable = this.asterisks ? this.toAsterisks(this.editable) : this.editable;

    if(this.cursorOn){
      let left = displayedEditable.slice(0, this.editPos);
      let right = displayedEditable.slice(this.editPos + 1, displayedEditable.length);
      displayedEditable = left + '█' + right;
    }

    this.bigterminal.modify(this.static + displayedEditable);
  }

  // commit, aka apply and disable
  commit(){ // turn the currently typed text into a "command"
  let wasCommited = this.editable;
    if(this.asterisks){
      // hide them
      this.editable = '';
    }
    this.cursorOn = false;
    this.display();
    this.bigterminal.commit();

    // add to command history (if it makes sense)
    if(this.editable !== ''){
      if(this.history.length === 0 || this.editable !== this.history[this.history.length - 1]){
        // it's no dupe.
        // then it makes sense to add this to history.
        this.history.push(this.editable);
      }
    }
    // jump to the end of history
    this.historyPos = this.history.length;

    this.static = '';
    this.editable = '';
    this.enabled = false;
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

  }

  down(){

  }
}
