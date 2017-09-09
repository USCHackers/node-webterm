const Controller = require('./src/controller.js')
const Terminal = require('terminal.js')

var termContainer = document.getElementById('terminaljs');
term = new Terminal({columns: 80, row: 24});

let controller = new Controller(term, termContainer);
controller.run();

window.onload = function(){
  var input = document.getElementById("terminaljs").focus();
}
