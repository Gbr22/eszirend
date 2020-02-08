
const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const resourceLoader = new (require("../resourceLoader").loader);

let VIEW = "https://eszi.edupage.org/timetable/view.php";

module.exports = function(timeid){
    return new Promise(function(resolve,reject){
        let url = VIEW;
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
            
            let svgs = [];
            let current = null;
            
            let inter = setInterval(async function(){
                
                
                let nexts = dom.window.document.querySelectorAll("div.asc-ribbon-button");
                current = dom.window.document.querySelectorAll("svg")[0];
                let next = null;
                for (let i=0; i < nexts.length; i++){
                    
                    if (nexts[i].textContent == "Tovább"){
                        next = nexts[i];
                    }
                }


                if (current != null){
                    if (current.getAttribute("found") == "true"){
                        
                        if (next.classList.contains("disabled")){
                            setInterval(function(){
                                let window = dom.window;
                                window.close();

                                if (global.gc) {
                                    global.gc();
                                }
                            }, 0);
                            clearInterval(inter);
                            resolve(svgs);
                        } else {
                            next.click();
                        }
                    } else {
                        svgs.push(current);
                        console.log(svgs.length);
                    }

                    current.setAttribute("found","true")
                }

                
            },100);
            
            
            
        });
    })
    
}