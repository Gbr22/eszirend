let getSVG = require("./getSVG");
let id = process.argv[process.argv.length-1];
(async ()=>{
    let result = await getSVG(id);
    console.log("done");
})();