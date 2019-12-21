let generate = require("./generate");

const express = require('express')
const app = express()

const fs = require("fs");



try {
    fs.mkdirSync("public/tables");
} catch(err){
    console.log("Error creating tables folder",err);
}


let minutes = 25;

setInterval(() => {
    generate();
}, 1000*60*minutes);

app.use(express.static(__dirname + '/public'));

 
app.listen(8082);
