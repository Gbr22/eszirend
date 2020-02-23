let generate = require("./scrapeNext/generateWrap");

const express = require('express')
const app = express()

const fs = require("fs");

const util = require("./util");
const genTeachers = require("./teachers");

const getVersions = require("./scrapeV2/getVersions");


try {
    fs.mkdirSync("public/tables");
} catch(err){
    console.log("Error creating tables folder",err);
}


let minutes = 60+30;

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

async function getAll(){
    let versions = await getVersions();
    
    let oldVersions = [];

    try {
        oldVersions = JSON.parse(fs.readFileSync("./public/tables.json").toString());
    } catch(err){
        console.log("tables.json does not exist");
    }
    

    function getOldVerison(search){
        for (let v of oldVersions){
            if (search.id == v.id){
                return v;
            }
        }
    }

    for (let i=0; i < versions.length; i++){
        let v = versions[i];
        let old = getOldVerison(v);

        if (old && v.current == false){
            console.log("skipping",v.text,v.id);
            v.tables = old.tables;
        } else {
            console.log("generating",v.text,v.id)
            v.tables = await generate(v.id);
        }

    }
    return versions;
}

async function inter(){

    getAll().then(function(tables){
        console.log("all tables",tables);
        fs.writeFileSync("./public/tables.json",JSON.stringify(tables));
        genTeachers();

        console.log("next update", addMinutes(new Date(), minutes) );
        setTimeout(inter, 1000*60*minutes);
    });

    
}
inter();




app.all("/api/table/:mode/:id", (req,res)=>{
    let c = util.getTable(req.params.id,req.params.mode);
    if (c == undefined){
        res.sendStatus(404);
        return;
    }
    res.send(JSON.stringify(c));
});
app.all("/api/current/:mode/:softId", (req,res)=>{
    let c = util.getCurrentTable(req.params.softId,req.params.mode);
    if (c == undefined){
        res.sendStatus(404);
        return;
    }
    res.send(JSON.stringify(util.getTable(c.id,req.params.mode)));
})

app.use(express.static(__dirname + '/public'));

 
let port = process.env.PORT || 8082;
app.listen(port);
