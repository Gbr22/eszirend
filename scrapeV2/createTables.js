const fs = require("fs");

let data = JSON.parse(fs.readFileSync("d.json"));

let info = data.callback_obj.changes;

let tables = {};
let class_list = {};

function getInfo(table){
    for (let i=0; i < info.length; i++){
        if (info[i].table == table){
            return info[i];
        }
    }
}

function lookup(table,id){
    let tab = getInfo(table);
    let d = tab.rows;
    for (let i=0; i < d.length; i++){
        if (d[i].id == id){
            return d[i];
        }
    }
}

if (true){
    let classes = getInfo("classes").rows;
    for (let i=0; i < classes.length; i++) {
        let c = classes[i];
        class_list[c.id] = c;
        c.teacher = lookup("teachers",c.teacherid);
        tables[c.id] = {
            days:[]
        }
        for (let j = 0; j < 6; j++){
            tables[c.id].days[j] = [];
        }
    }
}

let lessons = getInfo("lessons").rows;
for (let i=0; i < lessons.length; i++){
    let lesson = lessons[i];
    let obj = {};
    for (let j = 0; j  < lesson.classids.length; j++){
        let id = lesson.classids[j];
        let day = lookup("daysdefs",lesson.daysdefid);
        //console.log(day);
        tables[id].days[0].push({
            subject: lookup("subjects",lesson.subjectid).name,
            teacher: lookup("teachers",lesson.teacherids[0]).short,
        })
    }
}

//console.log(lookup("classes","-40"));
fs.writeFileSync("tables.json",JSON.stringify(tables));
