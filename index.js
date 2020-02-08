let generate = require("./scrapeNext/generateWrap");

const express = require('express')
const app = express()

const fs = require("fs");



try {
    fs.mkdirSync("public/tables");
} catch(err){
    console.log("Error creating tables folder",err);
}


let minutes = 10;

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

setInterval(() => {
    generate();
    console.log("next update", addMinutes(new Date(), minutes) );
}, 1000*60*minutes);

app.use(express.static(__dirname + '/public'));

 
let port = process.env.PORT || 8082;
app.listen(port);
