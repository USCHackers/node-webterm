const express = require('express')
      , bodyParser = require('body-parser')
      , csvWriter = require('csv-write-stream')
      , fs = require('fs');

let app = express()

app.use(express.static('public'))
app.use(bodyParser.json());

app.post('/attendees', (req, res) => {
  var writer = csvWriter();
  writer.pipe(fs.createWriteStream('.data/output.csv', {flags: 'a'}));
  writer.write({name: req.body.name, email: req.body.email, md5: req.body.md5});
  writer.end();
  console.log(req.body);
  res.sendStatus(200);
});

console.log('Visit http://localhost:3000')
app.listen(process.env.PORT || 3000)
