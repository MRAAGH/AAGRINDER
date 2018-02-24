// Wrapper for terminal.
// Adds println, text wrapping, output history, scrolling,

class Cli {
  constructor(terminal){
    this.terminal = terminal;
    this.lines = []; // lines of output
    this.formatted = []; // 1 formatted line corresponds to 1 line on screen
    // (though it's not neccesarily on screen)
    this.scrollPos = 0; // index of the (formatted) line at the top
  }

  println(content){
    this.lines.push(content);
    this.formatLine(content);
    console.log(this.lines, this.formatted)
  }

  printTruncate(content){ // cut off instead of wrapping
    let truncated = truncateLine(content);
    this.lines.push(truncated);
    this.formatted.push(truncated);
  }

  formatLine(line){
    let w = this.terminal.charWidth();
    console.log(w)
    while(line.length > w){
      this.formatted.push(line.substring(0, w - 1));
      line = line.substring(w - 1);
    }
    this.formatted.push(line);
  }

  truncateLine(line){
    let w = this.terminal.charWidth();
    if(line.length > w){
      return line.substring(0, w - 1);
    }
    else {
      return line;
    }
  }

  reformat(){ // wrap again (terminal size changed?)
    this.formatted = [];
    for(let i = 0; i < this.lines.length; i++){
      formatLine(this.lines[i]);
    }
  }

  display(){ // display current content
    let visibleLines = [];
    for(let i = 0; i < this.terminal.charHeight() && i + this.scrollPos < this.formatted.length; i++){
      visibleLines.push(this.formatted[i + this.scrollPos]);
    }
    this.terminal.clear();
    this.terminal.displayScreen(visibleLines);
  }

  scrollUp(){
    if(this.scrollPos > 0){
      this.scrollPos--;
    }
  }

  scrollDown(){
    if(this.scrollPos + this.terminal.charHeight() < this.formatted){
      this.scrollPos++;
    }
  }

  scrollToEnd(){
    this.scrollPos = this.formatted.length - this.terminal.charHeight();
    if(this.scrollpos < 0){
      this.scrollPos = 0;
    }
  }
}
