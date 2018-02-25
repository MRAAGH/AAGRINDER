// Wrapper for terminal.
// Adds println, text wrapping, output history, scrolling, dynamic last line

class BigTerminal {
  constructor(terminal){
    this.terminal = terminal;
    this.lines = []; // lines of output
    this.formatted = []; // 1 formatted line corresponds to 1 line on screen
    // (though it's not neccesarily on screen)
    this.scrollPos = 0; // index of the (formatted) line at the top
    this.dynamic = '';
    this.formattedDynamic = [];
  }

  println(content){
    this.lines.push(content);
    this.formatLine(content, this.formatted);
    this.display();
  }

  modify(content){
    this.dynamic = content;
    this.formattedDynamic = [];
    this.formatLine(this.dynamic, this.formattedDynamic);
    this.scrollToEnd();
    this.display();
  }

  commit(){
    this.println(this.dynamic);
    this.dynamic = '';
  }

  printTruncate(content){ // cut off instead of wrapping
    this.println(content.substring(0, this.terminal.width));
  }

  formatLine(line, buffer){
    let w = this.terminal.width;
    while(line.length > w){
      buffer.push(line.substring(0, w));
      line = line.substring(w);
    }
    buffer.push(line);
  }

  reformat(){ // wrap again (terminal size changed?)
    this.formatted = [];
    for(let i = 0; i < this.lines.length; i++){
      this.formatLine(this.lines[i], this.formatted);
    }
    this.formattedDynamic = [];
    this.formatLine(this.dynamic, this.formattedDynamic);
    this.display();
  }

  display(){ // display current content
    let visibleLines = [];
    for(let i = 0; i < this.terminal.height && i + this.scrollPos < this.formatted.length; i++){
      visibleLines.push(this.formatted[i + this.scrollPos]);
    }
    // is there space left at the end for displaying the dynamic line?
    if(visibleLines.length < this.terminal.height){
      for(let j = 0; j < this.formattedDynamic.length && visibleLines.length < this.terminal.height; j++){
        visibleLines.push(this.formattedDynamic[j]);
      }
    }
    this.terminal.displayScreen(visibleLines);
  }

  scrollUp(){
    if(this.scrollPos > 0){
      this.scrollPos--;
    }
    this.display();
  }

  scrollDown(){
    if(this.scrollPos + this.terminal.height < this.formatted.length + this.formattedDynamic.length){
      this.scrollPos++;
    }
    this.display();
  }

  scrollToEnd(){
    this.scrollPos = this.formatted.length + this.formattedDynamic.length - this.terminal.height;
    if(this.scrollPos < 0){
      this.scrollPos = 0;
    }
    this.display();
  }
}
