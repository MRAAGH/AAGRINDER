// Wrapper for canvas, allows drawing text

const PADDING = 5;
const LINE_SPACING = 30;
const CHAR_WIDTH = 17.6;
const MIN_TERMINAL_WIDTH = 200;

class Terminal {
  constructor(canvas, width, height, xpos){
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ctx = canvas.getContext("2d");
  }

  resize(w, h, xpos){
    this.width = w;
    this.height = h;
    this.xpos = xpos;
    // if(w < MIN_TERMINAL_WIDTH){
    //   // lol that is too narrow
    //   return;
    // }
    // this.canvas.width = w;
    // this.canvas.height = h;
    // $(this.canvas).attr('width', w + 'px');
    // $(this.canvas).attr('height', h + 'px');
  }

  // charHeight(){ // number of characters that fit
  //   return Math.floor((this.canvas.height - 2 * PADDING) / LINE_SPACING);
  // }
  //
  // charWidth(){ // number of characters that fit
  //   return Math.floor((this.canvas.width - 2 * PADDING) / CHAR_WIDTH) - 1;
  // }

  displayScreen(lines){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = '30px monospace';
    for(let i = 0; i < lines.length; i++){
      this.ctx.fillText(
        lines[i],
        PADDING + this.xpos * CHAR_WIDTH,
        PADDING + (i + 1) * LINE_SPACING
      );
    }
  }

  // clear(){
  //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  // }
  //
  // displayLine(line, ypos){
  //   this.ctx.fillText(line, PADDING, PADDING + (ypos + 1) * LINE_SPACING);
  // }
}
