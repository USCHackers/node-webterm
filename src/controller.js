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
//
//     this.hackOn = '%c\n
//     __  __     ______     ______     __  __        ______     __   __
//    /\ \_\ \   /\  __ \   /\  ___\   /\ \/ /       /\  __ \   /\  -.\ \
//    \ \  __ \  \ \  __ \  \ \ \____  \ \  _ -.     \ \ \/\ \  \ \ \-.  \
//     \ \_\ \_\  \ \_\ \_\  \ \_____\  \ \_\ \_\     \ \_____\  \ \_\\ \_\
//      \/_/\/_/   \/_/\/_/   \/_____/   \/_/\/_/      \/_____/   \/_/ \/_/
// \n'

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
    console.log(buffer.substring(0,2));
    for (var i = 0; i < buffer.length; i++) {
      await this.typeCharacter(buffer[i])
    }
  }

  run() {
    (async ()=> {
      await this.typeString("USC Hacker. You are invited to come to our Hacker Orientation on 9/20.")
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await this.typeString("Projects. ");
      await timeout(1);
      await this.typeString("Boba. ");
      await timeout(1);
      await this.typeString("Hackers. ");
      await timeout(1);
      this.term.state.setCursor(0, this.term.state.cursor.y + 2);
      await this.typeString("You down? ");
      await timeout(1);
      await this.typeString("Enter your full name: ");
      await this.captureInput();
      await this.typeString("And your usc email: ");
      await this.captureInput();
      await this.typeString("We'll see you at 7 on 9/20 in Annenberg West Lobby.");
      this.term.state.setCursor(0, this.term.state.cursor.y + 2);

      // await this.typeString(this.hackOn);
      await timeout(1);
      await this.typeString("You\'re still here? Might want to view the page source...");
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await timeout(1);
      await this.typeString("???: ");
      await this.captureInput();

      // take input and check for equality to '000242dc7a5257e1f265578cdcc6c3fd'
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await this.typeString("You were added to the list \"TOP SECRET\". We\'ll be in touch soon. Hack On.")
      // write to output.txt/csv on server-side

      return;
    })()
  }
}

module.exports = Controller;
