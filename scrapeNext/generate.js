

const fs = require("fs");

let getSvgs = require("./getSvgs");
let gentable = require("../gentable");
var hash = require('object-hash');

const empty = require('empty-folder');

async function run(timeid){
    if (fs.existsSync("tmp")){
        empty("tmp",false,()=>{})
    } else {
        fs.mkdirSync("tmp");
    }

    let svgs = await getSvgs(timeid);
    let tables = [];
    for (let i=0; i < svgs.length; i++){            
        let table = gentable(svgs[i]);
        let id = hash({
            timeid,
            class:table.class
        }).toString();

        tables.push({
            header:table.header,
            display:table.class,
            id:id
        })
        fs.writeFileSync("public/tables/"+id+".json",JSON.stringify(table) );
    }
    //fs.writeFileSync("./public/tables.json",JSON.stringify(tables));
    //console.log(JSON.stringify(tables));
    process.send(tables);
    process.exit(0);
}
process.on('message', (m) => {
    run(m);
});