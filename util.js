const fs = require("fs");


function getVersions(mode){
    let map = {
        "class":"tables.json",
        "teacher":"teachers.json"
    }
    let file = map[mode] || map["class"];

    return JSON.parse(fs.readFileSync(`${__dirname}/public/${file}`));
}
function getTable(id,mode){
    let map = {
        "class":"tables",
        "teacher":"teachers"
    }
    let folder = map[mode] || map["class"];

    let file = `${__dirname}/public/${folder}/${id}.json`;
    if (fs.existsSync(file)){
        let table = JSON.parse(fs.readFileSync(file));
        table.lastScraped = fs.statSync(file).mtime;
        return table;
    }
}
function getCurrentTable(c, mode){

    let versions = getVersions(mode);
    for (let v of versions){
        if (v.current){
            for (let t of v.tables){
                if (t.display == c){
                    return t;
                }
            }
            break;
        }
    }
}


module.exports = {
    getTable,
    getCurrentTable,
    getVersions
}