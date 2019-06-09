let generate = require("./generate");

const express = require('express')
const app = express()
 
let minutes = 2;
setInterval(() => {
    generate();
}, 1000*60*minutes);

app.use(express.static(__dirname + '/public'));

 
app.listen(8082);