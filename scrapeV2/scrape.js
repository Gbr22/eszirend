let url = "https://eszi.edupage.org/timetable/view.php?fullscreen=1";

const cheerio = require('cheerio');
const fs = require("fs");
let acorn = require("acorn");

function getInfo(){
    let info = {};

    const $ = cheerio.load(fs.readFileSync("scrapeV2/test.html"));
    let scripts = $(`script:not([src])`);

    
    for (let i=0; i < scripts.length; i++){
        let script = scripts[i];
        let contentElem = script.children[0];
        let content = contentElem.data;
        

        if (content.indexOf("ASC.req_props") != -1){
            //console.log(content);

            const vm = require('vm');
            let j = {                        
                ready:()=>{return j},
                addClass:()=>{return j},
            }
            const context = {
                ASC: {},
                $j:()=>{return j},
                document: {},
            };
            vm.createContext(context); // Contextify the object.
            vm.runInContext(content, context);

            //console.log(context.ASC);
        } else if (content.indexOf("ttviewer_options") != -1){
            //let program = acorn.parse(content).body;
            let tt = "ttviewer_options="
            content = tt+content.split(tt)[1];
            content = content.replace("});});});","});});");
            /* let remove = "});";
            n = content.lastIndexOf(remove);
            if (n >= 0 && n + remove.length >= content.length) {
                content = content.substring(0, n) + "";
            } */

            fs.writeFileSync("d.js",content);

            const vm = require('vm');
            let j = {                        
                ready:()=>{return j},
                addClass:()=>{return j},
            }
            const handler = {
                get: function(obj, prop) {
                  if (obj.hasOwnProperty(prop)){

                  } else {
                      obj[prop] = {};
                  }
                  return obj[prop];
                },
                set: function(obj,prop, value){
                    obj[prop] = value;
                }
            };
            
            const context = {
                ttviewer_options:{},
                $j:()=>{return j},
                document: {},
                callback_obj:{},
                ASC: {
                    loadBundle:()=>{},
                    requireAsync:function(req){
                        return {
                            then:function(callback){
                                callback(function(random_shit, obj){
                                    context.callback_obj = obj;
                                })
                            }
                        }
                    }
                }
            };
            const p = new Proxy(context, handler);
            
            vm.createContext(p); // Contextify the object.
            try {
                vm.runInContext(content, p);
            } catch(err){

            }
            
            //console.log(context);
            fs.writeFileSync("d.json",JSON.stringify(context));
            //console.log(program);
        }
    }

    return info;
}


getInfo();
