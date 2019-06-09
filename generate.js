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
        let done = 0;
        for (let i=0; i < classes.length; i++){
            getSVG(classes[i]).then((out)=>{
                classes[i] = {
                    id:classes[i],
                    display:out.class
                }
                done++;
                
                let newClasses = [];
                for (let j=0; j < classes.length; j++){
                    if (typeof classes[j] == "object"){
                        newClasses.push(classes[j]);
                        
                    }
                }
                console.log("new",newClasses);
                fs.writeFileSync("public/classes.json",JSON.stringify(newClasses));
                
                
            });
            
            
        }
        
        
        
    });
}
module.exports();