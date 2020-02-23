const util = require("./util");

var hash = require('object-hash');

function copy(obj){
    return JSON.parse(JSON.stringify(obj));
}

function searchInVersion(version,func){
    let tables = version.tables;
    for (let tInfo of tables){
        let t = util.getTable(tInfo.id);
        for (let [dayIndex, day] of t.timetable.entries()){
            for (let [yIndex, row] of day.entries()){
                for (let [xIndex, class_] of row.entries()){
                    func({
                        class:copy(class_),
                        yIndex,
                        xIndex,
                        dayIndex,
                        table:t
                    });
                }
            }
        }
    }
}
const fs = require("fs");
function generateForVersion(version){
    
    let teachers = [];

    searchInVersion(version,function(current){
        let teacher = current.class.teacher;
        if (!teachers.includes(teacher)){
            teachers.push(teacher);
        }
    });

    let versionInfo = copy(version);
    versionInfo.tables = [];

    for (let t of teachers){
        let timetable = [];
        for (let i = 0; i < 5; i++){
            timetable[i] = [];
        }


        let hourLabels = [];
        {
            let tables = version.tables;
            for (let tInfo of tables){
                let t = util.getTable(tInfo.id);
                for (let label of t.hourLabels){
                    hourLabels[label.hour] = label;
                    for (let d = 0; d < 5; d++){
                        timetable[d][label.hour] = [];
                    }
                }
            }
        }

        searchInVersion(version,function(current){
            let teacher = current.class.teacher;
            if (teacher == t){
                let hour = current.table.hourLabels[current.yIndex].hour;
                current.class.startHour = current.table.hourLabels[current.yIndex].hour;
                current.class.class = current.table.class;
                timetable[current.dayIndex][hour][0] = current.class;
                
            }
        });
        
        
        const firstNull = (arr) => arr[0] == null;
        if (timetable.every(firstNull)){
            timetable.map(function(day){
                day.shift();
                return day;
            })
            hourLabels.shift();
        }

        let obj = {
            header:version.text.replace(version.info,"").replace("()","").trim(),
            teacher:t,
            timetable,
            hourLabels,
        }
        let timeid = version.id;
        let id = hash({
            timeid,
            teacher:t
        }).toString();

        versionInfo.tables.push({
            header:obj.header,
            display:t,
            id:id
        })

        fs.writeFileSync(`${__dirname}/public/teachers/${id}.json`,JSON.stringify(obj));
    }
    
    return versionInfo;
}
function generate(){
    let teachers = [];
    let versions = util.getVersions();
    for (let v of versions){
        
        teachers.push(generateForVersion(v));
        
    }
    fs.writeFileSync(`${__dirname}/public/teachers.json`,JSON.stringify(teachers));
}
module.exports = generate;