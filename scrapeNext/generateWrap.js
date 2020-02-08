async function run(){
    return new Promise(function(resolve,reject){
        
        const { spawn, fork } = require('child_process');
        const child = fork('./scrapeNext/generate.js');
        

        child.on('exit', function (code, signal) {
            child.kill();
            console.log("process exit "+code);
        });
        child.on('message', (m) => {
            console.log("got result from process");
            resolve(m);
        });
    });
    
}

module.exports = run;