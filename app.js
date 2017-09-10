const express = require('express')

let app = express()

app.use(express.static('public'))

console.log('Visit http://localhost:3000')
app.listen(process.env.PORT || 3000)
