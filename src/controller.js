const Stream = require('stream');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {

  constructor(term, termContainer) {
    this.state = {};
    this.state.writing = true; // If the this is writing, don't allow user input
    this.state.currentBuffer = ""; // This is the current user input.

    this.capturedValeus = [];
    this.capturePromiseResolve = null;


    this.term = term;
    this.dest = new Stream({decodeStrings: false, encoding: 'utf-8'});
    this.dest.writable = true;
    this.term.dom(termContainer).pipe(this.dest);

    this.dest.write = this.handleCharacter.bind(this);
    this.captureInput = this.captureInput.bind(this);
  }

  handleCharacter(data) {
    if(this.state.writing) {
      console.log('Not in writing state, ignoring character');
      return;
    }

      if (data.length === 1 && data[0] === 127) {
        if(this.state.currentBuffer.length > 0) {
          this.term.write('\b');
          this.term.state.removeChar(1);
          this.state.currentBuffer =  this.state.currentBuffer.slice(0, -1);
        }
        return;
      }

      if(data.length === 1 && data[0] >= 32 && data[0] <= 125) {
        this.term.write(data);
        this.state.currentBuffer += data.toString();
      }

      if (data.length === 1 && data[0] === 13 && this.state.currentBuffer.length != 0) {
          // Finish the writing session

          this.capturedValeus.push(this.state.currentBuffer);
          this.state.currentBuffer = "";
          this.state.writing = true;
          // this.term.write('\n')
          this.term.state.setCursor(0, this.term.state.cursor.y + 1);
          this.term.state.insertLine()
          this.capturePromiseResolve();
      }
  }

  async captureInput() {
    this.state.writing = false;
    return new Promise((resolve) => {
      this.capturePromiseResolve = resolve;
    });
  }

  async typeCharacter(character, done) {
    this.term.write(character);
    await timeout(1);
  }

  async typeString(buffer) {
    // This will write to the terminal with a certain speed
    for (var i = 0; i < buffer.length; i++) {
      await this.typeCharacter(buffer[i])
    }
  }

  run() {
    (async ()=> {
      await this.typeString("USC Hacker. You are invited to come to our Hacker Orientation on 9/10.")
      await this.captureInput();
      await this.typeString("jlfjewlkfjwelk");

    })()
  }
}

module.exports = Controller;
