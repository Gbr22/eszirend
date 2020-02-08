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

async function getAll(){
    let current = await generate();
    return current;
}

function inter(){
    getAll().then(function(tables){
        console.log("all tables",tables);
        fs.writeFileSync("./public/tables.json",JSON.stringify(tables));
    });

    console.log("next update", addMinutes(new Date(), minutes) );
}
inter();
setInterval(inter, 1000*60*minutes);

app.use(express.static(__dirname + '/public'));

 
let port = process.env.PORT || 8082;
app.listen(port);
