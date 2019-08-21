let url = "https://eszi.edupage.org/timetable/view.php?fullscreen=1";





const fs = require("fs");
const request = require('request');

//let getSVG = require("./getSVG");
function getSVG(classid){
    return new Promise(function(resolve,reject){
        let file = "public/tables/"+classid.toString().replace("*","star")+".json";
        const { spawn } = require('child_process');
        const child = spawn('node', ['process.js', classid.toString()]);

        child.stdout.on('data', (data) => {
            console.log(`child stdout:\n${data}`);
        });
          
        child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
        });
        child.on('exit', function (code, signal) {

            resolve( JSON.parse(fs.readFileSync(file)) );
        });
    })
}
module.exports = function(){
    
    

    request(url, {}, async (err, res, body) => {
        if (err) { return console.log(err); }
        
        body = body.replace(/l\.getComputedTextLength/g,"window.getDummyWidth");
        let classes = JSON.parse('['+body.split(`"classes":[`)[1].split("]")[0]+']');
        console.log(classes);
        for (let i=0; i < classes.length; i++){
            let out = await getSVG(classes[i]);
            
            classes[i] = {
                id:classes[i],
                display:out.class
            }
        }
        console.log("new",classes);
        fs.writeFileSync("public/classes.json",JSON.stringify(classes));
        
        
    });
}
module.exports();