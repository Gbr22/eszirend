let url = "https://eszi.edupage.org/timetable/view.php?fullscreen=1";





const fs = require("fs");
const request = require('request');

let getSVG = require("./getSVG");



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