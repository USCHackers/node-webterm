const Stream = require('stream');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let HACK_ON = `
  __  __     ______     ______     __  __        ______     __   __
 /\\ \\_\\ \\   /\\  __ \\   /\\  ___\\   /\\ \\/ /       /\\  __ \\   /\\ "-.\\ \\
 \\ \\  __ \\  \\ \\  __ \\  \\ \\ \\____  \\ \\  _"-.     \\ \\ \\/\\ \\  \\ \\ \\-.  \\
  \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\     \\ \\_____\\  \\ \\_\\\\"\\_\\
   \\/_/\\/_/   \\/_/\\/_/   \\/_____/   \\/_/\\/_/      \\/_____/   \\/_/ \\/_/
`;

class Controller {

  constructor(term, termContainer) {
    // State
    this.printing = true; // If the this is writing, don't allow user input
    this.currentBuffer = ""; // This is the current user input.
    this.capturePromiseResolve = null;
    this.captureInputType = ""; // will be set to the input we are accepting
    this.inputValidator = null;

    // Storage
    this.capturedValues = {};

    this.hackOn = HACK_ON;

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

    if (data.length === 1 && data[0] === 13 && this.currentBuffer.length != 0) {
        // Finish the writing session
        this.printing = true;
        // Add a new line
        this.addNewLine();
        let capturedInput = this.currentBuffer;
        this.currentBuffer = "";
        this.capturePromiseResolve(capturedInput);
    }

    var isValid = true;

    for( var i = 0; i < data.length; i++) {
      if(data[i] < 32 || data[i] > 125) {
        isValid = false;
        break;
      }
    }
    if(isValid) {
      this.term.write(data);
      this.currentBuffer += data.toString();
    }

  }

  addNewLine() {
    this.term.state.setCursor(0, this.term.state.cursor.y + 1);
    this.term.state.insertLine();
  }

  async captureInput() {
    this.printing = false;
    return new Promise((resolve) => {
      this.capturePromiseResolve = resolve;
    });
  }

  async captureValidatedInput(inputType, validator) {
    while (true) {
      this.printing = false;
      let capturedInput = await new Promise((resolve) => {
        this.capturePromiseResolve = resolve;
      });
      let errorMessage = validator(capturedInput);
      if (errorMessage === null) {
        this.capturedValues[inputType] = capturedInput;
        return;
      }
      await this.typeString(errorMessage);
    }
  }

  async typeCharacter(character, done, speed) {
    this.term.write(character);
    await timeout(speed);
  }

  async typeString(buffer) {
    // This will write to the terminal with a certain speed
    for (var i = 0; i < buffer.length; i++) {
      await this.typeCharacter(buffer[i], null, 50)
    }
  }

  async typeHackOn() {
    for (var i = 0; i < this.hackOn.length; i++) {
      if(this.hackOn[i] === '\n') {
        this.addNewLine()
      } else {
        await this.typeCharacter(this.hackOn[i], null, 0);
      }
    }
    this.addNewLine()
  }

  async sendAttendeeData() {
    let response = await fetch('/attendees', {  // http://localhost:3000/attendees
      headers: {"Content-Type": 'application/json'},
      method: 'post',
      body: JSON.stringify(this.capturedValues)
    });
  }

  run() {
    (async ()=> {
      await this.typeString("USC Hacker. You are invited to come to our Hacker Orientation on 9/20.")
      await timeout(250);
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await this.typeString("Speakers. ");
      await timeout(250);
      await this.typeString("Boba. ");
      await timeout(250);
      await this.typeString("Hackers. ");
      await timeout(250);
      this.term.state.setCursor(0, this.term.state.cursor.y + 2);
      await this.typeString("You down? ");
      await timeout(250);
      await this.typeString("Enter your full name: ");
      await this.captureValidatedInput('name', (input) => {
        return null;  // no validation necessary for name
      });
      await this.typeString("And your usc email: ");
      await this.captureValidatedInput("email", (input) => {
        if(input.endsWith('@usc.edu')) {
          return null;
        } else {
          return "That is not a valid USC email. Please enter an email ending in '@usc.edu'";
        }
      });
      await this.typeString("We'll see you at 7PM on 9/20 in Annenberg West Lobby.");
      this.term.state.setCursor(0, this.term.state.cursor.y + 2);
      this.sendAttendeeData();
      await this.typeHackOn();
      this.addNewLine();
      await this.typeString(";)");
      this.addNewLine();
      await timeout(20000);
      await this.typeString("You\'re still here? Might want to view the page source...");
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await timeout(1);
      await this.typeString("???: ");
      await this.captureValidatedInput("md5", (input) => {
        if(input === '000242dc7a5257e1f265578cdcc6c3fd') {
          return null;
        } else {
          return "???: ";
        }
      });

      // take input and check for equality to '000242dc7a5257e1f265578cdcc6c3fd'
      this.term.state.setCursor(0, this.term.state.cursor.y + 1);
      await this.typeString("You were added to the list \"TOP SECRET\". We\'ll be in touch soon. Hack On.")
      // write to output.txt/csv on server-side
      this.sendAttendeeData();  // resend attendee data if they get secret
      return;
    })()
  }
}

module.exports = Controller;
