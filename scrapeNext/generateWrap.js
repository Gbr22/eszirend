async function run(){
    return new Promise(function(resolve,reject){
        const { spawn } = require('child_process');
        const child = spawn('node', ['./scrapeNext/generate.js']);

        let out = "";
        child.stdout.on('data', (data) => {
            out+=data;
            console.log(`child stdout:\n${data}`);
        });
            
        child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
        });
        child.on('exit', function (code, signal) {
            child.kill();
            console.log("process exit "+code);
            resolve(out);
        });
    });
    
}

module.exports = run;
run();