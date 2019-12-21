
let gentable = require("./gentable");
const fs = require("fs");

const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const resourceLoader = new (require("./resourceLoader").loader);

module.exports = function(classid){
    return new Promise(function(resolve,reject){
        let url = "https://eszi.edupage.org/timetable/view.php?fullscreen=1&class="+classid;
        request(url, {}, (err, res, body) => {
            if (err) { return console.log(err); }
            
            body = body.replace(/l\.getComputedTextLength/g,"window.getDummyWidth");
            let classes = JSON.parse('['+body.split(`"classes":[`)[1].split("]")[0]+']');
            console.log(classes);
            
            let dom = new JSDOM(body, {
                url: url,
                referrer: url,
                runScripts: "dangerously",
                pretendToBeVisual: true,
                resources: resourceLoader,
                beforeParse(window) {
                    
                    window.getDummyWidth = function(){return 1};
                    window.Element.prototype.getComputedTextLength = function(){return 1};
                    window.Element.prototype.getBBox = function(){
                        return {
                            x:parseFloat(this.getAttribute("x")),
                            y:parseFloat(this.getAttribute("y")),
                            width:parseFloat(this.getAttribute("width")),
                            height:parseFloat(this.getAttribute("height")),
                        }
                    };
                }
            });
            
            let get = [];
            let inter = setInterval(async function(){
                
                if (get.length == 0){
                    get = dom.window.document.querySelectorAll("svg");
                } else {
                    clearInterval(inter);
                    console.log("found");
                    let table = gentable(get[0]);
                    await dom.window.close();
                    
                    
                    get = undefined;
                    fs.writeFileSync("public/tables/"+classid.toString().replace("*","star")+".json",JSON.stringify(table) );
                    resolve(table);
                }
                
            },100);
            
            
            
        });
    })
    
}