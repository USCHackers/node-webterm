const Stream = require('stream');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Controller {

  constructor(term, termContainer) {
    // State
    this.printing = true; // If the this is writing, don't allow user input
    this.currentBuffer = ""; // This is the current user input.
    this.capturePromiseResolve = null;

    // Storage
    this.capturedValeus = [];

    // Setup terminal loop
    this.term = term;
    this.dest = new Stream({decodeStrings: false, encoding: 'utf-8'});
    this.dest.writable = true;
    this.term.dom(termContainer).pipe(this.dest);

    // Bind methods to `this`
    this.dest.write = this.handleCharacter.bind(this);
    this.captureInput = this.captureInput.bind(this);
  }

  handleCharacter(data) {
    if (this.printing) {
      console.trace('In writing state, ignoring character');
      return;
    }

    if (data.length === 1 && data[0] === 127) {
      if(this.currentBuffer.length > 0) {
        this.term.write('\b');
        this.term.state.removeChar(1);
        this.currentBuffer =  this.currentBuffer.slice(0, -1);
      }
      return;
    }

    if(data.length === 1 && data[0] >= 32 && data[0] <= 125) {
      this.term.write(data);
      this.currentBuffer += data.toString();
    }

    if (data.length === 1 && data[0] === 13 && this.currentBuffer.length != 0) {
        // Finish the writing session
        this.capturedValeus.push(this.currentBuffer);
        this.currentBuffer = "";
        this.printing = true;

        // Add a new line
        this.term.state.setCursor(0, this.term.state.cursor.y + 1);
        this.term.state.insertLine()
        this.capturePromiseResolve();
    }
  }

  async captureInput() {
    this.printing = false;
    return new Promise((resolve) => {
      this.capturePromiseResolve = resolve;
    });
  }

  async typeCharacter(character, done) {
    this.term.write(character);
    await timeout(25);
  }

  async typeString(buffer) {
    // This will write to the terminal with a certain speed
    for (var i = 0; i < buffer.length; i++) {
      await this.typeCharacter(buffer[i])
    }
  }

  run() {
    (async ()=> {
      await this.typeString("You are invited to come to our Hacker Orientation on 9/10.")
      await this.captureInput();
      await this.typeString("jlfjewlkfjwelk");

    })()
  }
}

module.exports = Controller;
