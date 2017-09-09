const express = require('express');

let app = express();

app.use(express.static('public'))

app.get('/example.html', (req, res, next) => {
  res.end('YOOO');
});

console.log('Visit http://localhost:3000');
app.listen(process.env.PORT || 3000);
