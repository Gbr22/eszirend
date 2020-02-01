const api = require("./mobileapi.js");

const fs = require("fs");
//api.createGuest().then(console.log);
api.loginNewGuest().then(function(d){
    console.log(d);
    fs.writeFileSync("d.json", JSON.stringify(d));
});