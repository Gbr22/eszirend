const fs = require("fs");




function getTable(id){
    let file = `${__dirname}/public/tables/${id}.json`;
    if (fs.existsSync(file)){
        let table = JSON.parse(fs.readFileSync(file));
        table.lastScraped = fs.statSync(file).mtime;
        return table;
    }

}
function getCurrentTableOfClass(c){
    let versions = JSON.parse(fs.readFileSync("./public/tables.json"));
    for (let v of versions){
        if (v.current){
            for (let t of v.tables){
                if (t.class == c){
                    return t;
                }
            }
            break;
        }
    }
}


module.exports = {
    getTable,
    getCurrentTableOfClass
}